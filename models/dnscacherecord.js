const mongoose = require('mongoose');

const DNSCached = mongoose.Schema({
  name: {type: String, required: true},
  type: {type: Number, required: true},
  data: {type: Object, required: true},
  ttl: {type: Date, required: true},
},
{ collection: 'cached' });

module.exports = mongoose.model('cached', DNSCached);
