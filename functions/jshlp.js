const { writeFileSync, readFileSync} = require('fs')
// first byte is encoding in use.
// 0x00 = latin1
// 0x01 = ansi
// 0x02 = utf8
// 0x03 = hex
// 0x04 = ucs2
// 0x05 = utf16 little endian

exports.writeJSHELP = function(text,encoding,name) {
encoding = Buffer.allocUnsafe(1)
encoding[0] = encoding

words = text.split(' ')
dictionary = [];
sequence = [];
for(let i = 0; i < words.length; i++) {
  dIndex = dictionary.indexOf(words[i])
if(dIndex === -1) {
  dictionary[dictionary.length] = words[i];
  sequence[sequence.length] = dictionary.indexOf(words[i]);
} else {
  sequence[sequence.length] = dIndex
}}

controlCodes = [0x01,0xFD]
dictionarySequence = Buffer.allocUnsafe(dictionary.join(',').length+1)
let lastLength = 0;
for(let i = 0; i < dictionary.length; i++) {
  currLength = dictionary[i].length+1;
  divider = currLength+lastLength-1
  dictionarySequence.write(dictionary[i], lastLength, currLength)
  dictionarySequence[divider] = controlCodes[0]
  lastLength = lastLength+currLength
}

dictionarySequence[dictionarySequence.length-1] = controlCodes[1]

encodeSequence = Buffer.allocUnsafe(sequence.length)
for(let i = 0; i < sequence.length; i++) {
  encodeSequence[i] = sequence[i]
}

encoding = Buffer.allocUnsafe(1)
encoding[0] = 0x00;

fullSequence = Buffer.from(encoding+dictionarySequence+encodeSequence, 'latin1')
writeFileSync(name+'.jshlp',fullSequence,function(){process.stdout.write('Woohoo!')})
}

exports.readJSHELP = function(filename) {
fullSequence = readFileSync('./helptopics/'+filename+'.jshlp',function(data){return data})
let headers = true;
let byte;
let decodedEncoding;
// 0x00 = latin1
// 0x01 = ansi
// 0x02 = utf8
// 0x03 = hex
// 0x04 = ucs2
// 0x05 = utf16 little endian
switch(fullSequence[0]) {
  case 0: {decodedEncoding = 'latin1'; break;};
  case 1: {decodedEncoding = 'ansi'; break;};
  case 2: {decodedEncoding = 'utf8'; break;};
  case 3: {decodedEncoding = 'hex'; break;};
  case 4: {decodedEncoding = 'ucs2'; break;};
  case 5: {decodedEncoding = 'utf16le'; break;};
  default: {decodedEncoding = 'utf8'; break;};
}
let decodedDictionary = [];
let decodedSequence = [];
let word = [];
for(let i = 1; i < fullSequence.length; i++) {
  byte = Buffer.allocUnsafe(1)
  byte[0] = fullSequence[i]
  if(byte[0] === 0xfd) {
    headers = !headers // May not be a good idea, but it DOES actually provide for some interesting applications, maybe sometime later down the line.
    decodedDictionary.push(word.join(''))
    word = []
  } else if(headers) {
    if(fullSequence[i] != 1) {
     word.push(byte.toString(decodedEncoding))
    } else {
      decodedDictionary.push(word.join(''))
      word = []
    }
  } else {
    decodedSequence.push(decodedDictionary[byte[0]])
  }
}
return decodedSequence.join(' ')
}
