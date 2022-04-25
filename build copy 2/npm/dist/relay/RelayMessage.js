"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RelayMessageType = void 0;
// Copyright (c) 2018-2022 Coinbase, Inc. <https://www.coinbase.com/>
// Licensed under the Apache License, version 2.0
let RelayMessageType;
exports.RelayMessageType = RelayMessageType;

(function (RelayMessageType) {
  RelayMessageType["SESSION_ID_REQUEST"] = "SESSION_ID_REQUEST";
  RelayMessageType["SESSION_ID_RESPONSE"] = "SESSION_ID_RESPONSE";
  RelayMessageType["LINKED"] = "LINKED";
  RelayMessageType["UNLINKED"] = "UNLINKED";
  RelayMessageType["WEB3_REQUEST"] = "WEB3_REQUEST";
  RelayMessageType["WEB3_REQUEST_CANCELED"] = "WEB3_REQUEST_CANCELED";
  RelayMessageType["WEB3_RESPONSE"] = "WEB3_RESPONSE";
})(RelayMessageType || (exports.RelayMessageType = RelayMessageType = {}));