# Mongo-Node-DNS

UDP DNS Resolver put together from the DNS2 package by lsong.
Utilizes MongoDB as a cache and archive(optional), split into 3 separate servers.


# server.js

Handles requests, checking their cache on mongoDB first, next checking for authority records, lastly forwards requests to an array of nameservers on a port of your choosing. If nameservers can't answer the question, the resolver will return a joke(see jokes.js for list) to prevent retrying.

# server-authority-only.js

Handles requests, checking only the authority records, and returning a joke if none match.

# server-forward-only.js

Forwards any requests to nameservers, returning the response. Doesn't require MongoDB or Mongoose, but supports forcing TTL.
