"use strict";

const EventEmitter = require('events');
const XMPP = require("node-xmpp-client");

class XMPPModule extends EventEmitter {

	constructor(jid,password,room,alias){
		super();
		var that = this;
		this.jid = jid;
		this.password = password;
		this.room = room;
		this.alias = alias;
		this.client = new XMPP({
			jid: this.jid,
			password: this.password,
			reconnect: true
		});
		
		this.on("shutdown",function(){
			if(!that.error)
				that.client.send(new XMPP.Stanza('presence', {from: that.jid, to: that.room, type: 'unavailable'}))
		});
		
		this.on("send",function(message){
			that.client.send(new XMPP.Stanza('message', { to: that.room, type: 'groupchat' }).c('body').t(message));
		});
		
		this.client.on('online', function() {
			console.log("Successfully connected to XMPP chatroom '" + that.room + '\'.');
			that.client.send(new XMPP.Stanza('presence', {type: 'available'}));
			that.client.send(new XMPP.Element('presence', {from: that.jid, to: that.room + '/' + that.alias}));
			that.emit("ready");
		});
		
		this.client.on('stanza', function(stanza) {
			var isHistory = false;
			stanza.children.forEach(function(element){
				if (element.name === 'delay')//if the name of any child element is 'delay', the stanza is chat history
					isHistory = true;
			});
			if (isHistory) return;
			if (stanza.is('message') &&
				stanza.attrs.type === 'groupchat' &&
				stanza.attrs.from !== that.room  + '/' + that.alias){
				var body = stanza.getChild('body');
				if (!body) return;
				var sender = stanza.attrs.from.split('/')[1];
				var message = body.getText();
				that.emit("receive",sender,message);
			}
		});

		this.client.on('error', function(e) {
			that.error = true;
			console.log("Error in XMPPModule:",e);
		});

		setInterval(function(){
			that.client.send(' ');
		}, 30000);
	}
}

module.exports = XMPPModule;