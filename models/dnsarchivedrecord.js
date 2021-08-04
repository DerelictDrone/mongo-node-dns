const mongoose = require('mongoose');

const DNSArchived = mongoose.Schema({
  name: {type: String, required: true},
  type: {type: Number, required: true},
  data: {type: Object, required: true},
  ttl: {type: Number, required: true},
  cachedAt: {type: Date, required: true}
},
{ collection: 'archived' });

module.exports = mongoose.model('archive', DNSArchived);
