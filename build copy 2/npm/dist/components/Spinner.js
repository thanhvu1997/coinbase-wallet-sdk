"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Spinner = void 0;

var _SpinnerCss = _interopRequireDefault(require("./Spinner-css"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Copyright (c) 2018-2022 Coinbase, Inc. <https://www.coinbase.com/>
// Licensed under the Apache License, version 2.0
const Spinner = props => {
  var _props$size;

  const size = (_props$size = props.size) !== null && _props$size !== void 0 ? _props$size : 64;
  const color = props.color || "#000";
  return h("div", {
    class: "-cbwsdk-spinner"
  }, h("style", null, _SpinnerCss.default), h("svg", {
    viewBox: "0 0 100 100",
    xmlns: "http://www.w3.org/2000/svg",
    style: {
      width: size,
      height: size
    }
  }, h("circle", {
    style: {
      cx: 50,
      cy: 50,
      r: 45,
      stroke: color
    }
  })));
};

exports.Spinner = Spinner;