"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LinkDialog = void 0;

var _clsx = _interopRequireDefault(require("clsx"));

var _hooks = require("preact/hooks");

var _util = require("../util");

var _version = require("../version");

var _LinkDialogCss = _interopRequireDefault(require("./LinkDialog-css"));

var _QRCode = require("./QRCode");

var _Spinner = require("./Spinner");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Copyright (c) 2018-2022 Coinbase, Inc. <https://www.coinbase.com/>
// Licensed under the Apache License, version 2.0
const LinkDialog = props => {
  const [isContainerHidden, setContainerHidden] = (0, _hooks.useState)(!props.isOpen);
  const [isDialogHidden, setDialogHidden] = (0, _hooks.useState)(!props.isOpen);
  (0, _hooks.useEffect)(() => {
    const {
      isOpen
    } = props;
    const timers = [window.setTimeout(() => {
      setDialogHidden(!isOpen);
    }, 10)];

    if (isOpen) {
      setContainerHidden(false);
    } else {
      timers.push(window.setTimeout(() => {
        setContainerHidden(true);
      }, 360));
    }

    return () => {
      timers.forEach(window.clearTimeout);
    };
  }, [props.isOpen]);
  return h("div", {
    class: (0, _clsx.default)("-cbwsdk-link-dialog-container", props.darkMode && "-cbwsdk-link-dialog-container-dark", isContainerHidden && "-cbwsdk-link-dialog-container-hidden")
  }, h("style", null, _LinkDialogCss.default), h("div", {
    class: (0, _clsx.default)("-cbwsdk-link-dialog-backdrop", isDialogHidden && "-cbwsdk-link-dialog-backdrop-hidden")
  }), h("div", {
    class: "-cbwsdk-link-dialog"
  }, h("div", {
    class: (0, _clsx.default)("-cbwsdk-link-dialog-box", isDialogHidden && "-cbwsdk-link-dialog-box-hidden")
  }, h(ScanQRCode, {
    darkMode: props.darkMode,
    version: props.version,
    sessionId: props.sessionId,
    sessionSecret: props.sessionSecret,
    linkAPIUrl: props.linkAPIUrl,
    isConnected: props.isConnected,
    isParentConnection: props.isParentConnection
  }), props.onCancel && h(CancelButton, {
    onClick: props.onCancel
  }))));
};

exports.LinkDialog = LinkDialog;

const ScanQRCode = props => {
  const qrUrl = (0, _util.createQrUrl)(props.sessionId, props.sessionSecret, props.linkAPIUrl, props.isParentConnection);
  return h("div", {
    class: "-cbwsdk-link-dialog-box-content"
  }, h("h3", null, "Scan to", h("br", null), " Connect"), h("div", {
    class: "-cbwsdk-link-dialog-box-content-qrcode"
  }, h("div", {
    class: "-cbwsdk-link-dialog-box-content-qrcode-wrapper"
  }, h(_QRCode.QRCode, {
    content: qrUrl,
    width: 224,
    height: 224,
    fgColor: "#000",
    bgColor: "transparent"
  })), h("input", {
    type: "hidden",
    name: "cbwsdk-version",
    value: _version.LIB_VERSION
  }), h("input", {
    type: "hidden",
    value: qrUrl
  }), !props.isConnected && h("div", {
    class: "-cbwsdk-link-dialog-box-content-qrcode-connecting"
  }, h(_Spinner.Spinner, {
    size: 128,
    color: props.darkMode ? "#fff" : "#000"
  }), h("p", null, "Connecting...")), h("p", {
    title: `Coinbase Wallet SDK v${props.version}`
  }, "Powered by Coinbase Wallet SDK")), h("a", {
    href: `${props.linkAPIUrl}/#/wallets`,
    target: "_blank",
    rel: "noopener"
  }, "Don\u2019t have a wallet app?"));
};

const CancelButton = props => h("button", {
  class: "-cbwsdk-link-dialog-box-cancel",
  onClick: props.onClick
}, h("div", {
  class: "-cbwsdk-link-dialog-box-cancel-x"
}));