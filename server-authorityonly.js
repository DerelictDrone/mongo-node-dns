const dns2 = require('dns2');
const mongoose = require('mongoose');
const cfg = require("./connection_config_auth.js");
const mongoCache = require('./functions/resolveAuthorityFromMongo');
const jokes = require('./jokes.js');
console.log("mongodb://" + cfg.mongopostuser + ":" + cfg.mongopostpass + "@" + cfg.mongoserver + ":" + cfg.mongoport + cfg.mongoargs)
mongoose.connect(
  "mongodb://" +
  cfg.mongopostuser +
  ":" +
  cfg.mongopostpass +
  "@" +
  cfg.mongoserver +
  ":" +
  cfg.mongoport +
  cfg.mongoargs, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
  }
).then(res => console.log("We are now connected to the DB")).catch(err => console.log(err))

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

    mongoCache.resolveFromMongo(name, type).then(dnsRecords => {
      if (dnsRecords.length < 1) {
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

        let sizedTXT
        for (let i = 0; i < dnsRecords.length; i++) {
          dnsRecord = dnsRecords[i];
          if (type === 16 && dnsRecord.data.data != undefined || type === 46 && dnsRecord.data.data != undefined) {
            sizedTXT = dnsRecords.data;
            if (dnsRecord.data.data.length > 250) {
              sizedTXT = [];
              charArray = dnsRecord.data.data.split('');
              let charSet = [];
              let chars = 0;
              for (let i = 0; i < charArray.length; i++) {
                charSet.push(charArray[i])
                if (chars === 250) {
                  chars = 0;
                  stringified = charSet.join('');
                  sizedTXT.push(stringified);
                  charSet = [];
                }
                chars++
              }
            }
          }
          dnsRecord = deMongo(dnsRecord)
          datakeys = Object.keys(dnsRecord.data);
          datavalues = Object.values(dnsRecord.data);
          delete dnsRecord.data; // no longer needed
          keys = Object.keys(dnsRecord);
          values = Object.values(dnsRecord);
          let servedObject = {}
          for (let i = 0; i <= keys.length - 2; i++) {
            servedObject[keys[i]] = values[i]
          }
          for (let i = 0; i <= datakeys.length - 1; i++) {
            servedObject[datakeys[i]] = datavalues[i]
          }
          servedObject.ttl = cfg.isTTLForced(dnsRecord.ttl)
          response.answers.push(servedObject)
        }
        if (i + 1 === dnsRecords.length) {
          console.log(response)
          response.header.ancount = response.answers.length
          response.header.aa = 0x01
          send(response)
        }
      }
    })
  }
})


server.on('request', (request, response, rinfo) => {
  console.log(request.header.id, request.questions[0]);
});
server.listen(cfg.port);
