const dns2 = require('dns2');
const cfg = require("./connection_config.js");
const jokes = require('./jokes.js');

const options = {
  // available options
  dns: cfg.nameservers[0],
  nameServers: cfg.nameservers,
  port: cfg.port,
};

const dns = new dns2(options);

const { Packet } = dns2;

const server = dns2.createUDPServer((request, send, rinfo) => {
  const response = Packet.createResponseFromRequest(request);
  const [ question ] = request.questions;
  const { name } = question;
  const { type } = question;

    let typeName;
        switch(type) {
          case 1: {typeName = "A"; break};
          case 2: {typeName = "NS"; break};
          case 5: {typeName = "CNAME"; break};
          case 6: {typeName = "SOA"; break};
          case 7: {typeName = "MB"; break};
          case 8: {typeName = "MG"; break};
          case 9: {typeName = "MR"; break};
          case 10: {typeName = "NULL"; break};
          case 11: {typeName = "WKS"; break};
          case 12: {typeName = "PTR"; break};
          case 13: {typeName = "HINFO"; break};
          case 14: {typeName = "MINFO"; break};
          case 15: {typeName = "MX"; break};
          case 16: {typeName = "TXT"; break};
          case 28: {typeName = "AAAA"; break};
          case 33: {typeName = "SRV"; break};
          case 99: {typeName = "SPF"; break};
          case 253: {typeName = "MAILB"; break};
          case 254: {typeName = "MAILA"; break};
          case 255: {typeName = "ANY"; break};
          default: {console.log("we didn't understand that type, here's the number " + type)}};

        dnsRecords = dns.resolve(name, typeName).then(answer => {
          dnsRecords = answer.answers;
          if(dnsRecords.length < 1) { // Error, so we're gonna give them a joke as a response.
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
            send(response);
          } else {
          for(let i = 0; i < dnsRecords.length; i++) {
            dnsRecord = dnsRecords[i];
              response.answers.push({
            name: dnsRecord.name,
            type: dnsRecord.type,
            class: Packet.CLASS.IN,
            ttl: cfg.isTTLForced(dnsRecord.ttl),
            service: dnsRecord.service,
            proto: dnsRecord.proto,
            port: dnsRecord.port,
            target: dnsRecord.target,
            weight: dnsRecord.weight,
            primary: dnsRecord.primary,
            admin: dnsRecord.admin,
            serial: dnsRecord.serial,
            refresh: dnsRecord.refresh,
            retry: dnsRecord.retry,
            expiration: dnsRecord.expiration,
            minimum: dnsRecord.minimum,
            address: dnsRecord.address,
            domain: dnsRecord.domain,
            priority: dnsRecord.priority,
            exchange: dnsRecord.exchange,
            ns: dnsRecord.ns,
            data: dnsRecord.data
          })
          if(i+1 === dnsRecords.length) {
            send(response)
            console.log(response)
          }
        }}})})

server.on('request', (request, response, rinfo) => {
  console.log(request.header.id, request.questions[0]);
});

// Listens on port 53 for requests but can forward to server.js on a user-defined port
server.listen(53);
