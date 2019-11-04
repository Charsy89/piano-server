var fs = require('fs');
var app = require('express')();
var http = require('http').Server(app);
var compress = require('compression');
var WSS = require("ws").Server;
var wss = new WSS({port:8080});
global.kek = require('keccak');
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

app.listen(8079);

// WebSocket Stuff

///////////////////////////////////////////////////

var Client = require("./Client.js");
var ChannelManager = require("./ChannelManager.js");
var DB = require("./DB.js");
var msg = ["a","bye","ch","hi","+ls","-ls","m","n","userset","devices","t","chset","chown","kickban","adminmsg"]; // thanks bop it for idea

API.cm.on("channelUpdate",function(room){
	ls_listeners.forEach(u=>{
		u.sendArray([{m:"ls",c:false,u:room}]);
	});
});

global.API = {
	db:new DB(),
	cm:new ChannelManager(this),
	findParticipant:{
		ByCid(cid){
			return (Users.get(cid) || null);
		},
		By_id(_id){
			let ret = null;
			Users.forEach(function(u){
				if(u.user._id !== _id) return;
				ret = u;
			});
			return ret;
		},
		ById(id){
			let ret = null;
			Users.forEach(function(u){
				if(u.user.id !== id) return;
				ret = u;
			});
			return ret;
		},
		ByWsIp(ip){
			let ret = null;
			Users.forEach(function(u){
				if(u.ws.ip !== ip) return;
				ret = u;
			});
			return ret;
		}
	},
	users:new Map()
}

wss.on("connection",function(ws,req){
	ws.ip = (req.connection.remoteAddress || req.headers["x-forwarded-for"]).replace("::ffff:","");
	let cid = kek('keccak256').update(("lma00f"+ws.ip)).digest('hex').substr(0,24);
	//if(true){
		API.Users.set(_id,new Client(api,cid,ws));
	/*}else{
		if(typeof Users.get(_id) == "undefined"){
			Users.set(_id,new Client(db,_id).addConnection(ws));
			Users.get(_id).addConnection(ws);
		} else Users.get(_id).addConnection(ws);
	}*/
});
