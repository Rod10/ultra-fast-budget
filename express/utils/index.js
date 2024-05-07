/**
 * mdelage@keeex.net => md***ge@k***x.net
 * mdelage+exploitation@keeex.net => md****************on@k***x.net
 * md@keeex.net => md@k***x.net
 */
const censorEmail = email => email.replace(
  /* disable eslint rule as it has better compatibility with browser */
  /* eslint-disable-next-line prefer-named-capture-group */
  /(.{2})?(.+)?(.{2}@.)(.+?)(.\..+)/gu,
  (_, m1, m2, m3, m4, m5) => `${m1 || ""}${(m2 || "").replaceAll(/./gu, "*")}${m3}${m4.replaceAll(/./gu, "*")}${m5}`,
);

const isEmailValid = email => {
  /* eslint-disable-next-line */
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
};

/**
 * filter array with async function
 */
const filterArrayAsync = async (arr, callback) => {
  const fail = Symbol("Non matching item");
  return (await Promise.all(arr.map(async item => (await callback(item)) ? item : fail)))
    .filter(i => i !== fail);
};

const hasProperty = (object, prop) => Object.prototype.hasOwnProperty.call(object, prop);

const objectAsIterable = obj => Object.keys(obj).reduce((acc, cur) => {
  if (typeof obj[cur] === "string") {
    acc.push({key: cur, value: obj[cur]});
  } else {
    acc.push({...obj[cur], key: cur});
  }
  return acc;
}, []);

/* eslint-disable-next-line require-unicode-regexp */
const validRegex = new RegExp(
  ["\"", "*", "?", "\\", "{", "}", "[", "]", "(", ")"]
    .map(e => `\\${e}`).join("|"),
);
const isInputValid = str => !str.match(validRegex);

const planMatch = (scn, plan) => {
  if (!scn.plan) return true;
  return scn.plan.includes(plan);
};

const requiredMatch = (scn, options) => {
  if (!scn.required) return true;
  return Object.keys(scn.required)
    .every(opt => options.has(opt) === Boolean(scn.required[opt]));
};

const arrayXor = (arr1, arr2) => arr1.reduce((acc, cur) => {
  if (!arr2.includes(cur)) acc.push(cur);
  return acc;
}, arr2.reduce((acc, cur) => {
  if (!arr1.includes(cur)) acc.push(cur);
  return acc;
}, []));

const websafeB642Base64 = str => str
  .replace(/-/gu, "+")
  .replace(/_/gu, "/");

const base642WebsafeB64 = str => str
  .replace(/\+/gu, "-")
  .replace(/\//gu, "_");

const sameArray = (arr1, arr2) => {
  if (arr1.length !== arr2.length) return false;
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) return false;
  }
  return true;
};

/**
 * @param {number[]|string[]} source - array in which to search
 * @param {number[]|number|string[]|string} searched
 */
const includesOneOf = (source, searched) => Array.isArray(searched)
  ? searched.some(entry => source.includes(entry))
  : source.includes(searched);

module.exports = {
  arrayXor,
  base642WebsafeB64,
  censorEmail,
  filterArrayAsync,
  hasProperty,
  includesOneOf,
  isEmailValid,
  isInputValid,
  objectAsIterable,
  planMatch,
  requiredMatch,
  sameArray,
  websafeB642Base64,
};
