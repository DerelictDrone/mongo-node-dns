const dnsCacheRecords = require('../models/dnsCacheRecord');
const cfg = require('../connection_config')

exports.cacheRecord = function cacheRecord(dnsRecord) {
  const later = new Date();
  if (dnsRecord.ttl < cfg.minTTL) {
    later.setSeconds(cfg.minTTLOverride(dnsRecord.ttl))
  } else {
    later.setSeconds(dnsRecord.ttl)
  };
  const cached = new dnsCacheRecords({
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
    ttl: later
  })
  cached.save().then(cached => {
    console.log(dnsRecord.name + " was Cached!")
  })
};

exports.cacheSearch = async function cacheSearch(name, type) {
  return new Promise(resolve => {
    let dnsRecord;
    // Handle CNAME resolving.
    if (type !== 5) {
      const dnsCacheQuery = dnsCacheRecords.find({
        name: {
          $eq: name
        },
        type: {
          $eq: type
        }
      });
      dnsCacheQuery.then(document => {
        dnsRecord = document;
        // Fall back to CNAME if we failed to find any records of a non-cname type, also supports a potentially non-RFC compliant handling
        // Basically, we can get any record of any type now, so long as it is the SAME name as the request.
        if (dnsRecord.length < 1) {
          const dnsCacheCNAMEQuery = dnsCacheRecords.find({
            name: {
              $eq: name
            },
            type: {
              $eq: 5
            }
          });
          dnsCacheCNAMEQuery.then(document => {
            let cName;
            if (document.length >= 1) {
              cName = document[0];
              domain = cName.data.domain;
              const dnsCacheNameQuery = dnsCacheRecords.find({
                name: {
                  $eq: domain
                },
                type: {
                  $eq: type
                }
              });
              dnsCacheNameQuery.then(document => {
                let dnsRecord = [cName];
                for (let i = 0; i < document.length; i++) {
                  dnsRecord.push(document[i])
                }
                console.log(dnsRecord);
                resolve(dnsRecord);
              })
            }
            resolve(dnsRecord);
          })
        } else {
          console.log(dnsRecord);
          resolve(dnsRecord);
        }
      })
    } else {
      const dnsCacheCNAMEQuery = dnsCacheRecords.find({
        name: {
          $eq: name
        },
        type: {
          $eq: type
        }
      });
      dnsCacheCNAMEQuery.then(document => {
        let cName;
        cName = document[0];
        domain = cName.data.domain;
        const dnsCacheNameQuery = dnsCacheRecords.find({
          name: {
            $eq: domain
          },
        });
        dnsCacheNameQuery.then(document => {
          let dnsRecord = [cName];
          for (let i = 0; i < document.length; i++) {
            dnsRecord.push(document[i]);
          }
          console.log(dnsRecord);
          resolve(dnsRecord);
        })
      })
    }
  })
}
