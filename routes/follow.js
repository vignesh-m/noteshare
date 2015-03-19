var express = require('express');
var app = express.Router();
var error = require('./error');
var mysql = require('mysql');
var db = require('../public/db_structure');
var notification = require('./util/notification');

app.get('/add', function(req, res) {
	var errobj = error.err_insuff_params(res, req, ['user_id','follows']);
	var querystring = "";
	if(!errobj) {
		return;
	}

	var user_id = req.query.user_id;
	var follows = req.query.follows;

	notification.setFollower(user_id, follows);
	res.end(JSON.stringify({'result':true,'user_id':user_id,'follows':follows}));
});

module.exports = app;