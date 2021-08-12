const {
  writeJSHELP
} = require('./functions/jshlp')

// this is going to serve as a test for generating JSHelp files, until I get writing them from the terminal to the point of being possible.

writeJSHELP(`JSHelp is a small project I'm trying to construct, a rather primitive form of compressed TXT, Here's how they're made.\nFirst a single byte at the start to hold encoding type, full list can be found in jshlp.js\nThen, creating a dictionary of all words used, getting this by splitting by each space. Dictionary section is ended with 0xFD\nThen, it writes the index of dictionary words to one byte 0x00 to 0xFF, until the entire string is used\n\nUnfortunately, this means there's a hard limit of 256 unique 'words'.\n\nI'm going to begin counting to 255 to show you an example of a dictionary overflow:\n\n1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39 40 41 42 43 44 45 46 47 48 49 50 51 52 53 54 55 56 57 58 59 60 61 62 63 64 65 66 67 68 69 70 71 72 73 74 75 76 77 78 79 80 81 82 83 84 85 86 87 88 89 90 91 92 93 94 95 96 97 98 99 100 101 102 103 104 105 106 107 108 109 110 111 112 113 114 115 116 117 118 119 120 121 122 123 124 125 126 127 128 129 130 131 132 133 134 135 136 137 138 139 140 141 142 143 144 145 146 147 148 149 150 151 152 153 154 155 156 157 158 159 160 161 162 163 164 165 166 167 168 169 170 171 172 173 174 175 176 177 178 179 180 181 182 183 184 185 186 187 188 189 190 191 192 193 194 195 196 197 198 199 200 201 202 203 204 205 206 207 208 209 210 211 212 213 214 215 216 217 218 219 220 221 222 223 224 225 226 227 228 229 230 231 232 234 235 236 237 238 239 240 241 242 243 245 246 247 248 249 250! I did it, but you can't read this can you?`.toString('latin1'), 1, 'JSHelp')
