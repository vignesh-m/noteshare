var mysql = require('mysql');
var db=require('./db_structure');

//downloads
var notify = function (userid, type, text) {

	var querystring = "INSERT INTO noteshare.notifications(userid,type,text) VALUES(" + mysql.escape(userid) +',' + mysql.escape(type) +','+ mysql.escape(text) + ")";
	db.querydb(querystring,function(result){
		console.log(querystring);
	});
}

//when a person uploads a file all followers should get notifications
var notifyAllFollowers = function (userid, type, text) {
	var querystring1 = "SELECT * FROM noteshare.followers WHERE follows=" + mysql.escape(userid);
	db.querydb(querystring1,function(arrFollowers){
		for(var i=0;i<arrFollowers.length;i++) {
			/*var querystring2 = "INSERT INTO noteshare.notifications(userid,type,text) VALUES(" + mysql.escape(arrFollowers[i].userid) +',' + mysql.escape(type) +','+ mysql.escape(text) + ")";
			db.querydb(querystring2,function(result){
				console.log(querystring2);
			});*/
			notify(arrFollowers[i].userid, type, text);
		}
	});	
}

var setFollower = function(userid, follows) {
	var querystring = "INSERT INTO noteshare.followers(userid,follows) VALUES(" + mysql.escape(userid) +',' + mysql.escape(follows) + ")";
	db.querydb(querystring,function(result){
		console.log(querystring);
		console.log(result);
	});
}

module.exports = {notify:notify, notifyAllFollowers:notifyAllFollowers, setFollower:setFollower};