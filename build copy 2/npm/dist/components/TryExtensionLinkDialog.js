"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TryExtensionLinkDialog = void 0;
const clsx_1 = __importDefault(require("clsx"));
const preact_1 = require("preact");
const hooks_1 = require("preact/hooks");
const util_1 = require("../util");
const version_1 = require("../version");
const globe_icon_svg_1 = __importDefault(require("./icons/globe-icon-svg"));
const link_icon_svg_1 = __importDefault(require("./icons/link-icon-svg"));
const lock_icon_svg_1 = __importDefault(require("./icons/lock-icon-svg"));
const QRLogo_1 = __importDefault(require("./icons/QRLogo"));
const QRCode_1 = require("./QRCode");
const Spinner_1 = require("./Spinner");
const TryExtensionLinkDialog_css_1 = __importDefault(require("./TryExtensionLinkDialog-css"));
const TryExtensionLinkDialog = props => {
    const [isContainerHidden, setContainerHidden] = (0, hooks_1.useState)(!props.isOpen);
    const [isDialogHidden, setDialogHidden] = (0, hooks_1.useState)(!props.isOpen);
    (0, hooks_1.useEffect)(() => {
        const { isOpen } = props;
        const timers = [
            window.setTimeout(() => {
                setDialogHidden(!isOpen);
            }, 10)
        ];
        if (isOpen) {
            setContainerHidden(false);
        }
        else {
            timers.push(window.setTimeout(() => {
                setContainerHidden(true);
            }, 360));
        }
        return () => {
            timers.forEach(window.clearTimeout);
        };
    }, [props.isOpen]);
    return ((0, preact_1.h)("div", { class: (0, clsx_1.default)("-cbwsdk-extension-dialog-container", isContainerHidden && "-cbwsdk-extension-dialog-container-hidden") },
        (0, preact_1.h)("style", null, TryExtensionLinkDialog_css_1.default),
        (0, preact_1.h)("div", { class: (0, clsx_1.default)("-cbwsdk-extension-dialog-backdrop", isDialogHidden && "-cbwsdk-extension-dialog-backdrop-hidden") }),
        (0, preact_1.h)("div", { class: "-cbwsdk-extension-dialog" },
            (0, preact_1.h)("div", { class: (0, clsx_1.default)("-cbwsdk-extension-dialog-box", isDialogHidden && "-cbwsdk-extension-dialog-box-hidden") },
                (0, preact_1.h)(TryExtensionBox, { onInstallClick: () => {
                        window.open("https://api.wallet.coinbase.com/rpc/v2/desktop/chrome", "_blank");
                    } }),
                !props.connectDisabled ? ((0, preact_1.h)(ScanQRBox, { darkMode: props.darkMode, version: props.version, sessionId: props.sessionId, sessionSecret: props.sessionSecret, linkAPIUrl: props.linkAPIUrl, isConnected: props.isConnected, isParentConnection: props.isParentConnection })) : null,
                props.onCancel && (0, preact_1.h)(CancelButton, { onClick: props.onCancel })))));
};
exports.TryExtensionLinkDialog = TryExtensionLinkDialog;
const TryExtensionBox = ({ onInstallClick }) => {
    const [isClicked, setIsClicked] = (0, hooks_1.useState)(false);
    const clickHandler = (0, hooks_1.useCallback)(() => {
        if (isClicked) {
            window.location.reload();
        }
        else {
            onInstallClick();
            setIsClicked(true);
        }
    }, [onInstallClick, isClicked]);
    return ((0, preact_1.h)("div", { class: "-cbwsdk-extension-dialog-box-top" },
        (0, preact_1.h)("div", { class: "-cbwsdk-extension-dialog-box-top-install-region" },
            (0, preact_1.h)("h2", null, "Try the Coinbase Wallet extension"),
            isClicked && ((0, preact_1.h)("div", { class: "-cbwsdk-extension-dialog-box-top-subtext" }, "After installing Coinbase Wallet, refresh the page and connect again.")),
            (0, preact_1.h)("button", { type: "button", onClick: clickHandler }, isClicked ? "Refresh" : "Install")),
        (0, preact_1.h)("div", { class: "-cbwsdk-extension-dialog-box-top-info-region" },
            (0, preact_1.h)(DescriptionItem, { icon: link_icon_svg_1.default, text: "Connect to crypto apps with one click" }),
            (0, preact_1.h)(DescriptionItem, { icon: lock_icon_svg_1.default, text: "Your private key is stored securely" }),
            (0, preact_1.h)(DescriptionItem, { icon: globe_icon_svg_1.default, text: "Works with Ethereum, Polygon, and more" }))));
};
const ScanQRBox = props => {
    const qrUrl = (0, util_1.createQrUrl)(props.sessionId, props.sessionSecret, props.linkAPIUrl, props.isParentConnection);
    return ((0, preact_1.h)("div", { class: "-cbwsdk-extension-dialog-box-bottom" },
        (0, preact_1.h)("div", { class: "-cbwsdk-extension-dialog-box-bottom-description-region" },
            (0, preact_1.h)("h2", null, "Or scan to connect"),
            (0, preact_1.h)("body", { class: "-cbwsdk-extension-dialog-box-bottom-description" },
                "Open",
                " ",
                (0, preact_1.h)("a", { href: "https://wallet.coinbase.com/", target: "_blank", rel: "noopener noreferrer" }, "Coinbase Wallet"),
                " ",
                "on your mobile phone and scan")),
        (0, preact_1.h)("div", { class: "-cbwsdk-extension-dialog-box-bottom-qr-region" },
            (0, preact_1.h)("div", { class: "-cbwsdk-extension-dialog-box-bottom-qr-wrapper" },
                (0, preact_1.h)(QRCode_1.QRCode, { content: qrUrl, width: 150, height: 150, fgColor: "#000", bgColor: "transparent", image: {
                        svg: QRLogo_1.default,
                        width: 34,
                        height: 34
                    } })),
            (0, preact_1.h)("input", { type: "hidden", name: "cbwsdk-version", value: version_1.LIB_VERSION }),
            (0, preact_1.h)("input", { type: "hidden", value: qrUrl }),
            !props.isConnected && ((0, preact_1.h)("div", { class: "-cbwsdk-extension-dialog-box-bottom-qr-connecting" },
                (0, preact_1.h)(Spinner_1.Spinner, { size: 36, color: "#000" }),
                (0, preact_1.h)("p", null, "Connecting..."))))));
};
const DescriptionItem = props => {
    return ((0, preact_1.h)("div", { class: "-cbwsdk-extension-dialog-box-top-description" },
        (0, preact_1.h)("div", { class: "-cbwsdk-extension-dialog-box-top-description-icon-wrapper" },
            (0, preact_1.h)("img", { src: props.icon })),
        (0, preact_1.h)("body", { class: "-cbwsdk-extension-dialog-box-top-description-text" }, props.text)));
};
const CancelButton = props => ((0, preact_1.h)("button", { type: "button", class: "-cbwsdk-extension-dialog-box-cancel", onClick: props.onClick },
    (0, preact_1.h)("div", { class: "-cbwsdk-extension-dialog-box-cancel-x" })));
