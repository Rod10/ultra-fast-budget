/**
 * Get element from dom event base on tagName. If tag name not found, will return null
 *
 * @param {object} evt - Dom event
 * @param {string} tagName - Tag name searched
 */
const getElFromTagName = (evt, tagName) => {
  let el = evt.target;
  while (el.tagName !== tagName && el.tagName !== "BODY") {
    el = el.parentElement;
  }
  if (el.tagName === "BODY") return null;
  return el;
};

/**
 * Get element from dom event based on dataset or tagName. If neither the dataset not the
 * tagName is found, will return null.
 *
 * @param {object} evt - Dom event
 * @param {string} key - Dataset key
 * @param {string} [tagName] - Tag name to stop the search
 */
const getElFromDataset = (evt, key, tagName = "BODY") => {
  let el = evt.target;
  while (!el.dataset[key] && el.tagName !== tagName) {
    el = el.parentElement;
  }
  if (el.tagName === "BODY") return null;
  return el;
};

const preventDefault = evt => {
  if (evt && evt.preventDefault) {
    evt.preventDefault();
  }
};

module.exports = {
  getElFromTagName,
  getElFromDataset,
  preventDefault,
};
