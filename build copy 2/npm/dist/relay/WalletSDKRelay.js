"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WalletSDKRelay = void 0;

var _bindDecorator = _interopRequireDefault(require("bind-decorator"));

var _ethRpcErrors = require("eth-rpc-errors");

var _rxjs = require("rxjs");

var _operators = require("rxjs/operators");

var _EventListener = require("../connection/EventListener");

var _WalletSDKConnection = require("../connection/WalletSDKConnection");

var _util = require("../util");

var aes256gcm = _interopRequireWildcard(require("./aes256gcm"));

var _Session = require("./Session");

var _WalletSDKRelayAbstract = require("./WalletSDKRelayAbstract");

var _Web3Method = require("./Web3Method");

var _Web3RequestCanceledMessage = require("./Web3RequestCanceledMessage");

var _Web3RequestMessage = require("./Web3RequestMessage");

var _Web3Response = require("./Web3Response");

var _Web3ResponseMessage = require("./Web3ResponseMessage");

var _class, _class2;

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

let WalletSDKRelay = (_class = (_class2 = class WalletSDKRelay extends _WalletSDKRelayAbstract.WalletSDKRelayAbstract {
  constructor(options) {
    super();

    _defineProperty(this, "accountsCallback", null);

    _defineProperty(this, "chainCallback", null);

    _defineProperty(this, "appName", "");

    _defineProperty(this, "appLogoUrl", null);

    _defineProperty(this, "subscriptions", new _rxjs.Subscription());

    this.linkAPIUrl = options.linkAPIUrl;
    this.storage = options.storage;
    this._session = _Session.Session.load(options.storage) || new _Session.Session(options.storage).save();
    this.relayEventManager = options.relayEventManager;
    this.eventListener = options.eventListener;
    this.connection = new _WalletSDKConnection.WalletSDKConnection(this._session.id, this._session.key, this.linkAPIUrl, this.eventListener);
    this.subscriptions.add(this.connection.incomingEvent$.pipe((0, _operators.filter)(m => m.event === "Web3Response")).subscribe({
      next: this.handleIncomingEvent
    }) // eslint-disable-line @typescript-eslint/unbound-method
    );
    this.subscriptions.add(this.connection.linked$.pipe((0, _operators.skip)(1), (0, _operators.tap)(linked => {
      this.isLinked = linked;
      const cachedAddresses = this.storage.getItem(_WalletSDKRelayAbstract.LOCAL_STORAGE_ADDRESSES_KEY);

      if (linked) {
        // Only set linked session variable one way
        this.session.linked = linked;
      }

      this.isUnlinkedErrorState = false;

      if (cachedAddresses) {
        const addresses = cachedAddresses.split(" ");
        const wasConnectedViaStandalone = this.storage.getItem("IsStandaloneSigning") === "true";

        if (addresses[0] !== "" && !linked && this.session.linked && !wasConnectedViaStandalone) {
          var _this$eventListener;

          this.isUnlinkedErrorState = true;
          const sessionIdHash = this.getSessionIdHash();
          (_this$eventListener = this.eventListener) === null || _this$eventListener === void 0 ? void 0 : _this$eventListener.onEvent(_EventListener.EVENTS.UNLINKED_ERROR_STATE, {
            sessionIdHash,
            origin: location.origin
          });
        }
      }
    })).subscribe()); // if session is marked destroyed, reset and reload

    this.subscriptions.add(this.connection.sessionConfig$.pipe((0, _operators.filter)(c => !!c.metadata && c.metadata.__destroyed === "1")).subscribe(() => {
      var _this$eventListener2;

      const alreadyDestroyed = this.connection.isDestroyed;
      (_this$eventListener2 = this.eventListener) === null || _this$eventListener2 === void 0 ? void 0 : _this$eventListener2.onEvent(_EventListener.EVENTS.METADATA_DESTROYED, {
        alreadyDestroyed,
        sessionIdHash: this.getSessionIdHash(),
        origin: location.origin
      });
      return this.resetAndReload();
    }));
    this.subscriptions.add(this.connection.sessionConfig$.pipe((0, _operators.filter)(c => c.metadata && c.metadata.WalletUsername !== undefined)).pipe((0, _operators.mergeMap)(c => aes256gcm.decrypt(c.metadata.WalletUsername, this._session.secret))).subscribe({
      next: walletUsername => {
        this.storage.setItem(_WalletSDKRelayAbstract.WALLET_USER_NAME_KEY, walletUsername);
      },
      error: () => {
        var _this$eventListener3;

        (_this$eventListener3 = this.eventListener) === null || _this$eventListener3 === void 0 ? void 0 : _this$eventListener3.onEvent(_EventListener.EVENTS.GENERAL_ERROR, {
          message: "Had error decrypting",
          value: "username"
        });
      }
    }));
    this.subscriptions.add(this.connection.sessionConfig$.pipe((0, _operators.filter)(c => c.metadata && c.metadata.AppVersion !== undefined)).pipe((0, _operators.mergeMap)(c => aes256gcm.decrypt(c.metadata.AppVersion, this._session.secret))).subscribe({
      next: appVersion => {
        this.storage.setItem(_WalletSDKRelayAbstract.APP_VERSION_KEY, appVersion);
      },
      error: () => {
        var _this$eventListener4;

        (_this$eventListener4 = this.eventListener) === null || _this$eventListener4 === void 0 ? void 0 : _this$eventListener4.onEvent(_EventListener.EVENTS.GENERAL_ERROR, {
          message: "Had error decrypting",
          value: "appversion"
        });
      }
    }));
    this.subscriptions.add(this.connection.sessionConfig$.pipe((0, _operators.filter)(c => c.metadata && c.metadata.ChainId !== undefined && c.metadata.JsonRpcUrl !== undefined)).pipe((0, _operators.mergeMap)(c => (0, _rxjs.zip)(aes256gcm.decrypt(c.metadata.ChainId, this._session.secret), aes256gcm.decrypt(c.metadata.JsonRpcUrl, this._session.secret)))).pipe((0, _operators.distinctUntilChanged)()).subscribe({
      next: ([chainId, jsonRpcUrl]) => {
        if (this.chainCallback) {
          this.chainCallback(chainId, jsonRpcUrl);
        }
      },
      error: () => {
        var _this$eventListener5;

        (_this$eventListener5 = this.eventListener) === null || _this$eventListener5 === void 0 ? void 0 : _this$eventListener5.onEvent(_EventListener.EVENTS.GENERAL_ERROR, {
          message: "Had error decrypting",
          value: "chainId|jsonRpcUrl"
        });
      }
    }));
    this.subscriptions.add(this.connection.sessionConfig$.pipe((0, _operators.filter)(c => c.metadata && c.metadata.EthereumAddress !== undefined)).pipe((0, _operators.mergeMap)(c => aes256gcm.decrypt(c.metadata.EthereumAddress, this._session.secret))).subscribe({
      next: selectedAddress => {
        if (this.accountsCallback) {
          this.accountsCallback([selectedAddress]);
        }

        if (WalletSDKRelay.accountRequestCallbackIds.size > 0) {
          // We get the ethereum address from the metadata.  If for whatever
          // reason we don't get a response via an explicit web3 message
          // we can still fulfill the eip1102 request.
          Array.from(WalletSDKRelay.accountRequestCallbackIds.values()).forEach(id => {
            const message = (0, _Web3ResponseMessage.Web3ResponseMessage)({
              id,
              response: (0, _Web3Response.RequestEthereumAccountsResponse)([selectedAddress])
            });
            this.invokeCallback({ ...message,
              id
            });
          });
          WalletSDKRelay.accountRequestCallbackIds.clear();
        }
      },
      error: () => {
        var _this$eventListener6;

        (_this$eventListener6 = this.eventListener) === null || _this$eventListener6 === void 0 ? void 0 : _this$eventListener6.onEvent(_EventListener.EVENTS.GENERAL_ERROR, {
          message: "Had error decrypting",
          value: "selectedAddress"
        });
      }
    }));
    this.ui = options.uiConstructor({
      linkAPIUrl: options.linkAPIUrl,
      version: options.version,
      darkMode: options.darkMode,
      session: this._session,
      connected$: this.connection.connected$
    });
    this.connection.connect();
  }

  attachUI() {
    this.ui.attach();
  }

  resetAndReload() {
    this.connection.setSessionMetadata("__destroyed", "1").pipe((0, _operators.timeout)(1000), (0, _operators.catchError)(_ => (0, _rxjs.of)(null))).subscribe(_ => {
      var _this$eventListener8;

      try {
        this.subscriptions.unsubscribe();
      } catch (err) {
        var _this$eventListener7;

        (_this$eventListener7 = this.eventListener) === null || _this$eventListener7 === void 0 ? void 0 : _this$eventListener7.onEvent(_EventListener.EVENTS.GENERAL_ERROR, {
          message: "Had error unsubscribing"
        });
      }

      (_this$eventListener8 = this.eventListener) === null || _this$eventListener8 === void 0 ? void 0 : _this$eventListener8.onEvent(_EventListener.EVENTS.SESSION_STATE_CHANGE, {
        method: "relay::resetAndReload",
        sessionMetadataChange: "__destroyed, 1",
        sessionIdHash: this.getSessionIdHash(),
        origin: location.origin
      });
      this.connection.destroy();
      /**
       * Only clear storage if the session id we have in memory matches the one on disk
       * Otherwise, in the case where we have 2 tabs, another tab might have cleared
       * storage already.  In that case if we clear storage again, the user will be in
       * a state where the first tab allows the user to connect but the session that
       * was used isn't persisted.  This leaves the user in a state where they aren't
       * connected to the mobile app.
       */

      const storedSession = _Session.Session.load(this.storage);

      if ((storedSession === null || storedSession === void 0 ? void 0 : storedSession.id) === this._session.id) {
        this.storage.clear();
      } else if (storedSession) {
        var _this$eventListener9;

        (_this$eventListener9 = this.eventListener) === null || _this$eventListener9 === void 0 ? void 0 : _this$eventListener9.onEvent(_EventListener.EVENTS.SKIPPED_CLEARING_SESSION, {
          sessionIdHash: this.getSessionIdHash(),
          storedSessionIdHash: _Session.Session.hash(storedSession.id),
          origin: location.origin
        });
      }

      this.ui.reloadUI();
    }, err => {
      var _this$eventListener10;

      (_this$eventListener10 = this.eventListener) === null || _this$eventListener10 === void 0 ? void 0 : _this$eventListener10.onEvent(_EventListener.EVENTS.FAILURE, {
        method: "relay::resetAndReload",
        message: `failed to reset and reload with ${err}`,
        sessionIdHash: this.getSessionIdHash()
      });
    });
  }

  setAppInfo(appName, appLogoUrl) {
    this.appName = appName;
    this.appLogoUrl = appLogoUrl;
  }

  getStorageItem(key) {
    return this.storage.getItem(key);
  }

  get session() {
    return this._session;
  }

  setStorageItem(key, value) {
    this.storage.setItem(key, value);
  }

  signEthereumMessage(message, address, addPrefix, typedDataJson) {
    return this.sendRequest({
      method: _Web3Method.Web3Method.signEthereumMessage,
      params: {
        message: (0, _util.hexStringFromBuffer)(message, true),
        address,
        addPrefix,
        typedDataJson: typedDataJson || null
      }
    });
  }

  ethereumAddressFromSignedMessage(message, signature, addPrefix) {
    return this.sendRequest({
      method: _Web3Method.Web3Method.ethereumAddressFromSignedMessage,
      params: {
        message: (0, _util.hexStringFromBuffer)(message, true),
        signature: (0, _util.hexStringFromBuffer)(signature, true),
        addPrefix
      }
    });
  }

  signEthereumTransaction(params) {
    return this.sendRequest({
      method: _Web3Method.Web3Method.signEthereumTransaction,
      params: {
        fromAddress: params.fromAddress,
        toAddress: params.toAddress,
        weiValue: (0, _util.bigIntStringFromBN)(params.weiValue),
        data: (0, _util.hexStringFromBuffer)(params.data, true),
        nonce: params.nonce,
        gasPriceInWei: params.gasPriceInWei ? (0, _util.bigIntStringFromBN)(params.gasPriceInWei) : null,
        maxFeePerGas: params.gasPriceInWei ? (0, _util.bigIntStringFromBN)(params.gasPriceInWei) : null,
        maxPriorityFeePerGas: params.gasPriceInWei ? (0, _util.bigIntStringFromBN)(params.gasPriceInWei) : null,
        gasLimit: params.gasLimit ? (0, _util.bigIntStringFromBN)(params.gasLimit) : null,
        chainId: params.chainId,
        shouldSubmit: false
      }
    });
  }

  signAndSubmitEthereumTransaction(params) {
    return this.sendRequest({
      method: _Web3Method.Web3Method.signEthereumTransaction,
      params: {
        fromAddress: params.fromAddress,
        toAddress: params.toAddress,
        weiValue: (0, _util.bigIntStringFromBN)(params.weiValue),
        data: (0, _util.hexStringFromBuffer)(params.data, true),
        nonce: params.nonce,
        gasPriceInWei: params.gasPriceInWei ? (0, _util.bigIntStringFromBN)(params.gasPriceInWei) : null,
        maxFeePerGas: params.maxFeePerGas ? (0, _util.bigIntStringFromBN)(params.maxFeePerGas) : null,
        maxPriorityFeePerGas: params.maxPriorityFeePerGas ? (0, _util.bigIntStringFromBN)(params.maxPriorityFeePerGas) : null,
        gasLimit: params.gasLimit ? (0, _util.bigIntStringFromBN)(params.gasLimit) : null,
        chainId: params.chainId,
        shouldSubmit: true
      }
    });
  }

  submitEthereumTransaction(signedTransaction, chainId) {
    return this.sendRequest({
      method: _Web3Method.Web3Method.submitEthereumTransaction,
      params: {
        signedTransaction: (0, _util.hexStringFromBuffer)(signedTransaction, true),
        chainId
      }
    });
  }

  scanQRCode(regExp) {
    return this.sendRequest({
      method: _Web3Method.Web3Method.scanQRCode,
      params: {
        regExp
      }
    });
  }

  getQRCodeUrl() {
    return (0, _util.createQrUrl)(this._session.id, this._session.secret, this.linkAPIUrl, false);
  }

  genericRequest(data, action) {
    return this.sendRequest({
      method: _Web3Method.Web3Method.generic,
      params: {
        action,
        data
      }
    });
  }

  sendGenericMessage(request) {
    return this.sendRequest(request);
  }

  sendRequest(request) {
    let hideSnackbarItem = null;
    const id = (0, _util.randomBytesHex)(8);

    const cancel = () => {
      var _hideSnackbarItem;

      this.publishWeb3RequestCanceledEvent(id);
      this.handleWeb3ResponseMessage((0, _Web3ResponseMessage.Web3ResponseMessage)({
        id,
        response: (0, _Web3Response.ErrorResponse)(request.method, "User rejected request")
      }));
      (_hideSnackbarItem = hideSnackbarItem) === null || _hideSnackbarItem === void 0 ? void 0 : _hideSnackbarItem();
    };

    const promise = new Promise((resolve, reject) => {
      if (!this.ui.isStandalone()) {
        hideSnackbarItem = this.ui.showConnecting({
          isUnlinkedErrorState: this.isUnlinkedErrorState,
          onCancel: cancel,
          onResetConnection: this.resetAndReload // eslint-disable-line @typescript-eslint/unbound-method

        });
      }

      this.relayEventManager.callbacks.set(id, response => {
        var _hideSnackbarItem2;

        (_hideSnackbarItem2 = hideSnackbarItem) === null || _hideSnackbarItem2 === void 0 ? void 0 : _hideSnackbarItem2();

        if (response.errorMessage) {
          return reject(new Error(response.errorMessage));
        }

        resolve(response);
      });

      if (this.ui.isStandalone()) {
        this.sendRequestStandalone(id, request);
      } else {
        this.publishWeb3RequestEvent(id, request);
      }
    });
    return {
      promise,
      cancel
    };
  }

  setConnectDisabled(disabled) {
    this.ui.setConnectDisabled(disabled);
  }

  setAccountsCallback(accountsCallback) {
    this.accountsCallback = accountsCallback;
  }

  setChainCallback(chainCallback) {
    this.chainCallback = chainCallback;
  }

  publishWeb3RequestEvent(id, request) {
    var _this$eventListener11;

    const message = (0, _Web3RequestMessage.Web3RequestMessage)({
      id,
      request
    });

    const storedSession = _Session.Session.load(this.storage);

    (_this$eventListener11 = this.eventListener) === null || _this$eventListener11 === void 0 ? void 0 : _this$eventListener11.onEvent(_EventListener.EVENTS.WEB3_REQUEST, {
      eventId: message.id,
      method: `relay::${message.request.method}`,
      sessionIdHash: this.getSessionIdHash(),
      storedSessionIdHash: storedSession ? _Session.Session.hash(storedSession.id) : "",
      isSessionMismatched: ((storedSession === null || storedSession === void 0 ? void 0 : storedSession.id) !== this._session.id).toString(),
      origin: location.origin
    });
    this.subscriptions.add(this.publishEvent("Web3Request", message, true).subscribe({
      next: _ => {
        var _this$eventListener12;

        (_this$eventListener12 = this.eventListener) === null || _this$eventListener12 === void 0 ? void 0 : _this$eventListener12.onEvent(_EventListener.EVENTS.WEB3_REQUEST_PUBLISHED, {
          eventId: message.id,
          method: `relay::${message.request.method}`,
          sessionIdHash: this.getSessionIdHash(),
          storedSessionIdHash: storedSession ? _Session.Session.hash(storedSession.id) : "",
          isSessionMismatched: ((storedSession === null || storedSession === void 0 ? void 0 : storedSession.id) !== this._session.id).toString(),
          origin: location.origin
        });
      },
      error: err => {
        this.handleWeb3ResponseMessage((0, _Web3ResponseMessage.Web3ResponseMessage)({
          id: message.id,
          response: {
            method: message.request.method,
            errorMessage: err.message
          }
        }));
      }
    }));
  }

  publishWeb3RequestCanceledEvent(id) {
    const message = (0, _Web3RequestCanceledMessage.Web3RequestCanceledMessage)(id);
    this.subscriptions.add(this.publishEvent("Web3RequestCanceled", message, false).subscribe());
  }

  publishEvent(event, message, callWebhook) {
    const secret = this.session.secret;
    return new _rxjs.Observable(subscriber => {
      void aes256gcm.encrypt(JSON.stringify({ ...message,
        origin: location.origin
      }), secret).then(encrypted => {
        subscriber.next(encrypted);
        subscriber.complete();
      });
    }).pipe((0, _operators.mergeMap)(encrypted => {
      return this.connection.publishEvent(event, encrypted, callWebhook);
    }));
  }

  handleIncomingEvent(event) {
    try {
      this.subscriptions.add(aes256gcm.decrypt(event.data, this.session.secret).pipe((0, _operators.map)(c => JSON.parse(c))).subscribe({
        next: json => {
          const message = (0, _Web3ResponseMessage.isWeb3ResponseMessage)(json) ? json : null;

          if (!message) {
            return;
          }

          this.handleWeb3ResponseMessage(message);
        },
        error: () => {
          var _this$eventListener13;

          (_this$eventListener13 = this.eventListener) === null || _this$eventListener13 === void 0 ? void 0 : _this$eventListener13.onEvent(_EventListener.EVENTS.GENERAL_ERROR, {
            message: "Had error decrypting",
            value: "incomingEvent"
          });
        }
      }));
    } catch {
      return;
    }
  }

  handleWeb3ResponseMessage(message) {
    var _this$eventListener14;

    const {
      response
    } = message;
    (_this$eventListener14 = this.eventListener) === null || _this$eventListener14 === void 0 ? void 0 : _this$eventListener14.onEvent(_EventListener.EVENTS.WEB3_RESPONSE, {
      eventId: message.id,
      method: `relay::${response.method}`,
      sessionIdHash: this.getSessionIdHash(),
      origin: location.origin
    });

    if ((0, _Web3Response.isRequestEthereumAccountsResponse)(response)) {
      WalletSDKRelay.accountRequestCallbackIds.forEach(id => this.invokeCallback({ ...message,
        id
      }));
      WalletSDKRelay.accountRequestCallbackIds.clear();
      return;
    }

    this.invokeCallback(message);
  }

  invokeCallback(message) {
    const callback = this.relayEventManager.callbacks.get(message.id);

    if (callback) {
      callback(message.response);
      this.relayEventManager.callbacks.delete(message.id);
    }
  }

  requestEthereumAccounts() {
    const request = {
      method: _Web3Method.Web3Method.requestEthereumAccounts,
      params: {
        appName: this.appName,
        appLogoUrl: this.appLogoUrl || null
      }
    };
    const hideSnackbarItem = null;
    const id = (0, _util.randomBytesHex)(8);

    const cancel = () => {
      this.publishWeb3RequestCanceledEvent(id);
      this.handleWeb3ResponseMessage((0, _Web3ResponseMessage.Web3ResponseMessage)({
        id,
        response: (0, _Web3Response.ErrorResponse)(request.method, "User rejected request")
      })); // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore

      hideSnackbarItem === null || hideSnackbarItem === void 0 ? void 0 : hideSnackbarItem();
    };

    const promise = new Promise((resolve, reject) => {
      var _window, _window$navigator;

      this.relayEventManager.callbacks.set(id, response => {
        this.ui.hideRequestEthereumAccounts(); // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore

        hideSnackbarItem === null || hideSnackbarItem === void 0 ? void 0 : hideSnackbarItem();

        if (response.errorMessage) {
          return reject(new Error(response.errorMessage));
        }

        resolve(response);
      });
      const userAgent = ((_window = window) === null || _window === void 0 ? void 0 : (_window$navigator = _window.navigator) === null || _window$navigator === void 0 ? void 0 : _window$navigator.userAgent) || null;

      if (userAgent && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
        window.location.href = `https://go.cb-w.com/xoXnYwQimhb?cb_url=${encodeURIComponent(window.location.href)}`;
        return;
      }

      if (this.ui.inlineAccountsResponse()) {
        const onAccounts = accounts => {
          this.handleWeb3ResponseMessage((0, _Web3ResponseMessage.Web3ResponseMessage)({
            id,
            response: (0, _Web3Response.RequestEthereumAccountsResponse)(accounts)
          }));
        };

        this.ui.requestEthereumAccounts({
          onCancel: cancel,
          onAccounts
        });
      } else {
        this.ui.requestEthereumAccounts({
          onCancel: cancel
        });
      }

      WalletSDKRelay.accountRequestCallbackIds.add(id);

      if (!this.ui.inlineAccountsResponse() && !this.ui.isStandalone()) {
        this.publishWeb3RequestEvent(id, request);
      }
    });
    return {
      promise,
      cancel
    };
  }

  watchAsset(type, address, symbol, decimals, image, chainId) {
    const request = {
      method: _Web3Method.Web3Method.watchAsset,
      params: {
        type,
        options: {
          address,
          symbol,
          decimals,
          image
        },
        chainId
      }
    };
    let hideSnackbarItem = null;
    const id = (0, _util.randomBytesHex)(8);

    const cancel = () => {
      var _hideSnackbarItem3;

      this.publishWeb3RequestCanceledEvent(id);
      this.handleWeb3ResponseMessage((0, _Web3ResponseMessage.Web3ResponseMessage)({
        id,
        response: (0, _Web3Response.ErrorResponse)(request.method, "User rejected request")
      }));
      (_hideSnackbarItem3 = hideSnackbarItem) === null || _hideSnackbarItem3 === void 0 ? void 0 : _hideSnackbarItem3();
    };

    if (!this.ui.inlineWatchAsset()) {
      hideSnackbarItem = this.ui.showConnecting({
        isUnlinkedErrorState: this.isUnlinkedErrorState,
        onCancel: cancel,
        onResetConnection: this.resetAndReload // eslint-disable-line @typescript-eslint/unbound-method

      });
    }

    const promise = new Promise((resolve, reject) => {
      this.relayEventManager.callbacks.set(id, response => {
        var _hideSnackbarItem4;

        (_hideSnackbarItem4 = hideSnackbarItem) === null || _hideSnackbarItem4 === void 0 ? void 0 : _hideSnackbarItem4();

        if (response.errorMessage) {
          return reject(new Error(response.errorMessage));
        }

        resolve(response);
      });

      const _cancel = () => {
        this.handleWeb3ResponseMessage((0, _Web3ResponseMessage.Web3ResponseMessage)({
          id,
          response: (0, _Web3Response.WatchAssetReponse)(false)
        }));
      };

      const approve = () => {
        this.handleWeb3ResponseMessage((0, _Web3ResponseMessage.Web3ResponseMessage)({
          id,
          response: (0, _Web3Response.WatchAssetReponse)(true)
        }));
      };

      if (this.ui.inlineWatchAsset()) {
        this.ui.watchAsset({
          onApprove: approve,
          onCancel: _cancel,
          type,
          address,
          symbol,
          decimals,
          image,
          chainId
        });
      }

      if (!this.ui.inlineWatchAsset() && !this.ui.isStandalone()) {
        this.publishWeb3RequestEvent(id, request);
      }
    });
    return {
      cancel,
      promise
    };
  }

  addEthereumChain(chainId, rpcUrls, iconUrls, blockExplorerUrls, chainName, nativeCurrency) {
    const request = {
      method: _Web3Method.Web3Method.addEthereumChain,
      params: {
        chainId,
        rpcUrls,
        blockExplorerUrls,
        chainName,
        iconUrls,
        nativeCurrency
      }
    };
    let hideSnackbarItem = null;
    const id = (0, _util.randomBytesHex)(8);

    const cancel = () => {
      var _hideSnackbarItem5;

      this.publishWeb3RequestCanceledEvent(id);
      this.handleWeb3ResponseMessage((0, _Web3ResponseMessage.Web3ResponseMessage)({
        id,
        response: (0, _Web3Response.ErrorResponse)(request.method, "User rejected request")
      }));
      (_hideSnackbarItem5 = hideSnackbarItem) === null || _hideSnackbarItem5 === void 0 ? void 0 : _hideSnackbarItem5();
    };

    if (!this.ui.inlineAddEthereumChain(chainId)) {
      hideSnackbarItem = this.ui.showConnecting({
        isUnlinkedErrorState: this.isUnlinkedErrorState,
        onCancel: cancel,
        onResetConnection: this.resetAndReload // eslint-disable-line @typescript-eslint/unbound-method

      });
    }

    const promise = new Promise((resolve, reject) => {
      this.relayEventManager.callbacks.set(id, response => {
        var _hideSnackbarItem6;

        (_hideSnackbarItem6 = hideSnackbarItem) === null || _hideSnackbarItem6 === void 0 ? void 0 : _hideSnackbarItem6();

        if (response.errorMessage) {
          return reject(new Error(response.errorMessage));
        }

        resolve(response);
      });

      const _cancel = () => {
        this.handleWeb3ResponseMessage((0, _Web3ResponseMessage.Web3ResponseMessage)({
          id,
          response: (0, _Web3Response.AddEthereumChainResponse)({
            isApproved: false,
            rpcUrl: ""
          })
        }));
      };

      const approve = rpcUrl => {
        this.handleWeb3ResponseMessage((0, _Web3ResponseMessage.Web3ResponseMessage)({
          id,
          response: (0, _Web3Response.AddEthereumChainResponse)({
            isApproved: true,
            rpcUrl
          })
        }));
      };

      if (this.ui.inlineAddEthereumChain(chainId)) {
        this.ui.addEthereumChain({
          onCancel: _cancel,
          onApprove: approve,
          chainId: request.params.chainId,
          rpcUrls: request.params.rpcUrls,
          blockExplorerUrls: request.params.blockExplorerUrls,
          chainName: request.params.chainName,
          iconUrls: request.params.iconUrls,
          nativeCurrency: request.params.nativeCurrency
        });
      }

      if (!this.ui.inlineAddEthereumChain(chainId) && !this.ui.isStandalone()) {
        this.publishWeb3RequestEvent(id, request);
      }
    });
    return {
      promise,
      cancel
    };
  }

  switchEthereumChain(chainId) {
    const request = {
      method: _Web3Method.Web3Method.switchEthereumChain,
      params: {
        chainId
      }
    };
    let hideSnackbarItem = null;
    const id = (0, _util.randomBytesHex)(8);

    const cancel = () => {
      var _hideSnackbarItem7;

      this.publishWeb3RequestCanceledEvent(id);
      this.handleWeb3ResponseMessage((0, _Web3ResponseMessage.Web3ResponseMessage)({
        id,
        response: (0, _Web3Response.ErrorResponse)(request.method, "User rejected request")
      }));
      (_hideSnackbarItem7 = hideSnackbarItem) === null || _hideSnackbarItem7 === void 0 ? void 0 : _hideSnackbarItem7();
    };

    if (!this.ui.inlineSwitchEthereumChain()) {
      hideSnackbarItem = this.ui.showConnecting({
        isUnlinkedErrorState: this.isUnlinkedErrorState,
        onCancel: cancel,
        onResetConnection: this.resetAndReload // eslint-disable-line @typescript-eslint/unbound-method

      });
    }

    const promise = new Promise((resolve, reject) => {
      this.relayEventManager.callbacks.set(id, response => {
        var _hideSnackbarItem8;

        (_hideSnackbarItem8 = hideSnackbarItem) === null || _hideSnackbarItem8 === void 0 ? void 0 : _hideSnackbarItem8();

        if (response.errorMessage && response.errorCode) {
          return reject(_ethRpcErrors.ethErrors.provider.custom({
            code: response.errorCode,
            message: `Unrecognized chain ID. Try adding the chain using addEthereumChain first.`
          }));
        } else if (response.errorMessage) {
          return reject(new Error(response.errorMessage));
        }

        resolve(response);
      });

      const _cancel = errorCode => {
        if (errorCode) {
          this.handleWeb3ResponseMessage((0, _Web3ResponseMessage.Web3ResponseMessage)({
            id,
            response: (0, _Web3Response.ErrorResponse)(_Web3Method.Web3Method.switchEthereumChain, "unsupported chainId", errorCode)
          }));
        } else {
          this.handleWeb3ResponseMessage((0, _Web3ResponseMessage.Web3ResponseMessage)({
            id,
            response: (0, _Web3Response.SwitchEthereumChainResponse)({
              isApproved: false,
              rpcUrl: ""
            })
          }));
        }
      };

      const approve = rpcUrl => {
        this.handleWeb3ResponseMessage((0, _Web3ResponseMessage.Web3ResponseMessage)({
          id,
          response: (0, _Web3Response.SwitchEthereumChainResponse)({
            isApproved: true,
            rpcUrl
          })
        }));
      };

      this.ui.switchEthereumChain({
        onCancel: _cancel,
        onApprove: approve,
        chainId: request.params.chainId
      });

      if (!this.ui.inlineSwitchEthereumChain() && !this.ui.isStandalone()) {
        this.publishWeb3RequestEvent(id, request);
      }
    });
    return {
      promise,
      cancel
    };
  }

  inlineAddEthereumChain(chainId) {
    return this.ui.inlineAddEthereumChain(chainId);
  }

  getSessionIdHash() {
    return _Session.Session.hash(this._session.id);
  }

  sendRequestStandalone(id, request) {
    const _cancel = () => {
      this.handleWeb3ResponseMessage((0, _Web3ResponseMessage.Web3ResponseMessage)({
        id,
        response: (0, _Web3Response.ErrorResponse)(request.method, "User rejected request")
      }));
    };

    const onSuccess = response => {
      this.handleWeb3ResponseMessage((0, _Web3ResponseMessage.Web3ResponseMessage)({
        id,
        response
      }));
    };

    switch (request.method) {
      case _Web3Method.Web3Method.signEthereumMessage:
        this.ui.signEthereumMessage({
          request,
          onSuccess,
          onCancel: _cancel
        });
        break;

      case _Web3Method.Web3Method.signEthereumTransaction:
        this.ui.signEthereumTransaction({
          request,
          onSuccess,
          onCancel: _cancel
        });
        break;

      case _Web3Method.Web3Method.submitEthereumTransaction:
        this.ui.submitEthereumTransaction({
          request,
          onSuccess,
          onCancel: _cancel
        });
        break;

      case _Web3Method.Web3Method.ethereumAddressFromSignedMessage:
        this.ui.ethereumAddressFromSignedMessage({
          request,
          onSuccess
        });
        break;

      default:
        _cancel();

        break;
    }
  }

}, _defineProperty(_class2, "accountRequestCallbackIds", new Set()), _class2), (_applyDecoratedDescriptor(_class.prototype, "resetAndReload", [_bindDecorator.default], Object.getOwnPropertyDescriptor(_class.prototype, "resetAndReload"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "handleIncomingEvent", [_bindDecorator.default], Object.getOwnPropertyDescriptor(_class.prototype, "handleIncomingEvent"), _class.prototype)), _class);
exports.WalletSDKRelay = WalletSDKRelay;