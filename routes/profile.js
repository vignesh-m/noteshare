var express = require('express');
var router = express.Router();
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

router.get('/',isAuth,function(req,res){
    res.render('my-profile.ejs', {
        user : req.user // get the user out of session and pass to template
    });
});
router.get('/view',isAuth,function(req,res){
    if(req.query.id){
        var qs = "SELECT * FROM noteshare.user WHERE user.id=" + mysql.escape(req.query.id);
        db.querydb(qs,function(user){
            console.log(user);
            res.render('profile-view.ejs',{user:user[0]});
        })
    }
})
module.exports = router;