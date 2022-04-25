"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ClientMessageGetSessionConfig = ClientMessageGetSessionConfig;
exports.ClientMessageHostSession = ClientMessageHostSession;
exports.ClientMessageIsLinked = ClientMessageIsLinked;
exports.ClientMessagePublishEvent = ClientMessagePublishEvent;
exports.ClientMessageSetSessionConfig = ClientMessageSetSessionConfig;

// Copyright (c) 2018-2022 Coinbase, Inc. <https://www.coinbase.com/>
// Licensed under the Apache License, version 2.0
function ClientMessageHostSession(params) {
  return {
    type: "HostSession",
    ...params
  };
}

function ClientMessageIsLinked(params) {
  return {
    type: "IsLinked",
    ...params
  };
}

function ClientMessageGetSessionConfig(params) {
  return {
    type: "GetSessionConfig",
    ...params
  };
}

function ClientMessageSetSessionConfig(params) {
  return {
    type: "SetSessionConfig",
    ...params
  };
}

function ClientMessagePublishEvent(params) {
  return {
    type: "PublishEvent",
    ...params
  };
}