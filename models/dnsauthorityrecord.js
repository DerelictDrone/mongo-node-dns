const mongoose = require('mongoose');

const DNSAuthority = mongoose.Schema({
  name: {type: String, required: true},
  type: {type: Number, required: true},
  data: {type: Object, required: true},
  ttl: {type: Number, required: true},
},
{ collection: 'authoritative' });

module.exports = mongoose.model('authoritative', DNSAuthority);
