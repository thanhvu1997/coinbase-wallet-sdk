"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AddEthereumChainResponse = AddEthereumChainResponse;
exports.ErrorResponse = ErrorResponse;
exports.EthereumAddressFromSignedMessageResponse = EthereumAddressFromSignedMessageResponse;
exports.RequestEthereumAccountsResponse = RequestEthereumAccountsResponse;
exports.SignEthereumMessageResponse = SignEthereumMessageResponse;
exports.SignEthereumTransactionResponse = SignEthereumTransactionResponse;
exports.SubmitEthereumTransactionResponse = SubmitEthereumTransactionResponse;
exports.SwitchEthereumChainResponse = SwitchEthereumChainResponse;
exports.WatchAssetReponse = WatchAssetReponse;
exports.isRequestEthereumAccountsResponse = isRequestEthereumAccountsResponse;

var _Web3Method = require("./Web3Method");

// Copyright (c) 2018-2022 Coinbase, Inc. <https://www.coinbase.com/>
// Licensed under the Apache License, version 2.0
function ErrorResponse(method, errorMessage, errorCode) {
  return {
    method,
    errorMessage,
    errorCode
  };
}

function AddEthereumChainResponse(addResponse) {
  return {
    method: _Web3Method.Web3Method.addEthereumChain,
    result: addResponse
  };
}

function SwitchEthereumChainResponse(switchResponse) {
  return {
    method: _Web3Method.Web3Method.switchEthereumChain,
    result: switchResponse
  };
}

function RequestEthereumAccountsResponse(addresses) {
  return {
    method: _Web3Method.Web3Method.requestEthereumAccounts,
    result: addresses
  };
}

function WatchAssetReponse(success) {
  return {
    method: _Web3Method.Web3Method.watchAsset,
    result: success
  };
}

function isRequestEthereumAccountsResponse(res) {
  return res && res.method === _Web3Method.Web3Method.requestEthereumAccounts;
}

function SignEthereumMessageResponse(signature) {
  return {
    method: _Web3Method.Web3Method.signEthereumMessage,
    result: signature
  };
}

// signature
function SignEthereumTransactionResponse(signedData) {
  return {
    method: _Web3Method.Web3Method.signEthereumTransaction,
    result: signedData
  };
}

// signed transaction
function SubmitEthereumTransactionResponse(txHash) {
  return {
    method: _Web3Method.Web3Method.submitEthereumTransaction,
    result: txHash
  };
}

// transaction hash
function EthereumAddressFromSignedMessageResponse(address) {
  return {
    method: _Web3Method.Web3Method.ethereumAddressFromSignedMessage,
    result: address
  };
}