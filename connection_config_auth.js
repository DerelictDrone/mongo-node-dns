// Port the authority server is responsive to.

exports.port = "53"

/*
These are used for forming a connection string in app.js, they are formed like this:
"mongodb://" + MongoPostUser + ":" + MongoPostPass + "@" + MongoServer + MongoPort + MongoArgs
If you only have a connection string, try to split it up into these fields and paste them into the spots below
*/
exports.mongoserver = "127.0.0.1"
exports.mongoport = "27017"
exports.mongopostuser = "user"
exports.mongopostpass = "pass"
exports.mongoargs = "/DNS?authSource=admin&readPreference=primary&appname=dnsauth-nodehandler&ssl=false"


const {
  Packet
} = require('dns2')
// Put any IP address string here in this array to refuse service to them.
exports.blacklist = []
/*
Whether or not to include an SOA record, so anyone digging this can get an email address to contact you with.
In theory, to appeal their blacklisted status
*/
exports.blacklistReferral = false
// SOA record to serve if the above value is TRUE
exports.blacklistReferralSOA = {
  name: 'soa.test.com',
  type: 6,
  class: Packet.CLASS.IN,
  ttl: 1,
  primary: "ns1.test.com",
  admin: "example@test.com",
  serial: 1624405482,
  refresh: 600,
  retry: 800,
  expiration: 6000,
  minimum: 60
}
