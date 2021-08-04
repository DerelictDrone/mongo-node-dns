const dnsArchivedRecord = require('../models/dnsarchivedrecord.js');

exports.archiveRecord = function archiveRecord(dnsRecord) {
  const archived = new dnsArchivedRecord({
    name: dnsRecord.name,
    type: dnsRecord.type,
    data: {
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
    },
    ttl: dnsRecord.ttl,
    cachedAt: Date.now()
  })
  archived.save().then(archived => {
    // console.log(dnsRecord.name + " was Archived!")
  })
}
