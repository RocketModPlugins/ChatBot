"use strict";

const Discord = require('./endpoints/discord.js');
const XMPP = require('./endpoints/xmpp.js');


var endpoints = [
	new Discord('apikey','channel'), //Get your api key from https://github.com/reactiflux/discord-irc/wiki/Creating-a-discord-bot-&-getting-a-token
	new XMPP('discord@bam.yt','password','rocket@conference.bam.yt','UnturnedBot')
]

var io = require('socket.io')(80);
var sockets ={};

io.on('connection', function(socket){
	sockets[socket.id] = socket;
	console.log("connect: "+ socket.id);
	sockets[socket.id].on("receive",function(message){
		console.log(" >> "+message);
		for(let endpoint of endpoints){
			endpoint.emit("send",message);
		}
	});
	sockets[socket.id].on('disconnect',function(){
		console.log("disconnect: "+ socket.id);
		delete sockets[socket.id];
	});
});



for(let endpoint of endpoints){
	endpoint.on("receive",function(sender,message){
		console.log(" << "+sender+": "+message);
		for(let id in sockets){
			sockets[id].emit("send",JSON.stringify([sender,message]));
		}
	});
}
	
process.on('SIGINT', function(code) {
	console.log('Shutting down')
	
	for(let endpoint of endpoints){
		endpoint.emit("shutdown");
	}

	setTimeout(function() {
		process.exit()
	}, 1000);
});
