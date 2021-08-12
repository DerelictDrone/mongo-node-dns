const dns2 = require('dns2');
const mongoose = require('mongoose');
const mgcfg = require("./connection_config.js");
const cache = require('./functions/cache');
const archive = require('./functions/archive');
const { classTranslate, deMongo } = require('./functions/translator');
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
  dns: mgcfg.nameservers[0],
  nameServers: mgcfg.nameservers,
  port: 53,
};

const dns = new dns2(options);

const { Packet } = dns2;

const server = dns2.createUDPServer((request, send, rinfo) => {
  const response = Packet.createResponseFromRequest(request);
  const [question] = request.questions;
  const { name } = question;
  const { type } = question;

  mongoCache.resolveFromMongo(name, type).then(dnsRecord => {
    if (dnsRecord.length < 1) {

      typeName = classTranslate(type,'TYPE')

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
            keys = Object.keys(dnsRecord);
            values = Object.values(dnsRecord);
            let servedObject = {}
            for(let i = 0; i <= keys.length-1; i++) {
              servedObject[keys[i]] = values[i]
            }
              servedObject.ttl = mgcfg.isTTLForced(dnsRecord.ttl)
              if(servedObject.data != undefined && servedObject.data != null) {
                servedObject.data = sizedTXT
              }
              response.answers.push(servedObject)
            if (i + 1 === dnsRecords.length) {
              send(response)
              console.log(response)
            }
          }
          for (let i = 0; i < dnsRecords.length; i++) {
            dnsRecord = dnsRecords[i];
            cache.cacheRecord(dnsRecord);
            if(mgcfg.archive) {
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
        dnsRecord = deMongo(dnsRecord)
        datakeys = Object.keys(dnsRecord.data);
        datavalues = Object.values(dnsRecord.data);
        delete dnsRecord.data; // no longer needed
        keys = Object.keys(dnsRecord);
        values = Object.values(dnsRecord);
        let servedObject = {}
        for(let i = 0; i <= keys.length-2; i++) {
          servedObject[keys[i]] = values[i]
        }
        for(let i = 0; i <= datakeys.length-1; i++) {
          servedObject[datakeys[i]] = datavalues[i]
        }
          servedObject.ttl = mgcfg.isTTLForced(dnsRecord.ttl)
          response.answers.push(servedObject)
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
          keys = Object.keys(dnsRecord);
          values = Object.values(dnsRecord);
          datakeys = Object.keys(dnsRecord.data);
          datavalues = Object.values(dnsRecord.data);
          let servedObject = {}
          for(let i = 0; i <= keys.length-2; i++) {
            servedObject[keys[i]] = values[i]
          }
          for(let i = 0; i <= datakeys.length-1; i++) {
            servedObject[datakeys[i]] = datavalues[i]
          }
            servedObject.ttl = mgcfg.isTTLForced(dnsRecord.ttl)
            response.answers.push(servedObject)
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
