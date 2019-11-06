var Room = require("Room.js");

function ChannelManager(){
    this.rooms = new Map();
    this.lsListeners = [];
    
    API.db.on("userCreate",(cid)=>{
        this.addListener(API.users.get(cid));
    });
}

for(var i in EventEmitter.prototype){
    ChannelManager.prototype[i] = EventEmitter.prototype[i];
}

ChannelManager.prototype.constructor = ChannelManager;

ChannelManager.prototype.addListener = function(user){
    let u = user.user;
    u.on("userSet",()=>{
        let room = this.rooms.get(u.room);
        let data = u.toJson();
        data.id = u.id;
        data.m = "p";
        room.sendArray([data]);
    });
    user.on("ch",this.setChannel);
    user.on("chset",(msg)=>{
        if(msg.set == u.room.set) return;
        msg = this.verifySet(u.room,msg);
    });
}

ChannelManager.prototype.verifySet = function(room,msg){
	if(!API.isActualObject(msg.set)) msg.set = {visible:true,color:"#3b5054",color2:"#151617",chat:true,crownsolo:false};
    if(API.isBoolean(msg.set.lobby)){
        if(!this.isLobby(room._id)) delete msg.set.lobby;
    }else{
        if(this.isLobby(room._id)) msg.set = {visible:true,color:"#3b5054",color2:"#151617",chat:true,crownsolo:false,lobby:true};
    }
	if(!API.isBoolean(msg.set.visible)){
        if(msg.set.visible == undefined) msg.set.visible = room.settings.visible;
		else msg.set.visible = true;
	};
	if(!API.isBoolean(msg.set.chat)){
		if(msg.set.chat == undefined) msg.set.chat = room.settings.chat;
		else msg.set.chat = true;
	};
	if(!API.isBoolean(msg.set.crownsolo)){
		if(msg.set.crownsolo == undefined) msg.set.crownsolo = room.settings.crownsolo;
		else msg.set.crownsolo = false;
	};
	if(!API.isString(msg.set.color) || !/^#[0-9a-f]{6}$/i.test(msg.set.color)) msg.set.color = room.settings.color;
	if(API.isString(msg.set.color2)){
		if(!/^#[0-9a-f]{6}$/i.test(msg.set.color2)){
            if(room.settings.color2) msg.set.color2 = room.settings.color2;
            else delete msg.set.color2;
        }
	};
	return msg.set;
};

ChannelManager.prototype.isLobby(_id) {
    if (_id.startsWith("lobby")) {
        if (_id == "lobby") {
            return true;
        } else if (parseFloat(_id.split("lobby")[1] % 1) === 0) {
            return true;
        } else {
            return false;
        }
    } else if (_id.startsWith("test/")) {
        if (_id == "test/") {
            return false;
        } else {
            return true;
        }
    } else {
        return false;
    }

}

module.exports = ChannelManager;
