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
		console.log(querystring);
		console.log(count);
		stats.totalDownloads = count[0]["count(*)"];

		var querystring = "SELECT count(*) FROM noteshare.uploads";
		db.querydb(querystring, function (count){
			console.log(querystring);
			console.log(count);
			stats.totalUploads = count[0]["count(*)"];
			
			var querystring = "SELECT count(*) FROM noteshare.user";
			db.querydb(querystring, function (count){
				console.log(querystring);
				console.log(count);
				stats.totalUsers = count[0]["count(*)"];
				//TODO : ORDER BY user id here
				var querystring = "SELECT uploadid,count(*) FROM noteshare.downloads GROUP BY uploadid" + " LIMIT 10 OFFSET 0";
				console.log(querystring);
				db.querydb(querystring, function (result){
					var topDownloads = [];
					if(result.length!=0) {
						for(var i=0;i<result.length;i++) {
							var querystring1 = "SELECT * FROM noteshare.uploads WHERE id=" + mysql.escape(result[i].uploadid);
							console.log(querystring1);
							db.querydb(querystring1,function(upload){
								if(upload.length == 0) {
									stats.topDownloads = topDownloads;
									res.end(JSON.stringify(stats));
								}
								else {
									topDownloads.push(upload[0]);
									console.log(querystring1);
									if(topDownloads.length == result.length) {
										console.log('result-length');
										stats.topDownloads = topDownloads;
										res.end(JSON.stringify(stats));
									}
								}
							});
						}
					}
				});
			});
});
});
});

module.exports = app;