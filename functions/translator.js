const {
  Packet
} = require('dns2')

// Takes number & string, number to be translated and what to translate it from, to get a name from any type or class.
exports.classTranslate = function (translate, codex) {
  types = Object.values(Packet[codex]);
  names = Object.keys(Packet[codex]);
  index = types.indexOf(translate)
  if (index > -1) {
    return names[index]
  } else {
    return translate
  }
}

// dictionary of headers+numbered statuses
headerDictionary = {
  opcode: ['\033[38;5;166mQuery', '033[38;5;55mInverse Query(Deprecated!)', '\033[38;5;27mStatus', '\033[38;5;53mOpcode 3(Not in use)', '\033[38;5;33mNotify', '\033[38;5;202mUpdate'],
  aa: ['\033[38;5;94mNon-Authoritative', '\033[38;5;208mAuthoritative'],
  tc: ['\033[38;5;34mNot Truncated', '\033[38;5;196mTruncated'],
  rd: ['\033[38;5;88mNo Recursion', '\033[38;5;28mRecursion Requested'],
  ra: ['\033[38;5;160mRecursion Unsupported', '\033[38;5;154mRecursion Supported'],
  rcode: ['\033[38;5;46mSuccess', '\033[38;5;124mServer reports malformed request', '\033[38;5;126mServer failed', '\033[38;5;24mName doesn\'t exist', '\033[38;5;166mUnsupported Query Type', '\033[38;5;9mRefused', '\033[38;5;96mName shouldn\'t exist', '\033[38;5;96mResource shouldn\'t exist', '\033[38;5;161mResource should exist, but doesn\'t', '\033[38;5;58mNot Authoritative', '\033[38;5;220mNot all questions are in zone'],
}

exports.headerStrings = function (headers) {
  headerValues = Object.values(headers);
  headerKeys = Object.keys(headers);
  let results = {};
  for (let i = 0; i < headerKeys.length; i++) {
    if (typeof (headerDictionary[headerKeys[i]]) === 'object') {
      results[headerKeys[i]] = headerDictionary[headerKeys[i]][headerValues[i]] + '\033[0m' //Object['objectKeyName'] = Object['objectKeyName'][arrayIndex], what a nightmare.
    }
  }
  return results
}

exports.deMongo = function (mongoObject) {
  result = mongoObject['_doc'];
  return result
}
