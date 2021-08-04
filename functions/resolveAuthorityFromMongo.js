const authority = require('./authority');


exports.resolveFromMongo = async function resolveFromMongo(name, type) {
  return new Promise(resolve => {
    let dnsRecord;
    dnsRecord = authority.authoritySearch(name, type).then(dnsRecord => {
      console.log(dnsRecord)
      resolve(dnsRecord)
    })
  })
}
