const dnsAuthorityRecords = require('../models/dnsauthorityrecord')

exports.authoritySearch = async function authoritySearch(name, type) {
  return new Promise(resolve => {
    let dnsRecord;
    name = name.toLowerCase()
    // Handle CNAME resolving.
    if (type !== 5) {
      const dnsAuthorityQuery = dnsAuthorityRecords.find({
        name: {
          $eq: name
        },
        type: {
          $eq: type
        }
      });
      dnsAuthorityQuery.then(document => {
        dnsRecord = document;
        // Fall back to CNAME if we failed to find any records of a non-cname type, also supports a potentially non-RFC compliant handling
        // Basically, we can get any record of any type now, so long as it is the SAME name as the request.
        if (dnsRecord.length < 1) {
          const dnsAuthorityCNAMEQuery = dnsAuthorityRecords.find({
            name: {
              $eq: name
            },
            type: {
              $eq: 5
            }
          });
          dnsAuthorityCNAMEQuery.then(document => {
            let cName;
            if (document.length >= 1) {
              cName = document[0];
              domain = cName.data.domain;
              const dnsAuthorityNameQuery = dnsAuthorityRecords.find({
                name: {
                  $eq: domain
                },
                type: {
                  $eq: type
                }
              });
              dnsAuthorityNameQuery.then(document => {
                let dnsRecord = [cName];
                for (let i = 0; i < document.length; i++) {
                  dnsRecord.push(document[i])
                }
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
      const dnsAuthorityCNAMEQuery = dnsAuthorityRecords.find({
        name: {
          $eq: name
        },
        type: {
          $eq: type
        }
      });
      dnsAuthorityCNAMEQuery.then(document => {
        let cName;
        cName = document[0];
        domain = cName.data.domain;
        const dnsAuthorityNameQuery = dnsAuthorityRecords.find({
          name: {
            $eq: domain
          },
        });
        dnsAuthorityNameQuery.then(document => {
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
