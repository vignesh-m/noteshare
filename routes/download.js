var express = require('express');
var app = express.Router();
var error = require('./error');
var mysql = require('mysql');
var db = require('../public/db_structure');
var _ = require('underscore');
var notification = require('./util/notification');
var util = require('./util/util');

var isAuth = function(req, res, next) {
	console.log('Authenticating');
	if (req.isAuthenticated())
		next();
	else {
		req.flash('login', 'LOGIN');
		res.redirect('/login')
	}
};

app.get('/create', isAuth, function (req, res) {
	var errobj = error.err_insuff_params(res, req, ['upload_id']);

	if(!errobj) {
		return;
	}

	var upload_id = req.query.upload_id;
	var querystring1 = "SELECT * FROM noteshare.uploads WHERE id=" + mysql.escape(upload_id);
	db.querydb(querystring1,function(upload){
		console.log(querystring1);
		console.log(upload);

		var querystring2 = "UPDATE noteshare.user SET credits=credits+1 WHERE id=" + mysql.escape(upload[0].userid);
		db.querydb(querystring2,function(result){
			console.log(querystring2);

			var querystring3 = "INSERT INTO noteshare.downloads(userid, uploadid, dateDownloaded) VALUES (" + mysql.escape(req.user.id) + "," + mysql.escape(upload_id) + "," + mysql.escape(util.dateToMysqlFormat(new Date())) + ");";
			db.querydb(querystring3,function(result){
				console.log(querystring3);
				console.log(result);
				notification.notify(upload[0].userid, "Unread", req.user.name + "has downloaded your file : " + upload[0].name);
				res.end(JSON.stringify(result));
			});
		});
		
	});

});

app.get('/get', isAuth, function(req, res) {
	var user_id = req.user.id;
	var myDownloads = [];
	var querystring = "SELECT * FROM noteshare.downloads WHERE userid=" + mysql.escape(user_id);
	db.querydb(querystring,function(result){
		console.log(querystring);
		for(var i=0;i<result.length;i++) {
			console.log(i);
			var querystring1 = "SELECT * FROM noteshare.uploads WHERE id=" + mysql.escape(result[i].uploadid);
			db.querydb(querystring1,function(uploadArr){
				console.log(querystring1);
				if(uploadArr.length!=0) {
					var querystring2 = "SELECT * FROM noteshare.user WHERE id=" + mysql.escape(uploadArr[0].userid);
					db.querydb(querystring2,function(uploadedUser){
						myDownloads.push({user:uploadedUser[0], file:uploadArr[0]});
						console.log(querystring2);
						if(myDownloads.length == result.length) {
							console.log('result-length');
							res.end(JSON.stringify({result:true, downloads:myDownloads}));
						}
					});
				}
				else {
					console.log('length-0');
					res.end(JSON.stringify({result:true, downloads:myDownloads}));
				}
			});			
		}
		if(result.length == 0) {
			res.end(JSON.stringify({result:true, downloads:myDownloads}));
		}
	});
});

module.exports = app;