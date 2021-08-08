const { Packet } = require('dns2')

// Takes number & string, number to be translated and what to translate it from, to get a name from any type or class.
exports.classTranslate = function(translate,codex) {
  types = Object.values(Packet[codex]);
  names = Object.keys(Packet[codex]);
  index = types.indexOf(translate)
  if(index > -1) {
    return names[index]
  } else {
    return translate
  }
}
