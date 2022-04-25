"use strict";Object.defineProperty(exports,"__esModule",{value:true});exports.WalletSDKConnection=void 0;var _rxjs=require("rxjs");var _operators=require("rxjs/operators");var _Session=require("../relay/Session");var _types=require("../types");var _ClientMessage=require("./ClientMessage");var _EventListener=require("./EventListener");var _RxWebSocket=require("./RxWebSocket");var _ServerMessage=require("./ServerMessage");function _defineProperty(obj,key,value){if(key in obj){Object.defineProperty(obj,key,{value:value,enumerable:true,configurable:true,writable:true});}else{obj[key]=value;}return obj;}const HEARTBEAT_INTERVAL=10000;const REQUEST_TIMEOUT=60000;/**
 * Coinbase Wallet Connection
 */class WalletSDKConnection{/**
   * Constructor
   * @param sessionId Session ID
   * @param sessionKey Session Key
   * @param linkAPIUrl Coinbase Wallet link server URL
   * @param [WebSocketClass] Custom WebSocket implementation
   */constructor(sessionId,sessionKey,linkAPIUrl,eventListener,WebSocketClass=WebSocket){_defineProperty(this,"subscriptions",new _rxjs.Subscription());_defineProperty(this,"destroyed",false);_defineProperty(this,"lastHeartbeatResponse",0);_defineProperty(this,"nextReqId",(0,_types.IntNumber)(1));_defineProperty(this,"connectedSubject",new _rxjs.BehaviorSubject(false));_defineProperty(this,"linkedSubject",new _rxjs.BehaviorSubject(false));_defineProperty(this,"sessionConfigSubject",new _rxjs.ReplaySubject(1));this.sessionId=sessionId;this.sessionKey=sessionKey;this.eventListener=eventListener;const ws=new _RxWebSocket.RxWebSocket(linkAPIUrl+"/rpc",WebSocketClass);this.ws=ws;// attempt to reconnect every 5 seconds when disconnected
this.subscriptions.add(ws.connectionState$.pipe((0,_operators.tap)(state=>{var _this$eventListener;return(_this$eventListener=this.eventListener)===null||_this$eventListener===void 0?void 0:_this$eventListener.onEvent(_EventListener.EVENTS.CONNECTED_STATE_CHANGE,{state,sessionIdHash:_Session.Session.hash(sessionId)});}),// ignore initial DISCONNECTED state
(0,_operators.skip)(1),// if DISCONNECTED and not destroyed
(0,_operators.filter)(cs=>cs===_RxWebSocket.ConnectionState.DISCONNECTED&&!this.destroyed),// wait 5 seconds
(0,_operators.delay)(5000),// check whether it's destroyed again
(0,_operators.filter)(_=>!this.destroyed),// reconnect
(0,_operators.flatMap)(_=>ws.connect()),(0,_operators.retry)()).subscribe());// perform authentication upon connection
this.subscriptions.add(ws.connectionState$.pipe(// ignore initial DISCONNECTED and CONNECTING states
(0,_operators.skip)(2),(0,_operators.switchMap)(cs=>(0,_rxjs.iif)(()=>cs===_RxWebSocket.ConnectionState.CONNECTED,// if CONNECTED, authenticate, and then check link status
this.authenticate().pipe((0,_operators.tap)(_=>this.sendIsLinked()),(0,_operators.tap)(_=>this.sendGetSessionConfig()),(0,_operators.map)(_=>true)),// if not CONNECTED, emit false immediately
(0,_rxjs.of)(false))),(0,_operators.distinctUntilChanged)(),(0,_operators.catchError)(_=>(0,_rxjs.of)(false))).subscribe(connected=>this.connectedSubject.next(connected)));// send heartbeat every n seconds while connected
this.subscriptions.add(ws.connectionState$.pipe(// ignore initial DISCONNECTED state
(0,_operators.skip)(1),(0,_operators.switchMap)(cs=>(0,_rxjs.iif)(()=>cs===_RxWebSocket.ConnectionState.CONNECTED,// if CONNECTED, start the heartbeat timer
(0,_rxjs.timer)(0,HEARTBEAT_INTERVAL)))).subscribe(i=>// first timer event updates lastHeartbeat timestamp
// subsequent calls send heartbeat message
i===0?this.updateLastHeartbeat():this.heartbeat()));// handle server's heartbeat responses
this.subscriptions.add(ws.incomingData$.pipe((0,_operators.filter)(m=>m==="h")).subscribe(_=>this.updateLastHeartbeat()));// handle link status updates
this.subscriptions.add(ws.incomingJSONData$.pipe((0,_operators.filter)(m=>["IsLinkedOK","Linked"].includes(m.type))).subscribe(m=>{var _this$eventListener2;const msg=m;(_this$eventListener2=this.eventListener)===null||_this$eventListener2===void 0?void 0:_this$eventListener2.onEvent(_EventListener.EVENTS.LINKED,{sessionIdHash:_Session.Session.hash(sessionId),linked:msg.linked,type:m.type,onlineGuests:msg.onlineGuests});this.linkedSubject.next(msg.linked||msg.onlineGuests>0);}));// handle session config updates
this.subscriptions.add(ws.incomingJSONData$.pipe((0,_operators.filter)(m=>["GetSessionConfigOK","SessionConfigUpdated"].includes(m.type))).subscribe(m=>{var _this$eventListener3;const msg=m;(_this$eventListener3=this.eventListener)===null||_this$eventListener3===void 0?void 0:_this$eventListener3.onEvent(_EventListener.EVENTS.SESSION_CONFIG_RECEIVED,{sessionIdHash:_Session.Session.hash(sessionId),metadata_keys:msg&&msg.metadata?Object.keys(msg.metadata):undefined});this.sessionConfigSubject.next({webhookId:msg.webhookId,webhookUrl:msg.webhookUrl,metadata:msg.metadata});}));}/**
   * Make a connection to the server
   */connect(){var _this$eventListener4;if(this.destroyed){throw new Error("instance is destroyed");}(_this$eventListener4=this.eventListener)===null||_this$eventListener4===void 0?void 0:_this$eventListener4.onEvent(_EventListener.EVENTS.STARTED_CONNECTING,{sessionIdHash:_Session.Session.hash(this.sessionId)});this.ws.connect().subscribe();}/**
   * Terminate connection, and mark as destroyed. To reconnect, create a new
   * instance of WalletSDKConnection
   */destroy(){var _this$eventListener5;this.subscriptions.unsubscribe();this.ws.disconnect();(_this$eventListener5=this.eventListener)===null||_this$eventListener5===void 0?void 0:_this$eventListener5.onEvent(_EventListener.EVENTS.DISCONNECTED,{sessionIdHash:_Session.Session.hash(this.sessionId)});this.destroyed=true;}get isDestroyed(){return this.destroyed;}/**
   * Emit true if connected and authenticated, else false
   * @returns an Observable
   */get connected$(){return this.connectedSubject.asObservable();}/**
   * Emit once connected
   * @returns an Observable
   */get onceConnected$(){return this.connected$.pipe((0,_operators.filter)(v=>v),(0,_operators.take)(1),(0,_operators.map)(()=>void 0));}/**
   * Emit true if linked (a guest has joined before)
   * @returns an Observable
   */get linked$(){return this.linkedSubject.asObservable();}/**
   * Emit once when linked
   * @returns an Observable
   */get onceLinked$(){return this.linked$.pipe((0,_operators.filter)(v=>v),(0,_operators.take)(1),(0,_operators.map)(()=>void 0));}/**
   * Emit current session config if available, and subsequent updates
   * @returns an Observable for the session config
   */get sessionConfig$(){return this.sessionConfigSubject.asObservable();}/**
   * Emit incoming Event messages
   * @returns an Observable for the messages
   */get incomingEvent$(){return this.ws.incomingJSONData$.pipe((0,_operators.filter)(m=>{if(m.type!=="Event"){return false;}const sme=m;return typeof sme.sessionId==="string"&&typeof sme.eventId==="string"&&typeof sme.event==="string"&&typeof sme.data==="string";}),(0,_operators.map)(m=>m));}/**
   * Set session metadata in SessionConfig object
   * @param key
   * @param value
   * @returns an Observable that completes when successful
   */setSessionMetadata(key,value){const message=(0,_ClientMessage.ClientMessageSetSessionConfig)({id:(0,_types.IntNumber)(this.nextReqId++),sessionId:this.sessionId,metadata:{[key]:value}});return this.onceConnected$.pipe((0,_operators.flatMap)(_=>this.makeRequest(message)),(0,_operators.map)(res=>{if((0,_ServerMessage.isServerMessageFail)(res)){throw new Error(res.error||"failed to set session metadata");}}));}/**
   * Publish an event and emit event ID when successful
   * @param event event name
   * @param data event data
   * @param callWebhook whether the webhook should be invoked
   * @returns an Observable that emits event ID when successful
   */publishEvent(event,data,callWebhook=false){const message=(0,_ClientMessage.ClientMessagePublishEvent)({id:(0,_types.IntNumber)(this.nextReqId++),sessionId:this.sessionId,event,data,callWebhook});return this.onceLinked$.pipe((0,_operators.flatMap)(_=>this.makeRequest(message)),(0,_operators.map)(res=>{if((0,_ServerMessage.isServerMessageFail)(res)){throw new Error(res.error||"failed to publish event");}return res.eventId;}));}sendData(message){this.ws.sendData(JSON.stringify(message));}updateLastHeartbeat(){this.lastHeartbeatResponse=Date.now();}heartbeat(){if(Date.now()-this.lastHeartbeatResponse>HEARTBEAT_INTERVAL*2){this.ws.disconnect();return;}try{this.ws.sendData("h");}catch{}}makeRequest(message,timeout=REQUEST_TIMEOUT){const reqId=message.id;try{this.sendData(message);}catch(err){return(0,_rxjs.throwError)(err);}// await server message with corresponding id
return this.ws.incomingJSONData$.pipe((0,_operators.timeoutWith)(timeout,(0,_rxjs.throwError)(new Error(`request ${reqId} timed out`))),(0,_operators.filter)(m=>m.id===reqId),(0,_operators.take)(1));}authenticate(){const msg=(0,_ClientMessage.ClientMessageHostSession)({id:(0,_types.IntNumber)(this.nextReqId++),sessionId:this.sessionId,sessionKey:this.sessionKey});return this.makeRequest(msg).pipe((0,_operators.map)(res=>{if((0,_ServerMessage.isServerMessageFail)(res)){throw new Error(res.error||"failed to authentcate");}}));}sendIsLinked(){const msg=(0,_ClientMessage.ClientMessageIsLinked)({id:(0,_types.IntNumber)(this.nextReqId++),sessionId:this.sessionId});this.sendData(msg);}sendGetSessionConfig(){const msg=(0,_ClientMessage.ClientMessageGetSessionConfig)({id:(0,_types.IntNumber)(this.nextReqId++),sessionId:this.sessionId});this.sendData(msg);}}exports.WalletSDKConnection=WalletSDKConnection;