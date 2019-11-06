var User = require('./User.js');
var RateLimit = require('./RateLimit.js');

function col(){
	return "#"+(0x1000000+(Math.random())*0xffffff).toString(16).substr(1,6)
}

function _id(){
	return kek('keccak256').update(("teamtrees"+"lmaoof"+Math.floor(Math.random()*8000000000))/*8bil*/).digest('hex').substr(0,24);
}

function Client(cid,ws){
	this.cid = cid;
	this.ws = ws;
	this.user = undefined;
	this.canConnect = false;
	this.connectionTime = Date.now();
	this.noteQuota = new RateLimit(2000,{a:3000,m:24000,mh:3});
	this.chatQuota = new RateLimit(6000,{a:4,m:4,mh:3});
	this.nameQuota = new RateLimit(180000,{a:30,m:30,mh:3});
    
    this.ws.on("message",(data)=>{
        let trans = JSON.parse(msg.data);
        for(var i = 0; i < trans.length; i++){
            var msg = trans[i];
            if(!msg) return;
            this.emit(msg.m,msg);
        }
    });
    
	this.bindEvents();
};

for(var i in EventEmitter.prototype){
	Client.prototype[i] = EventEmitter.prototype[i];
};

Client.prototype.constructor = Client;

Client.prototype.send = function(raw){
	if(this.ws && this.ws.readyState === 1) this.ws.send(raw);
};

Client.prototype.sendArray = function(arr){
	if(this.canConnect) this.send(JSON.stringify(arr));
};

Client.prototype.bindEvents = function(){
	let self = this;
	this.on("hi",function(){
		self.canConnect = true;
		let userData = API.db.getUserData(self.cid);
		if(!userData || userData === null){
			let _id = _id();
			while(API.db.testForId(_id)){ // make sure we don't take others' _ids
				_id = _id();
			}
			userData = API.db.setUserData(self.cid,new User("Anonymoouse",col(),_id));
		}
        
		self.sendArray([{m:"hi",u:userData,t:Date.now(),v:"0.0a",motd:"You agree to read this message"}]);
	});
	this.on("t",function(msg){
		self.sendArray([{m:"t",t:Date.now(),e:msg.e-Date.now()}]);
	});
	API.db.on("userCreate",function(cid,user){
		if(cid == self.cid){
            self.user = user;
            self.user.on("userSet",function(){
                let data = self.user.toJson();
                data.id = self.user.id;
                data.m = "p";
                self.sendArray([data]);
            });
        }
    });
}

module.exports = Client;
