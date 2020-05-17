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

module.exports = isJson;
