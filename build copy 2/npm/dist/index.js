"use strict";Object.defineProperty(exports,"__esModule",{value:true});Object.defineProperty(exports,"CoinbaseWalletProvider",{enumerable:true,get:function(){return _CoinbaseWalletProvider.CoinbaseWalletProvider;}});Object.defineProperty(exports,"CoinbaseWalletSDK",{enumerable:true,get:function(){return _CoinbaseWalletSDK.CoinbaseWalletSDK;}});exports.default=void 0;var _CoinbaseWalletSDK=require("./CoinbaseWalletSDK");var _CoinbaseWalletProvider=require("./provider/CoinbaseWalletProvider");// Copyright (c) 2018-2022 Coinbase, Inc. <https://www.coinbase.com/>
// Licensed under the Apache License, version 2.0
var _default=_CoinbaseWalletSDK.CoinbaseWalletSDK;exports.default=_default;if(typeof window!=="undefined"){window.CoinbaseWalletSDK=_CoinbaseWalletSDK.CoinbaseWalletSDK;window.CoinbaseWalletProvider=_CoinbaseWalletProvider.CoinbaseWalletProvider;/**
   * @deprecated Use `window.CoinbaseWalletSDK`
   */window.WalletLink=_CoinbaseWalletSDK.CoinbaseWalletSDK;/**
   * @deprecated Use `window.CoinbaseWalletProvider`
   */window.WalletLinkProvider=_CoinbaseWalletProvider.CoinbaseWalletProvider;}