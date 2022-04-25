"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WalletSDKRelayEventManager = void 0;

var _util = require("../util");

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class WalletSDKRelayEventManager {
  constructor() {
    _defineProperty(this, "_nextRequestId", 0);

    _defineProperty(this, "callbacks", new Map());
  }

  makeRequestId() {
    // max nextId == max int32 for compatibility with mobile
    this._nextRequestId = (this._nextRequestId + 1) % 0x7fffffff;
    const id = this._nextRequestId;
    const idStr = (0, _util.prepend0x)(id.toString(16)); // unlikely that this will ever be an issue, but just to be safe

    const callback = this.callbacks.get(idStr);

    if (callback) {
      this.callbacks.delete(idStr);
    }

    return id;
  }

}

exports.WalletSDKRelayEventManager = WalletSDKRelayEventManager;