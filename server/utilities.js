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

module.exports = {
  isJson,
  getImage
};
