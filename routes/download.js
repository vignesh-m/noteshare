var express = require('express');
var app = express.Router();
var error = require('./error');
var mysql = require('mysql');
var db = require('../public/db_structure');
var _ = require('underscore');

app.get('/get', function (req, res) {
	var errobj = error.err_insuff_params(res, req, ['upload_id']);
	var querystring = "";

	if(!errobj) {
		return;
	}

	var user_id = req.query.user_id;

});