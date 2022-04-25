"use strict";Object.defineProperty(exports,"__esModule",{value:true});exports.Web3RequestMessage=Web3RequestMessage;var _RelayMessage=require("./RelayMessage");// Copyright (c) 2018-2022 Coinbase, Inc. <https://www.coinbase.com/>
// Licensed under the Apache License, version 2.0
function Web3RequestMessage(params){return{type:_RelayMessage.RelayMessageType.WEB3_REQUEST,...params};}