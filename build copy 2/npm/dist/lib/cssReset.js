"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.injectCssReset = injectCssReset;

var _cssResetCss = _interopRequireDefault(require("./cssReset-css"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Copyright (c) 2018-2022 Coinbase, Inc. <https://www.coinbase.com/>
// Licensed under the Apache License, version 2.0
function injectCssReset() {
  const styleEl = document.createElement("style");
  styleEl.type = "text/css";
  styleEl.appendChild(document.createTextNode(_cssResetCss.default));
  document.documentElement.appendChild(styleEl);
}