const dns2 = require('dns2');
const cfg = require("./connection_config.js");
const {
  classTranslate
} = require('./functions/translator.js');
const jokes = require('./jokes.js');

const options = {
  // available options
  dns: cfg.nameservers[0],
  nameServers: cfg.nameservers,
  port: cfg.port
};

const dns = new dns2(options);

const {
  Packet
} = dns2;

const server = dns2.createUDPServer((request, send, rinfo) => {
  const response = Packet.createResponseFromRequest(request);
  const [question] = request.questions;
  const {
    name
  } = question;
  const {
    type
  } = question;

  if (cfg.blacklist.indexOf(rinfo.address) > -1) {
    response.answers.push({
      name: 'Refused',
      type: 16,
      class: Packet.CLASS.IN,
      ttl: 1,
      data: 'Your request has been refused' + `${cfg.blacklistReferral ? ', if you have any questions, contact the responsible person below.' : '.'}`
    })
    if (cfg.blacklistReferral) {
      response.answers.push(cfg.blacklistReferralSOA)
    }
    response.header.rcode = 0x05;
    send(response)
    console.log('\033[38;5;160mRefused blacklisted address: \033[38;5;184m' + cfg.blacklist[cfg.blacklist.indexOf(rinfo.address)] + ' \033[38;5;160mrequest ID: \033[38;5;184m' + response.header.id + '\033[0m')
  } else {

    typeName = classTranslate(type, 'TYPE');

    dnsRecords = dns.resolve(name, typeName).then(answer => {
      dnsRecords = answer.answers;
      if (dnsRecords.length < 1) { // Error, so we're gonna give them a joke as a response.
        response.answers.push({
          name: "Error",
          type: 16,
          class: Packet.CLASS.IN,
          ttl: 1,
          data: "DNS failed to resolve, so here's a joke."
        });
        rng = Math.floor((Math.random() * jokes.setups.length) + 0);
        response.answers.push({
          name: "Setup",
          type: 16,
          class: Packet.CLASS.IN,
          ttl: 1,
          data: jokes.setups[rng]
        });
        response.answers.push({
          name: "Punchline",
          type: 16,
          class: Packet.CLASS.IN,
          ttl: 1,
          data: jokes.punchlines[rng]
        });
        response.header.rcode = 0x03
        send(response);
      } else {
        for (let i = 0; i < dnsRecords.length; i++) {
          dnsRecord = dnsRecords[i];
          keys = Object.keys(dnsRecord);
          values = Object.values(dnsRecord);
          let servedObject = {}
          for (let i = 0; i <= keys.length - 1; i++) {
            servedObject[keys[i]] = values[i]
          }
          servedObject.ttl = cfg.isTTLForced(dnsRecord.ttl)
          response.answers.push(servedObject)
          if (i + 1 === dnsRecords.length) {
            send(response)
            console.log(response)
          }
        }
      }
    })
  }
})

server.on('request', (request, response, rinfo) => {
  console.log(request.header.id, request.questions[0]);
});

// Listens on port 53 for requests but can forward to server.js on a user-defined port
server.listen(53);
