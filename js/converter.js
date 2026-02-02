/**
 * Georgian script conversion utilities.
 * Converts between Mkhedruli, Asomtavruli, and Nuskhuri scripts
 * using Unicode codepoint offsets.
 */

const MKHEDRULI_START = 0x10D0;
const ASOMTAVRULI_START = 0x10A0;
const NUSKHURI_START = 0x2D00;
const GEORGIAN_RANGE = 48;

function convertWord(mkhedruliWord) {
  let asomtavruli = '';
  let nuskhuri = '';

  for (const char of mkhedruliWord) {
    const code = char.charCodeAt(0);
    if (code >= MKHEDRULI_START && code < MKHEDRULI_START + GEORGIAN_RANGE) {
      const offset = code - MKHEDRULI_START;
      asomtavruli += String.fromCharCode(ASOMTAVRULI_START + offset);
      nuskhuri += String.fromCharCode(NUSKHURI_START + offset);
    } else {
      asomtavruli += char;
      nuskhuri += char;
    }
  }
  return { mkhedruli: mkhedruliWord, asomtavruli, nuskhuri };
}

const GEORGIAN_NUMERAL_VALUES = {
  'ა': 1, 'ბ': 2, 'გ': 3, 'დ': 4, 'ე': 5, 'ვ': 6, 'ზ': 7, 'თ': 9,
  'ი': 10, 'კ': 20, 'ლ': 30, 'მ': 40, 'ნ': 50, 'ო': 70, 'პ': 80, 'ჟ': 90,
  'რ': 100, 'ს': 200, 'ტ': 300, 'უ': 400, 'ფ': 500, 'ქ': 600, 'ღ': 700, 'ყ': 800, 'შ': 900,
  'ჩ': 1000, 'ც': 2000, 'ძ': 3000, 'წ': 4000, 'ჭ': 5000, 'ხ': 6000, 'ჯ': 7000, 'ჰ': 8000,
  'ჱ': 8, 'ჲ': 60, 'ჳ': 400, 'ჴ': 6000, 'ჵ': 10000
};

function calculateNumericalValue(text) {
  const values = [];
  for (const char of text) {
    const val = GEORGIAN_NUMERAL_VALUES[char];
    if (val) {
      values.push(val);
    }
  }
  if (values.length === 0) return '';
  const total = values.reduce((a, b) => a + b, 0);
  return values.join(' + ') + ' = ' + total;
}
