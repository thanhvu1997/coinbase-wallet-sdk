"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isServerMessageFail = isServerMessageFail;

// Copyright (c) 2018-2022 Coinbase, Inc. <https://www.coinbase.com/>
// Licensed under the Apache License, version 2.0
function isServerMessageFail(msg) {
  return msg && msg.type === "Fail" && typeof msg.id === "number" && typeof msg.sessionId === "string" && typeof msg.error === "string";
}