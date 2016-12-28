"use strict";

const EventEmitter = require('events');
const Discord = require("discord.js");

class DiscordModule extends EventEmitter {
	
	constructor(apiToken,chatRoom){
		super();
		var that = this;
		this.apiToken = apiToken;
		this.chatRoom = chatRoom;
		this.channel = {};
		this.client = new Discord.Client({autoreconnect: true});
		
		this.client.login(apiToken);
			
		this.client.on("error",function(e){
			console.log("Error in DiscordModule:",e);
		});
		
		this.on("shutdown",function(){
			
		});
		
		this.on("send",function(message){
			that.channel.sendMessage(message);
		});
		
		this.client.on('ready', function(){
			console.log("Successfully connected to Discord.");
			that.channel = that.client.channels.find('name',that.chatRoom);
			that.emit("ready");
		});
		
		this.client.on("message", function(message) {
			if (message.author.id === that.client.user.id || message.channel.name != that.chatRoom)
				return;

			var content = new String (message.content);
			var isMe = false; 
			if (message.mentions.length){
				message.mentions.forEach(function(mention){
					content = content.replace(
						new RegExp('<@(!|)' + mention.id + '>', 'g'),
						'@' + mention.username
					);
				});
			}

			if (message.content[0] == '_' && message.content[message.content.length - 1] == '_'){
				isMe = true;
				content = content.substr(1, content.length-2);
			}
			
			that.emit("receive",message.author.username,content);
		});
	}
}

module.exports = DiscordModule;