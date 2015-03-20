/**
 * Created by vignesh on 11/2/15.
 */
 var express = require('express');
 var router = express.Router();
 var mysql=require('mysql');
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
router.get('/',isAuth,function(req, res){
    res.render('upload');
});
router.get('/get', isAuth, function(req, res) {
    console.log('got id '+req.query.id);
    if(req.query.id){
        console.log('got id '+req.query.id);
        var querystring = "SELECT * FROM noteshare.uploads WHERE userid=" + mysql.escape(req.query.id);
        db.querydb(querystring, function (result) {
            console.log(querystring);
            res.end(JSON.stringify(result));
        });
    } else {
        var querystring = "SELECT * FROM noteshare.uploads WHERE userid=" + mysql.escape(req.user.id);
        db.querydb(querystring, function (result) {
            console.log(querystring);
            res.end(JSON.stringify(result));
        });
    }
});
router.post('/',isAuth,function(req,res){
    console.log(req.files);
    console.log(req.headers.x);
    console.log(req.body);
    var files = req.files.uploadedFile;
    if(!files){
        res.end('error no files sent');
    } else {
        var querystring="INSERT INTO noteshare.uploads(userid,name,filename,views,rating) VALUES(";
            if(req.user && req.user.id){
                querystring+=mysql.escape(req.user.id)+',';
            } else {
            //TODO should throw error
            querystring+='1,';
        }
        if(req.body.uploadfilename){
            querystring+=mysql.escape(req.body.uploadfilename)+',';
        } else {
            querystring+=mysql.escape(files.originalname)+',';
        }
        querystring+=mysql.escape(files.name)+',';
        querystring+='0,3);';
db.querydb(querystring,function(result){
    console.log(querystring);
    notification.notifyAllFollowers(req.user.id,"Unread",req.user.username + " has uploaded a file : " + files.originalname);
    res.end(JSON.stringify(result));
})
}
});


module.exports=router;