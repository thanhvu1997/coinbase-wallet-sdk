"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.bigIntStringFromBN = bigIntStringFromBN;
exports.createQrUrl = createQrUrl;
exports.ensureAddressString = ensureAddressString;
exports.ensureBN = ensureBN;
exports.ensureBuffer = ensureBuffer;
exports.ensureEvenLengthHexString = ensureEvenLengthHexString;
exports.ensureHexString = ensureHexString;
exports.ensureIntNumber = ensureIntNumber;
exports.ensureParsedJSONObject = ensureParsedJSONObject;
exports.ensureRegExpString = ensureRegExpString;
exports.getFavicon = getFavicon;
exports.has0xPrefix = has0xPrefix;
exports.hexStringFromBuffer = hexStringFromBuffer;
exports.hexStringFromIntNumber = hexStringFromIntNumber;
exports.hexStringToUint8Array = hexStringToUint8Array;
exports.intNumberFromHexString = intNumberFromHexString;
exports.isBigNumber = isBigNumber;
exports.isHexString = isHexString;
exports.prepend0x = prepend0x;
exports.randomBytesHex = randomBytesHex;
exports.range = range;
exports.strip0x = strip0x;
exports.uint8ArrayToHex = uint8ArrayToHex;

var _bn = _interopRequireDefault(require("bn.js"));

var _qs = require("qs");

var _types = require("./types");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Copyright (c) 2018-2022 Coinbase, Inc. <https://www.coinbase.com/>
// Licensed under the Apache License, version 2.0
const INT_STRING_REGEX = /^[0-9]*$/;
const HEXADECIMAL_STRING_REGEX = /^[a-f0-9]*$/;
/**
 * @param length number of bytes
 */

function randomBytesHex(length) {
  return uint8ArrayToHex(crypto.getRandomValues(new Uint8Array(length)));
}

function uint8ArrayToHex(value) {
  return [...value].map(b => b.toString(16).padStart(2, "0")).join("");
}

function hexStringToUint8Array(hexString) {
  return new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
}

function hexStringFromBuffer(buf, includePrefix = false) {
  const hex = buf.toString("hex");
  return (0, _types.HexString)(includePrefix ? "0x" + hex : hex);
}

function bigIntStringFromBN(bn) {
  return (0, _types.BigIntString)(bn.toString(10));
}

function intNumberFromHexString(hex) {
  return (0, _types.IntNumber)(new _bn.default(ensureEvenLengthHexString(hex, false), 16).toNumber());
}

function hexStringFromIntNumber(num) {
  return (0, _types.HexString)("0x" + new _bn.default(num).toString(16));
}

function has0xPrefix(str) {
  return str.startsWith("0x") || str.startsWith("0X");
}

function strip0x(hex) {
  if (has0xPrefix(hex)) {
    return hex.slice(2);
  }

  return hex;
}

function prepend0x(hex) {
  if (has0xPrefix(hex)) {
    return "0x" + hex.slice(2);
  }

  return "0x" + hex;
}

function isHexString(hex) {
  if (typeof hex !== "string") {
    return false;
  }

  const s = strip0x(hex).toLowerCase();
  return HEXADECIMAL_STRING_REGEX.test(s);
}

function ensureHexString(hex, includePrefix = false) {
  if (typeof hex === "string") {
    const s = strip0x(hex).toLowerCase();

    if (HEXADECIMAL_STRING_REGEX.test(s)) {
      return (0, _types.HexString)(includePrefix ? "0x" + s : s);
    }
  }

  throw new Error(`"${String(hex)}" is not a hexadecimal string`);
}

function ensureEvenLengthHexString(hex, includePrefix = false) {
  let h = ensureHexString(hex, false);

  if (h.length % 2 === 1) {
    h = (0, _types.HexString)("0" + h);
  }

  return includePrefix ? (0, _types.HexString)("0x" + h) : h;
}

function ensureAddressString(str) {
  if (typeof str === "string") {
    const s = strip0x(str).toLowerCase();

    if (isHexString(s) && s.length === 40) {
      return (0, _types.AddressString)(prepend0x(s));
    }
  }

  throw new Error(`Invalid Ethereum address: ${String(str)}`);
}

function ensureBuffer(str) {
  if (Buffer.isBuffer(str)) {
    return str;
  }

  if (typeof str === "string") {
    if (isHexString(str)) {
      const s = ensureEvenLengthHexString(str, false);
      return Buffer.from(s, "hex");
    } else {
      return Buffer.from(str, "utf8");
    }
  }

  throw new Error(`Not binary data: ${String(str)}`);
}

function ensureIntNumber(num) {
  if (typeof num === "number" && Number.isInteger(num)) {
    return (0, _types.IntNumber)(num);
  }

  if (typeof num === "string") {
    if (INT_STRING_REGEX.test(num)) {
      return (0, _types.IntNumber)(Number(num));
    }

    if (isHexString(num)) {
      return (0, _types.IntNumber)(new _bn.default(ensureEvenLengthHexString(num, false), 16).toNumber());
    }
  }

  throw new Error(`Not an integer: ${String(num)}`);
}

function ensureRegExpString(regExp) {
  if (regExp instanceof RegExp) {
    return (0, _types.RegExpString)(regExp.toString());
  }

  throw new Error(`Not a RegExp: ${String(regExp)}`);
}

function ensureBN(val) {
  if (val !== null && (_bn.default.isBN(val) || isBigNumber(val))) {
    return new _bn.default(val.toString(10), 10);
  }

  if (typeof val === "number") {
    return new _bn.default(ensureIntNumber(val));
  }

  if (typeof val === "string") {
    if (INT_STRING_REGEX.test(val)) {
      return new _bn.default(val, 10);
    }

    if (isHexString(val)) {
      return new _bn.default(ensureEvenLengthHexString(val, false), 16);
    }
  }

  throw new Error(`Not an integer: ${String(val)}`);
}

function ensureParsedJSONObject(val) {
  if (typeof val === "string") {
    return JSON.parse(val);
  }

  if (typeof val === "object") {
    return val;
  }

  throw new Error(`Not a JSON string or an object: ${String(val)}`);
}

function isBigNumber(val) {
  if (val == null || typeof val.constructor !== "function") {
    return false;
  }

  const {
    constructor
  } = val;
  return typeof constructor.config === "function" && typeof constructor.EUCLID === "number";
}

function range(start, stop) {
  return Array.from({
    length: stop - start
  }, (_, i) => start + i);
}

function getFavicon() {
  const el = document.querySelector('link[sizes="192x192"]') || document.querySelector('link[sizes="180x180"]') || document.querySelector('link[rel="icon"]') || document.querySelector('link[rel="shortcut icon"]');
  const {
    protocol,
    host
  } = document.location;
  const href = el ? el.getAttribute("href") : null;

  if (!href || href.startsWith("javascript:")) {
    return null;
  }

  if (href.startsWith("http://") || href.startsWith("https://") || href.startsWith("data:")) {
    return href;
  }

  if (href.startsWith("//")) {
    return protocol + href;
  }

  return `${protocol}//${host}${href}`;
}

function createQrUrl(sessionId, sessionSecret, serverUrl, isParentConnection) {
  const sessionIdKey = isParentConnection ? "parent-id" : "id";
  const query = (0, _qs.stringify)({
    [sessionIdKey]: sessionId,
    secret: sessionSecret,
    server: serverUrl,
    v: "1"
  });
  const qrUrl = `${serverUrl}/#/link?${query}`;
  return qrUrl;
}