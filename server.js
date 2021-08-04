const dns2 = require('dns2');
const mongoose = require('mongoose');
const mgcfg = require("./connection_config.js");
const cache = require('./functions/cache');
const archive = require('./functions/archive');
const mongoCache = require('./functions/resolveFromMongo');
const jokes = require('./jokes.js');
console.log("mongodb://" + mgcfg.mongopostuser + ":" + mgcfg.mongopostpass + "@" + mgcfg.mongoserver + ":" + mgcfg.mongoport + mgcfg.mongoargs)
mongoose.connect(
  "mongodb://" +
  mgcfg.mongopostuser +
  ":" +
  mgcfg.mongopostpass +
  "@" +
  mgcfg.mongoserver +
  ":" +
  mgcfg.mongoport +
  mgcfg.mongoargs, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
  }
).then(res => console.log("We are now connected to the DB")).catch(err => console.log(err))


const options = {
  // available options
  dns: "127.0.0.1",
  nameServers: [
    //'192.168.68.104'
    '127.0.0.1'
  ],
  port: 53,
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

  mongoCache.resolveFromMongo(name, type).then(dnsRecord => {
    if (dnsRecord.length < 1) {
      let typeName;
      switch (type) {
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
          send(response);
        } else {
          let sizedTXT
          for (let i = 0; i < dnsRecords.length; i++) {
            dnsRecord = dnsRecords[i];
            if (type === 16 && dnsRecord.data != undefined) {
              sizedTXT = dnsRecords.data;
              if (dnsRecord.data.length > 250) {
                sizedTXT = [];
                charArray = dnsRecord.data.split('');
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

            console.log(dnsRecord);
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
              data: sizedTXT
            })
            if (i + 1 === dnsRecords.length) {
              send(response)
              console.log(response)
            }
          }
          for (let i = 0; i < dnsRecords.length; i++) {
            dnsRecord = dnsRecords[i];
            cache.cacheRecord(dnsRecord);
            if(cfg.archive) {
              archive.archiveRecord(dnsRecord);
            }
          }
        }
      })
    } else {
      dnsRecords = dnsRecord
      let iterations = 0;
      for (let i = 0; i < dnsRecords.length; i++) {
        dnsRecord = dnsRecords[i];
        iterations = i;
        let sizedTXT;
        if (type === 16 && dnsRecord.data.data != undefined) {
          sizedTXT = dnsRecord.data.data;
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
        response.answers.push({
          name: dnsRecord.name,
          type: dnsRecord.type,
          class: Packet.CLASS.IN,
          ttl: cfg.isTTLForced(dnsRecord.ttl),
          service: dnsRecord.data.service,
          proto: dnsRecord.data.proto,
          port: dnsRecord.data.port,
          target: dnsRecord.data.target,
          weight: dnsRecord.data.weight,
          primary: dnsRecord.data.primary,
          admin: dnsRecord.data.admin,
          serial: dnsRecord.data.serial,
          refresh: dnsRecord.data.refresh,
          retry: dnsRecord.data.retry,
          expiration: dnsRecord.data.expiration,
          minimum: dnsRecord.data.minimum,
          address: dnsRecord.data.address,
          domain: dnsRecord.data.domain,
          priority: dnsRecord.data.priority,
          exchange: dnsRecord.data.exchange,
          ns: dnsRecord.data.ns,
          data: sizedTXT
        })
      }
      if (iterations + 1 === dnsRecords.length) {
        send(response)
        console.log(response)
      } else {
        dnsRecords = dnsRecord
        let sizedTXT
        for (let i = 0; i < dnsRecords.length; i++) {
          dnsRecord = dnsRecords[i];
          if (type === 16 && dnsRecord.data.data != undefined) {
            sizedTXT = dnsRecord.data.data
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
          response.answers.push({
            name: dnsRecord.name,
            type: dnsRecord.type,
            class: Packet.CLASS.IN,
            ttl: cfg.isTTLForced(dnsRecord.ttl),
            service: dnsRecord.data.service,
            proto: dnsRecord.data.proto,
            port: dnsRecord.data.port,
            weight: dnsRecord.data.weight,
            primary: dnsRecord.data.primary,
            admin: dnsRecord.data.admin,
            serial: dnsRecord.data.serial,
            refresh: dnsRecord.data.refresh,
            retry: dnsRecord.data.retry,
            expiration: dnsRecord.data.expiration,
            minimum: dnsRecord.data.minimum,
            address: dnsRecord.data.address,
            domain: dnsRecord.data.domain,
            priority: dnsRecord.data.priority,
            exchange: dnsRecord.data.exchange,
            ns: dnsRecord.data.ns,
            data: sizedTXT
          })
          if (i + 1 === dnsRecords.length) {
            send(response)
            console.log(response)
          }
        }
      }
    }
  })
});

server.on('request', (request, response, rinfo) => {
  console.log(request.header.id, request.questions[0]);
});

server.listen(mgcfg.port);
