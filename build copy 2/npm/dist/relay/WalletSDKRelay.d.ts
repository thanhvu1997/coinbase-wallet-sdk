/// <reference types="node" />
import { Observable } from "rxjs";
import { EventListener } from "../connection/EventListener";
import { ScopedLocalStorage } from "../lib/ScopedLocalStorage";
import { WalletUI, WalletUIOptions } from "../provider/WalletUI";
import { AddressString, IntNumber, RegExpString } from "../types";
import { EthereumTransactionParams } from "./EthereumTransactionParams";
import { RelayMessage } from "./RelayMessage";
import { Session } from "./Session";
import { CancelablePromise, WalletSDKRelayAbstract } from "./WalletSDKRelayAbstract";
import { WalletSDKRelayEventManager } from "./WalletSDKRelayEventManager";
import { GenericRequest, Web3Request } from "./Web3Request";
import { AddEthereumChainResponse, EthereumAddressFromSignedMessageResponse, GenericResponse, RequestEthereumAccountsResponse, ScanQRCodeResponse, SignEthereumMessageResponse, SignEthereumTransactionResponse, SubmitEthereumTransactionResponse, SwitchEthereumChainResponse, WatchAssetResponse, Web3Response } from "./Web3Response";
export interface WalletSDKRelayOptions {
    linkAPIUrl: string;
    version: string;
    darkMode: boolean;
    storage: ScopedLocalStorage;
    relayEventManager: WalletSDKRelayEventManager;
    uiConstructor: (options: Readonly<WalletUIOptions>) => WalletUI;
    eventListener?: EventListener;
}
export declare class WalletSDKRelay extends WalletSDKRelayAbstract {
    private static accountRequestCallbackIds;
    private readonly linkAPIUrl;
    protected readonly storage: ScopedLocalStorage;
    private readonly _session;
    private readonly relayEventManager;
    protected readonly eventListener?: EventListener;
    private readonly connection;
    private accountsCallback;
    private chainCallback;
    private ui;
    private appName;
    private appLogoUrl;
    private subscriptions;
    isLinked: boolean | undefined;
    isUnlinkedErrorState: boolean | undefined;
    constructor(options: Readonly<WalletSDKRelayOptions>);
    attachUI(): void;
    resetAndReload(): void;
    setAppInfo(appName: string, appLogoUrl: string | null): void;
    getStorageItem(key: string): string | null;
    get session(): Session;
    setStorageItem(key: string, value: string): void;
    signEthereumMessage(message: Buffer, address: AddressString, addPrefix: boolean, typedDataJson?: string | null): CancelablePromise<SignEthereumMessageResponse>;
    ethereumAddressFromSignedMessage(message: Buffer, signature: Buffer, addPrefix: boolean): CancelablePromise<EthereumAddressFromSignedMessageResponse>;
    signEthereumTransaction(params: EthereumTransactionParams): CancelablePromise<SignEthereumTransactionResponse>;
    signAndSubmitEthereumTransaction(params: EthereumTransactionParams): CancelablePromise<SubmitEthereumTransactionResponse>;
    submitEthereumTransaction(signedTransaction: Buffer, chainId: IntNumber): CancelablePromise<SubmitEthereumTransactionResponse>;
    scanQRCode(regExp: RegExpString): CancelablePromise<ScanQRCodeResponse>;
    getQRCodeUrl(): string;
    genericRequest(data: object, action: string): CancelablePromise<GenericResponse>;
    sendGenericMessage(request: GenericRequest): CancelablePromise<GenericResponse>;
    sendRequest<T extends Web3Request, U extends Web3Response>(request: T): CancelablePromise<U>;
    setConnectDisabled(disabled: boolean): void;
    setAccountsCallback(accountsCallback: (accounts: [string]) => void): void;
    setChainCallback(chainCallback: (chainId: string, jsonRpcUrl: string) => void): void;
    private publishWeb3RequestEvent;
    private publishWeb3RequestCanceledEvent;
    protected publishEvent(event: string, message: RelayMessage, callWebhook: boolean): Observable<string>;
    private handleIncomingEvent;
    private handleWeb3ResponseMessage;
    private invokeCallback;
    requestEthereumAccounts(): CancelablePromise<RequestEthereumAccountsResponse>;
    watchAsset(type: string, address: string, symbol?: string, decimals?: number, image?: string, chainId?: string): CancelablePromise<WatchAssetResponse>;
    addEthereumChain(chainId: string, rpcUrls: string[], iconUrls: string[], blockExplorerUrls: string[], chainName?: string, nativeCurrency?: {
        name: string;
        symbol: string;
        decimals: number;
    }): {
        promise: Promise<AddEthereumChainResponse>;
        cancel: () => void;
    };
    switchEthereumChain(chainId: string): CancelablePromise<SwitchEthereumChainResponse>;
    inlineAddEthereumChain(chainId: string): boolean;
    private getSessionIdHash;
    private sendRequestStandalone;
}
