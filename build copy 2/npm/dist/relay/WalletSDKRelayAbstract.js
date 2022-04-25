"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WalletSDKRelayAbstract = exports.WALLET_USER_NAME_KEY = exports.LOCAL_STORAGE_ADDRESSES_KEY = exports.APP_VERSION_KEY = void 0;

var _ethRpcErrors = require("eth-rpc-errors");

const WALLET_USER_NAME_KEY = "walletUsername";
exports.WALLET_USER_NAME_KEY = WALLET_USER_NAME_KEY;
const LOCAL_STORAGE_ADDRESSES_KEY = "Addresses";
exports.LOCAL_STORAGE_ADDRESSES_KEY = LOCAL_STORAGE_ADDRESSES_KEY;
const APP_VERSION_KEY = "AppVersion";
exports.APP_VERSION_KEY = APP_VERSION_KEY;

class WalletSDKRelayAbstract {
  /**
   * Whether the relay supports the add ethereum chain call without
   * needing to be connected to the mobile client.
   */
  async makeEthereumJSONRPCRequest(request, jsonRpcUrl) {
    if (!jsonRpcUrl) throw new Error("Error: No jsonRpcUrl provided");
    return window.fetch(jsonRpcUrl, {
      method: "POST",
      body: JSON.stringify(request),
      mode: "cors",
      headers: {
        "Content-Type": "application/json"
      }
    }).then(res => res.json()).then(json => {
      if (!json) {
        throw _ethRpcErrors.ethErrors.rpc.parse({});
      }

      const response = json;
      const {
        error
      } = response;

      if (error) {
        throw (0, _ethRpcErrors.serializeError)(error);
      }

      return response;
    });
  }

}

exports.WalletSDKRelayAbstract = WalletSDKRelayAbstract;