"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Web3ResponseMessage = Web3ResponseMessage;
exports.isWeb3ResponseMessage = isWeb3ResponseMessage;

var _RelayMessage = require("./RelayMessage");

// Copyright (c) 2018-2022 Coinbase, Inc. <https://www.coinbase.com/>
// Licensed under the Apache License, version 2.0
function Web3ResponseMessage(params) {
  return {
    type: _RelayMessage.RelayMessageType.WEB3_RESPONSE,
    ...params
  };
}

function isWeb3ResponseMessage(msg) {
  return msg && msg.type === _RelayMessage.RelayMessageType.WEB3_RESPONSE;
}