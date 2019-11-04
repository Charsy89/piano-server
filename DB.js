var fs = require('fs');
var dbFile = "./db.json";

function DB(){
	this.taken_ids = [];
    
    let self = this;
    fs.readFile(dbFile,function(err,data){
        if(err){
            console.trace(err);
            process.exit(1);
        }
        let data = JSON.parse(data);
        Object.keys(data).forEach(function(cid){
            self.taken_ids.push(data[cid]._id);
        });
    });
}

DB.prototype.constructor = DB;

DB.prototype.testForId = function(_id){
    return this.taken_ids.indexOf(_id) !== -1;
}

DB.prototype.getUserData = function(cid){
	try{
		return JSON.parse(fs.readFileSync(dbFile))[cid];
	}catch(e){
		console.trace(e);
	}
}

DB.prototype.setUserData = function(cid,user){ // kamatte chodai ne
    try{
        let json = JSON.parse(fs.readFileSync(dbFile));
        json[cid] = user.toJson();
        fs.writeFileSync(dbFile,JSON.stringify(json));
    }catch(e){
        console.trace(e);
    }
}

module.exports = DB;
