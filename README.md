# Mongo-Node-DNS

UDP DNS Resolver put together from the DNS2 package by lsong(song940).
Utilizes MongoDB as a cache and archive(optional), split into 3 separate servers.

# Setting up your mongoDB Database

This resolver requires 2 collections, and has 1 optional collection:

archived - Holds all archived DNS records, with their original TTL and has a date object of when they were cached. This collection can get pretty big since it doesn't clear naturally!

cached - Holds all cached DNS records and serves them, replacing TTL with a date object which is now+original TTL in seconds, which is used with an index stating that it will expire once this date time object is in the past.

authoritative - Doesn't get written to by the node DNS client, has to be written to manually and is used for serving records that we should be the authority on, and is the second place server.js will look, after checking cached.

# server.js

Handles requests, checking their cache on mongoDB first, next checking for authority records, lastly forwards requests to an array of nameservers on a port of your choosing. If nameservers can't answer the question, the resolver will return a joke(see jokes.js for list) to prevent retrying and supports forcing TTL.

# server-authority-only.js

Handles requests, checking only the authority records, and returning a joke if none match.

# server-forward-only.js

Forwards any requests to nameservers, returning the response. Doesn't require MongoDB or Mongoose, but supports forcing TTL.
