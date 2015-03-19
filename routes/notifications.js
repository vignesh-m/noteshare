var express = require('express');
var app = express.Router();
var error = require('./error');
var mysql = require('mysql');
var db = require('../public/db_structure');
var _ = require('underscore');

var isAuth = function(req, res, next) {
    console.log('Authenticating');
    if (req.isAuthenticated())
        next();
    else {
        req.flash('login', 'LOGIN');
        res.redirect('/login')
    }
};
app.get('/get', isAuth,function(req, res) {
	var errobj = error.err_insuff_params(res, req, ['user_id']);
	var querystring = "";

	if(!errobj) {
		return;
	}

	var user_id = req.query.user_id;

	querystring = "SELECT * FROM noteshare.notifications WHERE userid=" + mysql.escape(user_id);

	db.querydb(querystring,function(arrNotifications){
		console.log(querystring);

		var arrNotificationsUnread = [];
		var arrNotificationsRead = [];

		arrNotificationsRead = _.filter(arrNotifications, function(notification) {
			return (notification.type == "Read");
		});

		arrNotificationsUnread = _.filter(arrNotifications, function(notification) {
			return (notification.type == "Unread");
		});

		res.end(JSON.stringify({"notificationsRead":arrNotificationsRead,"notificationsUnread":arrNotificationsUnread,"notificationsAll":arrNotifications}));
	});

});

module.exports = app;