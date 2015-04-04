var mysql = require('mysql');
var db=require('./db_structure');
var util = require('./util');

//downloads
var notify = function (userid, type, text, purpose, link) {
	console.log(link);
	debugger;
	var querystring = "INSERT INTO noteshare.notifications(userid,type,text,purpose,dateCreated,link) VALUES (" + mysql.escape(userid) +',' + mysql.escape(type) +','+ mysql.escape(text) + ',' + mysql.escape(purpose) + ',' + mysql.escape(util.dateToMysqlFormat(new Date())) + "," + mysql.escape(link) + ")";
	db.querydb(querystring,function(result){
		debugger;
		console.log(querystring);
		global.io.emit('update', JSON.stringify({user_id:userid}) );
	});
}

//when a person uploads a file all followers should get notifications
var notifyAllFollowers = function (userid, type, text, purpose, link) {
	var querystring1 = "SELECT * FROM noteshare.followers WHERE follows=" + mysql.escape(userid);
	db.querydb(querystring1,function(arrFollowers){
		for(var i=0;i<arrFollowers.length;i++) {
			/*var querystring2 = "INSERT INTO noteshare.notifications(userid,type,text) VALUES(" + mysql.escape(arrFollowers[i].userid) +',' + mysql.escape(type) +','+ mysql.escape(text) + ")";
			db.querydb(querystring2,function(result){
				console.log(querystring2);
			});*/
	notify(arrFollowers[i].userid, type, text, purpose, link);
}
});	
}

var setFollower = function(userid, follows, res) {
	var querystring = "INSERT INTO noteshare.followers(userid,follows,dateStarted) VALUES (" + mysql.escape(userid) +',' + follows + ',' + mysql.escape(util.dateToMysqlFormat(new Date())) + ");";

	console.log(querystring);
	db.querydb(querystring,function(result){
		console.log(querystring);
		console.log(result);
		res.end(JSON.stringify({'result':"done",'user_id':userid,'follows':follows}));
	});
}

var removeFollower = function(userid, follows, res) {
	var querystring = "DELETE FROM noteshare.followers WHERE userid=" + mysql.escape(userid) +' && follows=' + follows +  ";";
	console.log(querystring);
	db.querydb(querystring,function(result){
		console.log(querystring);
		console.log(result);
		res.end(JSON.stringify({'result':true,'user_id':userid,'notFollowing':follows}));
	});
}

module.exports = {notify:notify, notifyAllFollowers:notifyAllFollowers, setFollower:setFollower, removeFollower:removeFollower};