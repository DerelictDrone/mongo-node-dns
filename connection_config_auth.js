
// Port the authority server is responsive to.

exports.port = "53"

/*
these are used for forming a connection string in app.js, they are formed like this:
"mongodb://" + MongoPostUser + ":" + MongoPostPass + "@" + MongoServer + MongoPort + MongoArgs
If you only have a connection string, try to split it up into these fields and paste them into the spots below
*/
exports.mongoserver = "127.0.0.1"
exports.mongoport = "27017"
exports.mongopostuser = "user"
exports.mongopostpass = "pass"
exports.mongoargs = "/DNS?authSource=admin&readPreference=primary&appname=dnsauth-nodehandler&ssl=false"
