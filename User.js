function User(name,color,_id){
	this.name = name;
	this.color = color;
	this._id = _id;
	this.id = undefined;
	this.channel = undefined;
}

for(var i in EventEmitter.prototype){
	User.prototype[i] = EventEmitter.prototype[i];
}

User.prototype.constructor = User;

User.prototype.setName = function(name){
	if(name.length <= 40){
		this.name = name;
		this.emit("userSet");
	}
}

User.prototype.setColor = function(color){
	if(/^#[0-9a-f]{6}$/i.test(color)){
		this.color = color;
		this.emit("userSet");
	}
}

User.prototype.toJson = function(){
	return {name:this.name,color:this.color,_id:this._id};
}
