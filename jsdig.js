const dns2 = require('dns2');
const {classTranslate} = require('./functions/translator');
const jokes = require('./jokes');

args = process.argv
try{
if(args.length < 6 && args[3].toLowerCase() !== 'birthday') {
  fileName = args[1].split('\\');
  process.stderr.write(`This program needs at least 4 arguments\nNameservers(IP) Port Name Type. Optional: +newlines\n\nExample:\n${fileName[fileName.length-1]} 8.8.8.8,8.8.4.4,127.0.0.1 53 example.com A +newlines\n\n`)
  process.exit();
}
  }catch{} // shut up


birthDate = new Date(2021,2,8,1,13,27) // August 8th 2021 (sincerely)
birthYear = birthDate.getFullYear()
birthMonth = birthDate.getMonth()
birthDay = birthDate.getDate()
now = new Date(Date.now())
year = now.getFullYear()
month = now.getMonth()
today = now.getDate()

let birthday = false;
let age = year-birthYear;
let plural;
if(birthMonth.toString() + birthDay.toString() === month.toString() + today.toString()) {
  birthday = true //TODO: THROW JSDIG A BIRTHDAY PARTY!
  if(age === 1 || age === -1 /* Time travel must be accounted for too */) {
    plural = ''
  } else {
    plural = 's'
  }
}
let funFact
if(birthday) {
  if(args[3].toLowerCase() === 'birthday') {
    let suffix;
    stringAge = age.toString()
    length = stringAge.length
    switch(stringAge[stringAge[stringAge.length-1]]) {
      case 1: {suffix = 'st'; break;}
      case 2: {suffix = 'nd'; break;}
      case 3: {suffix = 'rd'; break;}
      default: {suffix = 'th'; break;}
    }
    process.stdout.write(`Thank you for celebrating my ${age}${suffix} birthday with me!\n`)
    process.exit()
  }
  funFact = '\nToday is JS-Dig\'s \033[32mbirthday!\033[0m\nJS-Dig was written on August 8th of 2021, at 1AM no less!\nThat means JS-Dig is now' + `${age} year${plural} old!`
} else {
  funFact = jokes.funFacts[Math.floor(Math.random() * jokes.funFacts.length) + 0]
}

if(args[3].toLowerCase() === 'birthday') {
  process.stdout.write('It\'s not my birthday though...\n')
  process.exit()
}

nameservers = args[2].split(',');
port = parseInt(args[3]);
urlName = args[4];
typeName = args[5]
let bindStyle;
if(process.argv.length <= 7 && process.argv[6] === '+newlines') {
  bindStyle = false
} else {
  bindStyle = true
};

const options = {
  // available options
  dns: nameservers[0],
  nameServers: nameservers,
  port: port,
};

process.stdout.write('\nNode Javascript \033[32;1;4mDiG\033[0m v1.0\n' + funFact + '\n')

 Object.prototype.joinAnswers = function(contextClue) {
  answerKeys = Object.keys(this);
  answerValues = Object.values(this);
  context = contextClue.split('$');
  results = [];
  for(let i = 0; i <= answerKeys.length-1; i++) {
  stringConstruct = context;
  switch(i) {
    case 0:  {coloredText = '\033[32;1;4m'+ answerValues[i]; break;};                            // Name
    case 1:  {coloredText = '\033[34;1m'  + answerValues[i]; break;};                            // TTL
    case 2:  {coloredText = '\033[31;4m'  + classTranslate(answerValues[i],'TYPE'); break;};     // Type
    case 3:  {coloredText = '\033[36;1m'  + classTranslate(answerValues[i],'CLASS'); break;};    // Class
    default: {coloredText = '\033[33m'    + answerValues[i]; break;};                            // All data fields
  }
  stringConstruct.splice(1,1,[coloredText+'\033[0m'])
  results.push(answerKeys[i]+stringConstruct.join(''))
}
if(bindStyle) {
  return results.join(' ');
} else {
  return results.join('\n')
}
};

const dns = new dns2(options);


        dnsRecords = dns.resolve(urlName, typeName).then(answer => {
          dnsRecords = answer.answers;
          if(dnsRecords.length < 1) {
            process.stdout.write('No response!\n')
          } else {
          for(let i = 0; i < dnsRecords.length; i++) {
            process.stdout.write('\nAnswer \033[33;1m'+`${i}`+'\033[0m'+`: ${dnsRecords[i].joinAnswers(`: $`)}\n`)
          if(i+1 === dnsRecords.length) {
            process.exit()
          }
        }}})
