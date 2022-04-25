import { EthereumAddressFromSignedMessageRequest, SignEthereumMessageRequest, SignEthereumTransactionRequest, SubmitEthereumTransactionRequest } from "../relay/Web3Request";
import { EthereumAddressFromSignedMessageResponse, SignEthereumMessageResponse, SignEthereumTransactionResponse, SubmitEthereumTransactionResponse } from "../relay/Web3Response";
import { WalletUI, WalletUIOptions } from "./WalletUI";
export declare class WalletSDKUI implements WalletUI {
    private readonly linkFlow;
    private readonly snackbar;
    private attached;
    constructor(options: Readonly<WalletUIOptions>);
    attach(): void;
    setConnectDisabled(connectDisabled: boolean): void;
    addEthereumChain(options: {
        onCancel: () => void;
        onApprove: () => void;
        chainId: string;
        rpcUrls: string[];
        blockExplorerUrls?: string[];
        chainName?: string;
        iconUrls?: string[];
        nativeCurrency?: {
            name: string;
            symbol: string;
            decimals: number;
        };
    }): void;
    watchAsset(_options: {
        onCancel: () => void;
        onApprove: () => void;
        type: string;
        address: string;
        symbol?: string;
        decimals?: number;
        image?: string;
    }): void;
    switchEthereumChain(_options: {
        onCancel: () => void;
        onApprove: () => void;
        chainId: string;
    }): void;
    requestEthereumAccounts(options: {
        onCancel: () => void;
    }): void;
    hideRequestEthereumAccounts(): void;
    signEthereumMessage(_: {
        request: SignEthereumMessageRequest;
        onSuccess: (response: SignEthereumMessageResponse) => void;
        onCancel: () => void;
    }): void;
    signEthereumTransaction(_: {
        request: SignEthereumTransactionRequest;
        onSuccess: (response: SignEthereumTransactionResponse) => void;
        onCancel: () => void;
    }): void;
    submitEthereumTransaction(_: {
        request: SubmitEthereumTransactionRequest;
        onSuccess: (response: SubmitEthereumTransactionResponse) => void;
        onCancel: () => void;
    }): void;
    ethereumAddressFromSignedMessage(_: {
        request: EthereumAddressFromSignedMessageRequest;
        onSuccess: (response: EthereumAddressFromSignedMessageResponse) => void;
    }): void;
    showConnecting(options: {
        isUnlinkedErrorState?: boolean;
        onCancel: () => void;
        onResetConnection: () => void;
    }): () => void;
    reloadUI(): void;
    inlineAccountsResponse(): boolean;
    inlineAddEthereumChain(_chainId: string): boolean;
    inlineWatchAsset(): boolean;
    inlineSwitchEthereumChain(): boolean;
    isStandalone(): boolean;
}
