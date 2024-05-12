const REFERENCE_MAX_LENGTH = 100;
const REFERENCE_MAX_LENGTH_NO_PREFIX = 90;

const utils = {};

utils.formatPhone = phoneNumber => {
  if (phoneNumber.match(/(\+\d{2} \d|\d{2})( \d{2}){4}/u)) {
    return phoneNumber;
  }
  const pn = phoneNumber.replaceAll(" ", "");

  if (pn.match(/^\d{10}$/u)) {
    return pn.match(/\d{2}/gu).join(" ");
  } else if (pn.match(/\+\d{11}/u)) {
    return pn.match(/(\+\d{2})(\d)(\d{2})(\d{2})(\d{2})(\d{2})/u)
      /* eslint-disable-next-line no-magic-numbers */
      .splice(1, 6)
      .join(" ");
  }
  return phoneNumber;
};

utils.objectAsIterable = obj => Object.keys(obj).reduce((acc, cur) => {
  if (typeof obj[cur] === "string") {
    acc.push({key: cur, value: obj[cur]});
  } else {
    acc.push({...obj[cur], key: cur});
  }
  return acc;
}, []);

utils.planMatch = (scn, plan) => {
  if (!scn.plan) return true;
  return scn.plan.includes(plan);
};

utils.requiredMatch = (scn, options) => {
  if (!scn.required) return true;
  return Object.keys(scn.required)
    .every(opt => options.has(opt) === Boolean(scn.required[opt]));
};

// take an object of type or subtype
// return an object of type or subtype with only mathing plan
utils.filterTypeByPlan = (entriesObj, plan, options) => Object.keys(entriesObj)
  .reduce((acc, cur) => {
    const tmp = entriesObj[cur];
    if (utils.planMatch(tmp, plan)
      && (!options || utils.requiredMatch(tmp, options))) {
      const n = {...tmp};
      if (n.subTypes) {
        delete n.subTypes;
        n.subTypes = utils.filterTypeByPlan(tmp.subTypes, plan, options);
        n.domain = Object.keys(n.subTypes)
          .reduce((domains, st) => domains.concat(n.subTypes[st].domain), []);
        n.domain = Array.from(new Set(n.domain));
      }
      acc[cur] = n;
    }
    return acc;
  }, {});

utils.arrayXor = (arr1, arr2) => arr1.reduce((acc, cur) => {
  if (!arr2.includes(cur)) acc.push(cur);
  return acc;
}, arr2.reduce((acc, cur) => {
  if (!arr1.includes(cur)) acc.push(cur);
  return acc;
}, []));

/* eslint-disable-next-line require-unicode-regexp */
const validRegex = new RegExp(
  ["\"", "*", "?", "\\", "{", "}", "[", "]", "(", ")"]
    .map(e => `\\${e}`).join("|"),
);
utils.isInputValid = str => !str.match(validRegex);

utils.hasProperty = (object, prop) => Object.prototype.hasOwnProperty.call(object, prop);

/**
 * Return a validated reference
 *
 * @param {string} reference
 * @return {string} validated reference
 */
utils.validateReference = reference => {
  if (!reference) return "";
  const maxLength = reference.match(/^\d{4,}/u)
    ? REFERENCE_MAX_LENGTH
    : REFERENCE_MAX_LENGTH_NO_PREFIX;
  return reference.substr(0, maxLength);
};

utils.getBase = preEdwin => preEdwin
  ? "/society/pre-edwin"
  : "/society";

utils.addKeyToArray = arr => arr.map((e, index) => {
  e.key = index;
  return e;
});

module.exports = utils;
