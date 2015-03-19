var express = require('express');
var app = express.Router();
var error = require('./error');
var mysql = require('mysql');
var db = require('../public/db_structure');
var notification = require('./util/notification');
var isAuth = function(req, res, next) {
    console.log('Authenticating');
    if (req.isAuthenticated())
        next();
    else {
        req.flash('login', 'LOGIN');
        res.redirect('/login')
    }
};
app.get('/add', isAuth,function(req, res) {
	var errobj = error.err_insuff_params(res, req, ['follows']);
	var querystring = "";
	if(!errobj) {
		return;
	}

	var user_id = req.user.id;
	var follows = req.query.follows;

	notification.setFollower(user_id, follows);
	res.end(JSON.stringify({'result':true,'user_id':user_id,'follows':follows}));
});

module.exports = app;