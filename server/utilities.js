const T2W = require('numbers2words'); // import from node modules
const numberTranslator = new T2W('EN_US');
const diacritics = require('diacritic');

const isJson = (item) => {
  if (!item) {
    console.log('isJson item is falsy');
    return false;
  }
  item = typeof item !== 'string' ? JSON.stringify(item) : item;
  try {
    item = JSON.parse(item);
  } catch (e) {
    console.log('isJson exception: ', item);
    return false;
  }
  return typeof item === 'object' && item !== null;
};

const getImage = (images) => {
  if (images == null || !images.length) {
    return '';
  }
  // if we have an image with medium height take that one
  let image = images.find((i) => i.height === 300);
  // otherwise, take the one with the largest image
  if (image == null) {
    image = images.find((i) => i.height > 300);
  }
  // otherwise take the first one
  if (image == null) {
    image = images[0];
  }
  if (image == null) {
    return '';
  }
  return image.url;
};

const getLastFmImage = (images) => {
  if (images == null || !images.length) {
    return '';
  }
  let image = images.find((i) => i.size === 'extralarge');
  if (image == null) {
    image = images.find((i) => i.size === 'large');
  }
  if (image == null) {
    image = images.find((i) => i.size === 'medium');
  }
  // otherwise take the first one
  if (image == null) {
    image = images[0];
  }
  if (image == null) {
    return '';
  }
  return image['#text'];
}

const makeMatchName = (name) => {
  if (!name) {
    return 'EMPTY NAME';
  }
  // console.log('makeMatchName :', name);
  // remove all articles
  //  let matchName = name.normalize().toLowerCase().replaceAll('the ', '');
  let matchName = name.normalize().toLowerCase();
  matchName = diacritics.clean(matchName);
  matchName = matchName.replace(/the /g, '');
  matchName = matchName.replace(/a /g, '');
  matchName = matchName.replace(/an /g, '');
  // convert & and + to and
  matchName = matchName.replace(/&/g, 'and');
  matchName = matchName.replace(/ \+ /g, 'and');
  // convert any numbers to strings
  matchName = matchName.replace(/,/g, ''); // numberTranslator can't handle commas in large numbers
  const r = /\d+/g;
  let m;
  while ((m = r.exec(matchName)) != null) {
    // console.log('translating number: ', m[0], matchName);
    const numberWord = numberTranslator.toWords(+m[0]);
    // console.log('numberWord: ', numberWord);
    matchName = matchName.replace(m[0], numberWord);
    // console.log('after number translation: ', matchName);
  }
  // remove special characters
  matchName = matchName.replace(/[\\/:,*+?!·"'<>| ._-]/g, '');
  // remove anything (within parentheses)
  matchName = matchName.replace(/ *\([^)]*\) */g, '');
  // remove anything [within square brackets]
  return matchName.replace(/ *\[[^\]]*\] */g, '');
};

module.exports = {
  isJson,
  getImage,
  getLastFmImage,
  makeMatchName,
};
