const cache = require('./cache');
const authority = require('./authority');


exports.resolveFromMongo = async function resolveFromMongo(name, type) {
  return new Promise(resolve => {
    dnsQuery = cache.cacheSearch(name, type).then(dnsRecord => {
      if (dnsRecord.length < 1) {
        dnsQuery = authority.authoritySearch(name, type).then(dnsRecord => {
          resolve(dnsRecord)
        })
      } else {
        resolve(dnsRecord);
      }
    })
  })
}
