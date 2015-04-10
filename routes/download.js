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

app.get('/view', isAuth, function (req, res) {
	var errobj = error.err_insuff_params(res, req, ['upload_id']);

	if(!errobj) {
		return;
	}

	var upload_id = req.query.upload_id;
	var querystring1 = "SELECT * FROM noteshare.uploads WHERE id=" + mysql.escape(upload_id);
	db.querydb(querystring1,function(upload){
		console.log(querystring1);
		console.log(upload);

		debugger;

		if(upload[0].userid == req.user.id) {
			//res.render('pdftest.ejs',{"SWFFileName":"../views/test1.swf?random=884873648269"});
			/*res.download('./uploads/' + upload[0].filename, function(err) {
				if(err) {
					console.log(err);
				}
			});*/
util.getPages(upload_id, res, function (upload_id, res, pages) {
	res.render('pdfview.ejs',{"viewPath":"../views/" + upload_id, "pages":pages});
});
}

else {
	var querystring2 = "UPDATE noteshare.user SET credits=credits+1 WHERE id=" + mysql.escape(upload[0].userid);
	db.querydb(querystring2,function(result){
		console.log(querystring2);

		if(req.query.view) {
			console.log('viewing');
			res.render('pdfview.ejs',{"viewPath":"../views/" + upload_id, "pages":10});
		}

		else {

			//var querystring3 = "INSERT INTO noteshare.downloads(userid, uploadid, dateDownloaded) SELECT * FROM (SELECT " + mysql.escape(req.user.id) + "," + upload_id*1 + ") AS tmp WHERE NOT EXISTS (SELECT userid, uploadid FROM noteshare.downloads WHERE userid=" + mysql.escape(req.user.id) + " AND uploadid=" + upload_id +") LIMIT 1;";
			var querystring3 = "INSERT INTO noteshare.downloads(userid, uploadid, dateDownloaded) VALUES (" + mysql.escape(req.user.id) + "," + upload_id*1 + "," + mysql.escape(util.dateToMysqlFormat(new Date())) + ");";
			db.querydb(querystring3,function(result){
				console.log(querystring3);
				console.log(result);
				notification.notify(upload[0].userid, "Unread", req.user.username + " has downloaded your file : " + upload[0].name, "Download", '/upload/getupload?id=' + upload[0].id);

					//res.render('pdfview.ejs', {"viewPath":"../views/" + upload_id, "pages":pages});

					util.getPages(upload_id, res, function (upload_id, res, pages) {
						res.render('pdfview.ejs',{"viewPath":"../views/" + upload_id, "pages":pages});
					});
					//res.render('pdftest.ejs',{"SWFFileName":"../views/test1.swf?random=884873648269"});
					/*res.download('./uploads/' + upload[0].filename, function(err) {
						if(err) {
							console.log(err);
						}
					});*/
		});
		}
	});
}

});

});

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
				notification.notify(upload[0].userid, "Unread", req.user.name + "has downloaded your file : " + upload[0].name, "Download", '/upload/getupload?id=' + upload[0].id);
				res.end(JSON.stringify(result));
			});
		});
		
	});

});

app.get(/(.*\.pdf)\/([0-9]+).png$/i, function (req, res) {
	var pdfPath = req.params[0];
	var pageNumber = req.params[1];

	var PDFImage = require("pdf-image").PDFImage;
	var pdfImage = new PDFImage(pdfPath);

	pdfImage.convertPage(pageNumber).then(function (imagePath) {
		res.sendFile(imagePath);
	}, function (err) {
		res.send(err, 500);
	});
});

app.get('/get', isAuth, function(req, res) {
	var user_id = req.user.id;
	var myDownloads = [];
	var querystring = "SELECT * FROM noteshare.downloads WHERE userid=" + mysql.escape(user_id)  + " ORDER BY downloads.dateDownloaded";
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