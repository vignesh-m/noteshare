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
router.get('/get', function(req, res) {
    var id;
    if(req.query.id) 
        id = req.query.id;
    else id = req.user.id;
    var qs = "SELECT * FROM noteshare.user WHERE user.id=" + mysql.escape(id);
    db.querydb(qs,function(user){
        console.log(user);
        res.end(JSON.stringify({result:true,data:user[0]}));
    })
});
router.get('/view',isAuth,function(req,res){
    if(req.query.id){
        var qs = "SELECT * FROM noteshare.user WHERE user.id=" + mysql.escape(req.query.id);
        var qs1 = "UPDATE noteshare.user" + " SET views=views+1 " + "WHERE id=" + req.query.id;
        console.log(req.query.id);
        db.querydb(qs,function(user){
            console.log(user);
            console.log(req.user);
            console.log('updating view..');
            console.log(qs1);
            db.querydb(qs1,function(result){
                console.log(qs1);
                res.render('profile-view.ejs',{user:req.user,otherUser:user[0]});
            });
        });
    }
});

module.exports = router;