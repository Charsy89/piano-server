var fs = require('fs');
var app = require('express')();
var http = require('http').Server(app);
var compress = require('compression');
global.EventEmitter = require('events').EventEmitter;
var path = "./static";


// Internet Stuff

///////////////////////////////////////////////////

app.use(compress());

app.use(function(req,res,next){
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

app.get("*",function(req,res){
	let url = decodeURIComponent(req.url);
	fs.lstat(path+url,function(err,data){
		if(err || data.isDirectory()) res.sendFile("index.html",{root:"./client"});
		else res.sendFile(url,{root:path});
	});
});

app.listen(8080);

// WebSocket Stuff

///////////////////////////////////////////////////

/*var Client = require("./Client.js");
var ChannelManager = require("./ChannelManager.js");
var cm = new ChannelManager();*/

