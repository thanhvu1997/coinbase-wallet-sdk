"use strict";
// Copyright (c) 2018-2022 Coinbase, Inc. <https://www.coinbase.com/>
// Licensed under the Apache License, version 2.0
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoinbaseWalletSDK = void 0;
const ScopedLocalStorage_1 = require("./lib/ScopedLocalStorage");
const CoinbaseWalletProvider_1 = require("./provider/CoinbaseWalletProvider");
const WalletSDKUI_1 = require("./provider/WalletSDKUI");
const WalletSDKRelay_1 = require("./relay/WalletSDKRelay");
const WalletSDKRelayEventManager_1 = require("./relay/WalletSDKRelayEventManager");
const util_1 = require("./util");
const LINK_API_URL = process.env.LINK_API_URL || "https://www.walletlink.org";
const SDK_VERSION = process.env.SDK_VERSION || require("../package.json").version || "unknown";
class CoinbaseWalletSDK {
    /**
     * Constructor
     * @param options Coinbase Wallet SDK constructor options
     */
    constructor(options) {
        var _a;
        this._appName = "";
        this._appLogoUrl = null;
        this._relay = null;
        this._relayEventManager = null;
        const linkAPIUrl = options.linkAPIUrl || LINK_API_URL;
        let uiConstructor;
        if (!options.uiConstructor) {
            uiConstructor = opts => new WalletSDKUI_1.WalletSDKUI(opts);
        }
        else {
            uiConstructor = options.uiConstructor;
        }
        if (typeof options.overrideIsMetaMask === "undefined") {
            this._overrideIsMetaMask = false;
        }
        else {
            this._overrideIsMetaMask = options.overrideIsMetaMask;
        }
        this._overrideIsCoinbaseWallet = (_a = options.overrideIsCoinbaseWallet) !== null && _a !== void 0 ? _a : true;
        this._eventListener = options.eventListener;
        const u = new URL(linkAPIUrl);
        const origin = `${u.protocol}//${u.host}`;
        this._storage = new ScopedLocalStorage_1.ScopedLocalStorage(`-walletlink:${origin}`); // needs migration to preserve local states
        this._storage.setItem("version", CoinbaseWalletSDK.VERSION);
        if (this.walletExtension) {
            return;
        }
        this._relayEventManager = new WalletSDKRelayEventManager_1.WalletSDKRelayEventManager();
        this._relay = new WalletSDKRelay_1.WalletSDKRelay({
            linkAPIUrl,
            version: SDK_VERSION,
            darkMode: !!options.darkMode,
            uiConstructor,
            storage: this._storage,
            relayEventManager: this._relayEventManager,
            eventListener: this._eventListener
        });
        this.setAppInfo(options.appName, options.appLogoUrl);
        if (!!options.headlessMode)
            return;
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
        if (!jsonRpcUrl)
            relay.setConnectDisabled(true);
        return new CoinbaseWalletProvider_1.CoinbaseWalletProvider({
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
        var _a;
        this._appName = appName || "DApp";
        this._appLogoUrl = appLogoUrl || (0, util_1.getFavicon)();
        const extension = this.walletExtension;
        if (extension) {
            if (!this.isCipherProvider(extension)) {
                extension.setAppInfo(this._appName, this._appLogoUrl);
            }
        }
        else {
            (_a = this._relay) === null || _a === void 0 ? void 0 : _a.setAppInfo(this._appName, this._appLogoUrl);
        }
    }
    /**
     * Disconnect. After disconnecting, this will reload the web page to ensure
     * all potential stale state is cleared.
     */
    disconnect() {
        var _a;
        const extension = this.walletExtension;
        if (extension) {
            extension.close();
        }
        else {
            (_a = this._relay) === null || _a === void 0 ? void 0 : _a.resetAndReload();
        }
    }
    /**
     * Return QR URL for mobile wallet connection, will return null if extension is installed
     */
    getQrUrl() {
        var _a, _b;
        return (_b = (_a = this._relay) === null || _a === void 0 ? void 0 : _a.getQRCodeUrl()) !== null && _b !== void 0 ? _b : null;
    }
    get walletExtension() {
        var _a;
        return (_a = window.coinbaseWalletExtension) !== null && _a !== void 0 ? _a : window.walletLinkExtension;
    }
    isCipherProvider(provider) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return typeof provider.isCipher === "boolean" && provider.isCipher;
    }
}
exports.CoinbaseWalletSDK = CoinbaseWalletSDK;
CoinbaseWalletSDK.VERSION = SDK_VERSION;
