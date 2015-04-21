var express = require('express');
var app = express.Router();
var error = require('./error');
var mysql = require('mysql');
var db = require('../public/db_structure');
var notification = require('./util/notification');

app.get('/get/all', function (req, res) {
	var stats = {};
	var querystring = "SELECT count(*) FROM noteshare.downloads";
	db.querydb(querystring, function (count){

		stats.totalDownloads = count[0]["count(*)"];
		console.log("downloads : "+stats.totalDownloads);
		var querystring = "SELECT count(*) FROM noteshare.uploads";
		db.querydb(querystring, function (count){
			stats.totalUploads = count[0]["count(*)"];
			console.log("up : "+stats.totalUploads);
			var querystring = "SELECT count(*) FROM noteshare.user";
			db.querydb(querystring, function (count){
				stats.totalUsers = count[0]["count(*)"];
				console.log("users :"+stats.totalUsers)
				//TODO : ORDER BY user id here
				var querystring = "SELECT uploadid,count(*) FROM noteshare.downloads GROUP BY uploadid" + " LIMIT 10 OFFSET 0";
				db.querydb(querystring, function (result){
					console.log(result)
					var topDownloads = [];
					if(result.length!=0) {
						for(var i=0;i<result.length;i++) {
							var querystring1 = "SELECT * FROM noteshare.uploads WHERE id=" + mysql.escape(result[i].uploadid);
							db.querydb(querystring1,function(upload){
								if(upload.length == 0) {
									stats.topDownloads = topDownloads;
									res.end(JSON.stringify(stats));
								}
								else {
									topDownloads.push(upload[0]);
									if(topDownloads.length == result.length) {
										console.log('result-length');
										debugger;
										stats.topDownloads = topDownloads;
										res.end(JSON.stringify(stats));

									}
								}
							});
						}

					} else {
						stats.topDownloads=[];
						res.end(JSON.stringify(stats))
					}
					else {
						stats.topDownloads = [];
						res.end(JSON.stringify(stats));
					}
				});
			});
});
});
});

module.exports = app;
