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

function calculateNumericalValue(text, alphabetData) {
  if (!alphabetData) return '';
  const allLetterData = [...alphabetData.alphabet, ...alphabetData.obsoleteLetters];
  const values = [];
  for (const char of text) {
    const found = allLetterData.find(l => l.mkhedruli === char);
    if (found && found.numericalValue) {
      values.push(found.numericalValue);
    }
  }
  if (values.length === 0) return '';
  const total = values.reduce((a, b) => a + b, 0);
  return values.join(' + ') + ' = ' + total;
}
