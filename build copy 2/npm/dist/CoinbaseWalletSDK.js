"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CoinbaseWalletSDK = void 0;

var _ScopedLocalStorage = require("./lib/ScopedLocalStorage");

var _CoinbaseWalletProvider = require("./provider/CoinbaseWalletProvider");

var _WalletSDKUI = require("./provider/WalletSDKUI");

var _WalletSDKRelay = require("./relay/WalletSDKRelay");

var _WalletSDKRelayEventManager = require("./relay/WalletSDKRelayEventManager");

var _util = require("./util");

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const LINK_API_URL = process.env.LINK_API_URL || "https://www.walletlink.org";
const SDK_VERSION = process.env.SDK_VERSION || require("../package.json").version || "unknown";
/** Coinbase Wallet SDK Constructor Options */

class CoinbaseWalletSDK {
  /**
   * Constructor
   * @param options Coinbase Wallet SDK constructor options
   */
  constructor(options) {
    var _options$overrideIsCo;

    _defineProperty(this, "_appName", "");

    _defineProperty(this, "_appLogoUrl", null);

    _defineProperty(this, "_relay", null);

    _defineProperty(this, "_relayEventManager", null);

    const linkAPIUrl = options.linkAPIUrl || LINK_API_URL;
    let uiConstructor;

    if (!options.uiConstructor) {
      uiConstructor = opts => new _WalletSDKUI.WalletSDKUI(opts);
    } else {
      uiConstructor = options.uiConstructor;
    }

    if (typeof options.overrideIsMetaMask === "undefined") {
      this._overrideIsMetaMask = false;
    } else {
      this._overrideIsMetaMask = options.overrideIsMetaMask;
    }

    this._overrideIsCoinbaseWallet = (_options$overrideIsCo = options.overrideIsCoinbaseWallet) !== null && _options$overrideIsCo !== void 0 ? _options$overrideIsCo : true;
    this._eventListener = options.eventListener;
    const u = new URL(linkAPIUrl);
    const origin = `${u.protocol}//${u.host}`;
    this._storage = new _ScopedLocalStorage.ScopedLocalStorage(`-walletlink:${origin}`); // needs migration to preserve local states

    this._storage.setItem("version", CoinbaseWalletSDK.VERSION);

    if (this.walletExtension) {
      return;
    }

    this._relayEventManager = new _WalletSDKRelayEventManager.WalletSDKRelayEventManager();
    this._relay = new _WalletSDKRelay.WalletSDKRelay({
      linkAPIUrl,
      version: SDK_VERSION,
      darkMode: !!options.darkMode,
      uiConstructor,
      storage: this._storage,
      relayEventManager: this._relayEventManager,
      eventListener: this._eventListener
    });
    this.setAppInfo(options.appName, options.appLogoUrl);
    if (!!options.headlessMode) return;

    this._relay.attachUI();
  }
  /**
   * Create a Web3 Provider object
   * @param jsonRpcUrl Ethereum JSON RPC URL (Default: "")
   * @param chainId Ethereum Chain ID (Default: 1)
   * @returns A Web3 Provider
   */


  makeWeb3Provider(jsonRpcUrl = "", chainId = 1) {
    const extension = this.walletExtension;

    if (extension) {
      if (!this.isCipherProvider(extension)) {
        extension.setProviderInfo(jsonRpcUrl, chainId);
      }

      return extension;
    }

    const relay = this._relay;

    if (!relay || !this._relayEventManager || !this._storage) {
      throw new Error("Relay not initialized, should never happen");
    }

    if (!jsonRpcUrl) relay.setConnectDisabled(true);
    return new _CoinbaseWalletProvider.CoinbaseWalletProvider({
      relayProvider: () => Promise.resolve(relay),
      relayEventManager: this._relayEventManager,
      storage: this._storage,
      jsonRpcUrl,
      chainId,
      qrUrl: this.getQrUrl(),
      eventListener: this._eventListener,
      overrideIsMetaMask: this._overrideIsMetaMask,
      overrideIsCoinbaseWallet: this._overrideIsCoinbaseWallet
    });
  }
  /**
   * Set application information
   * @param appName Application name
   * @param appLogoUrl Application logo image URL
   */


  setAppInfo(appName, appLogoUrl) {
    this._appName = appName || "DApp";
    this._appLogoUrl = appLogoUrl || (0, _util.getFavicon)();
    const extension = this.walletExtension;

    if (extension) {
      if (!this.isCipherProvider(extension)) {
        extension.setAppInfo(this._appName, this._appLogoUrl);
      }
    } else {
      var _this$_relay;

      (_this$_relay = this._relay) === null || _this$_relay === void 0 ? void 0 : _this$_relay.setAppInfo(this._appName, this._appLogoUrl);
    }
  }
  /**
   * Disconnect. After disconnecting, this will reload the web page to ensure
   * all potential stale state is cleared.
   */


  disconnect() {
    const extension = this.walletExtension;

    if (extension) {
      extension.close();
    } else {
      var _this$_relay2;

      (_this$_relay2 = this._relay) === null || _this$_relay2 === void 0 ? void 0 : _this$_relay2.resetAndReload();
    }
  }
  /**
   * Return QR URL for mobile wallet connection, will return null if extension is installed
   */


  getQrUrl() {
    var _this$_relay$getQRCod, _this$_relay3;

    return (_this$_relay$getQRCod = (_this$_relay3 = this._relay) === null || _this$_relay3 === void 0 ? void 0 : _this$_relay3.getQRCodeUrl()) !== null && _this$_relay$getQRCod !== void 0 ? _this$_relay$getQRCod : null;
  }

  get walletExtension() {
    var _window$coinbaseWalle;

    return (_window$coinbaseWalle = window.coinbaseWalletExtension) !== null && _window$coinbaseWalle !== void 0 ? _window$coinbaseWalle : window.walletLinkExtension;
  }

  isCipherProvider(provider) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return typeof provider.isCipher === "boolean" && provider.isCipher;
  }

}

exports.CoinbaseWalletSDK = CoinbaseWalletSDK;

_defineProperty(CoinbaseWalletSDK, "VERSION", SDK_VERSION);