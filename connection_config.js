/*
Port the resolving server is responsive to, the forward-only server will use it to contact the resolving/caching
server as well.
*/
exports.port = "54" // non-standard listening port, so you can use this and the auth-only version on the same system

// Array of nameserver IP's in strings
exports.nameservers = ['127.0.0.1']

// Controls whether or not requests will be archived

exports.archive = false

/*
Blanket TTL delivered on cached requests, if index 2 is true any and all TTL's delivered by this server are replaced
Note: Affects both server-forwardonly and server.js, server-authorityonly will never force TTL since you're already
setting the TTL on a per-record basis.
*/
forcedTTL = [300, false]

exports.isTTLForced = function (TTL) {
  if (forcedTTL[1]) {
    return forcedTTL[0]
  } else {
    if (typeof (TTL) === 'object') {
      actualTTL = TTL.getSeconds() - new Date(Date.now()).getSeconds()
      return actualTTL
    } else {
      return TTL
    }
  }
}

// Minimum TTL acceptable in seconds
exports.minTTL = 1200

// Function run on unacceptably low TTL's before caching. Return a TTL in seconds
exports.minTTLOverride = function (TTL) {
  return TTL * 5
}

/*
These are used for forming a connection string in app.js, they are formed like this:
"mongodb://" + MongoPostUser + ":" + MongoPostPass + "@" + MongoServer + MongoPort + MongoArgs
If you only have a connection string, try to split it up into these fields and paste them into the spots below
*/
exports.mongoserver = "127.0.0.1"
exports.mongoport = "27017"
exports.mongopostuser = "user"
exports.mongopostpass = "pass"
exports.mongoargs = "/DNS?authSource=admin&readPreference=primary&appname=dns-nodehandler&ssl=false"

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
