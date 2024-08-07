const express = require("express");
const cache = require("memory-cache");

const axios = require("axios");
const config = require("../utils/config.js");

const {logger} = require("../services/logger.js");

const router = express.Router();
const data = {
  "USD": {
    "USD": 1,
    "AED": 3.6725,
    "AFN": 71.8772,
    "ALL": 92.5123,
    "AMD": 387.4327,
    "ANG": 1.79,
    "AOA": 861.2595,
    "ARS": 864.75,
    "AUD": 1.5108,
    "AWG": 1.79,
    "AZN": 1.7007,
    "BAM": 1.8073,
    "BBD": 2,
    "BDT": 117.2674,
    "BGN": 1.8068,
    "BHD": 0.376,
    "BIF": 2868.3134,
    "BMD": 1,
    "BND": 1.351,
    "BOB": 6.9215,
    "BRL": 5.1485,
    "BSD": 1,
    "BTN": 83.2957,
    "BWP": 13.5629,
    "BYN": 3.2555,
    "BZD": 2,
    "CAD": 1.3706,
    "CDF": 2766.7042,
    "CHF": 0.9143,
    "CLP": 906.3267,
    "CNY": 7.2473,
    "COP": 3831.0476,
    "CRC": 512.5938,
    "CUP": 24,
    "CVE": 101.894,
    "CZK": 22.8404,
    "DJF": 177.721,
    "DKK": 6.8963,
    "DOP": 58.7323,
    "DZD": 134.5882,
    "EGP": 47.1157,
    "ERN": 15,
    "ETB": 57.4851,
    "EUR": 0.9241,
    "FJD": 2.266,
    "FKP": 0.7869,
    "FOK": 6.8941,
    "GBP": 0.7869,
    "GEL": 2.7302,
    "GGP": 0.7869,
    "GHS": 14.6062,
    "GIP": 0.7869,
    "GMD": 65.8886,
    "GNF": 8575.2018,
    "GTQ": 7.769,
    "GYD": 209.3253,
    "HKD": 7.8086,
    "HNL": 24.7114,
    "HRK": 6.9625,
    "HTG": 133.0606,
    "HUF": 357.0724,
    "IDR": 16001.0655,
    "ILS": 3.6797,
    "IMP": 0.7869,
    "INR": 83.2995,
    "IQD": 1311.1481,
    "IRR": 42089.9571,
    "ISK": 138.5573,
    "JEP": 0.7869,
    "JMD": 156.093,
    "JOD": 0.709,
    "JPY": 156.8882,
    "KES": 131.758,
    "KGS": 88.127,
    "KHR": 4085.9326,
    "KID": 1.5107,
    "KMF": 454.6188,
    "KRW": 1365.2869,
    "KWD": 0.307,
    "KYD": 0.8333,
    "KZT": 442.821,
    "LAK": 21603.7548,
    "LBP": 89500,
    "LKR": 299.8669,
    "LRD": 193.3896,
    "LSL": 18.4364,
    "LYD": 4.84,
    "MAD": 9.9331,
    "MDL": 17.6651,
    "MGA": 4428.297,
    "MKD": 56.7844,
    "MMK": 2100.7543,
    "MNT": 3417.1685,
    "MOP": 8.0429,
    "MRU": 39.9193,
    "MUR": 46.1612,
    "MVR": 15.4439,
    "MWK": 1741.511,
    "MXN": 16.7127,
    "MYR": 4.7051,
    "MZN": 63.4138,
    "NAD": 18.4364,
    "NGN": 1439.8392,
    "NIO": 36.8153,
    "NOK": 10.6675,
    "NPR": 133.2732,
    "NZD": 1.6379,
    "OMR": 0.3845,
    "PAB": 1,
    "PEN": 3.7329,
    "PGK": 3.8624,
    "PHP": 58.2344,
    "PKR": 278.1776,
    "PLN": 3.939,
    "PYG": 7495.4398,
    "QAR": 3.64,
    "RON": 4.5949,
    "RSD": 108.0137,
    "RUB": 91.0255,
    "RWF": 1309.6069,
    "SAR": 3.75,
    "SBD": 8.3391,
    "SCR": 14.4392,
    "SDG": 511.9665,
    "SEK": 10.7283,
    "SGD": 1.351,
    "SHP": 0.7869,
    "SLE": 22.6613,
    "SLL": 22661.2592,
    "SOS": 571.6033,
    "SRD": 32.4168,
    "SSP": 1716.7652,
    "STN": 22.64,
    "SYP": 12913.5369,
    "SZL": 18.4364,
    "THB": 36.5675,
    "TJS": 10.8845,
    "TMT": 3.5003,
    "TND": 3.1199,
    "TOP": 2.3374,
    "TRY": 32.2375,
    "TTD": 6.7654,
    "TVD": 1.5107,
    "TWD": 32.232,
    "TZS": 2599.1049,
    "UAH": 39.9281,
    "UGX": 3826.264,
    "UYU": 38.3353,
    "UZS": 12730.2388,
    "VES": 36.5219,
    "VND": 25481.6581,
    "VUV": 119.7587,
    "WST": 2.7349,
    "XAF": 606.1584,
    "XCD": 2.7,
    "XDR": 0.755,
    "XOF": 606.1584,
    "XPF": 110.2726,
    "YER": 250.2751,
    "ZAR": 18.4439,
    "ZMW": 26.2501,
    "ZWL": 13.2183,
  },
};

// 86400000 = 24h in ms

router.get("/currency-rate", (req, res, next) => {
  try {
    let apiData = cache.get("currency-rate");
    if (apiData && apiData[req.query.from]) {
      // const result = parseInt(req.query.amount, 10) * apiData[req.query.to];
      const result = parseInt(req.query.amount, 10) * data[req.query.from][req.query.to];
      res.json({result});
    } else {
      if (!apiData) {
        apiData = {};
      }
      // axios.get(`https://v6.exchangerate-api.com/v6/${config["exchangerate-api"].apiKey}/latest/${req.query.from}`)
        // .then(response => {
          // apiData[req.query.from] = response.data["conversion_rates"];
      apiData[req.query.from] = data[req.query.from];
      cache.put("currency-rate", apiData, 86400000);
      const result = parseInt(req.query.amount, 10) * data[req.query.from][req.query.to];
      res.json({result});
        // })
        // .catch(err => {
        //   logger.error(err);
        //   return next(err);
        // });
    }
  } catch (e) {
    logger.error(e);
    return next(e);
  }
});

module.exports = router;
