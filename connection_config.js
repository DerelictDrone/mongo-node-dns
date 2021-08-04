/*
Port the resolving server is responsive to, the forward-only server will use it to contact the resolving/caching
server as well.
*/
exports.port = "54" // non-standard listening port, so you can use this in conjunction with the auth-only version


// Controls whether or not requests will be archived

exports.archive = true

// Blanket TTL delivered on cached requests

forcedTTL = [300,true]

exports.isTTLForced = function(TTL) {
  if(forcedTTL[1]) {
    return forcedTTL[0]
  }
  else {
    return TTL
  }
}

/*
these are used for forming a connection string in app.js, they are formed like this:
"mongodb://" + MongoPostUser + ":" + MongoPostPass + "@" + MongoServer + MongoPort + MongoArgs
If you only have a connection string, try to split it up into these fields and paste them into the spots below
*/
exports.mongoserver = "127.0.0.1"
exports.mongoport = "27017"
exports.mongopostuser = "user"
exports.mongopostpass = "pass"
exports.mongoargs = "/DNS?authSource=admin&readPreference=primary&appname=dns-nodehandler&ssl=false"
