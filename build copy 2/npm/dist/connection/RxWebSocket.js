"use strict";Object.defineProperty(exports,"__esModule",{value:true});exports.RxWebSocket=exports.ConnectionState=void 0;var _rxjs=require("rxjs");var _operators=require("rxjs/operators");function _defineProperty(obj,key,value){if(key in obj){Object.defineProperty(obj,key,{value:value,enumerable:true,configurable:true,writable:true});}else{obj[key]=value;}return obj;}let ConnectionState;/**
 * Rx-ified WebSocket
 */exports.ConnectionState=ConnectionState;(function(ConnectionState){ConnectionState[ConnectionState["DISCONNECTED"]=0]="DISCONNECTED";ConnectionState[ConnectionState["CONNECTING"]=1]="CONNECTING";ConnectionState[ConnectionState["CONNECTED"]=2]="CONNECTED";})(ConnectionState||(exports.ConnectionState=ConnectionState={}));class RxWebSocket{/**
   * Constructor
   * @param url WebSocket server URL
   * @param [WebSocketClass] Custom WebSocket implementation
   */constructor(url,WebSocketClass=WebSocket){_defineProperty(this,"webSocket",null);_defineProperty(this,"connectionStateSubject",new _rxjs.BehaviorSubject(ConnectionState.DISCONNECTED));_defineProperty(this,"incomingDataSubject",new _rxjs.Subject());this.WebSocketClass=WebSocketClass;this.url=url.replace(/^http/,"ws");}/**
   * Make a websocket connection
   * @returns an Observable that completes when connected
   */connect(){if(this.webSocket){return(0,_rxjs.throwError)(new Error("webSocket object is not null"));}return new _rxjs.Observable(obs=>{let webSocket;try{this.webSocket=webSocket=new this.WebSocketClass(this.url);}catch(err){obs.error(err);return;}this.connectionStateSubject.next(ConnectionState.CONNECTING);webSocket.onclose=evt=>{this.clearWebSocket();obs.error(new Error(`websocket error ${evt.code}: ${evt.reason}`));this.connectionStateSubject.next(ConnectionState.DISCONNECTED);};webSocket.onopen=_=>{obs.next();obs.complete();this.connectionStateSubject.next(ConnectionState.CONNECTED);};webSocket.onmessage=evt=>{this.incomingDataSubject.next(evt.data);};}).pipe((0,_operators.take)(1));}/**
   * Disconnect from server
   */disconnect(){const{webSocket}=this;if(!webSocket){return;}this.clearWebSocket();this.connectionStateSubject.next(ConnectionState.DISCONNECTED);try{webSocket.close();}catch{}}/**
   * Emit current connection state and subsequent changes
   * @returns an Observable for the connection state
   */get connectionState$(){return this.connectionStateSubject.asObservable();}/**
   * Emit incoming data from server
   * @returns an Observable for the data received
   */get incomingData$(){return this.incomingDataSubject.asObservable();}/**
   * Emit incoming JSON data from server. non-JSON data are ignored
   * @returns an Observable for parsed JSON data
   */get incomingJSONData$(){return this.incomingData$.pipe((0,_operators.flatMap)(m=>{let j;try{j=JSON.parse(m);}catch(err){return(0,_rxjs.empty)();}return(0,_rxjs.of)(j);}));}/**
   * Send data to server
   * @param data text to send
   */sendData(data){const{webSocket}=this;if(!webSocket){throw new Error("websocket is not connected");}webSocket.send(data);}clearWebSocket(){const{webSocket}=this;if(!webSocket){return;}this.webSocket=null;webSocket.onclose=null;webSocket.onerror=null;webSocket.onmessage=null;webSocket.onopen=null;}}exports.RxWebSocket=RxWebSocket;