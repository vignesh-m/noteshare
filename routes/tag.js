var express = require('express');
var router = express.Router();
var db = require('../public/db_structure');
var mysql= require('mysql');
var isAuth = function(req, res, next) {
    console.log('Authenticating');
    if (req.isAuthenticated())
        next();
    else {
        req.flash('login', 'LOGIN');
        res.redirect('/login')
    }
};

router.get('/add', isAuth, function(req,res){
    var ret={};
   if(req.query.tagname && req.query.uploadid){
       db.querydb("SELECT tag.* from noteshare.tag WHERE tag.name = "+mysql.escape(req.query.tagname)+";",function(result){
           if(result.length==0){
                db.querydb("INSERT INTO noteshare.tag(name) VALUES("+mysql.escape(req.query.tagname)+");",function(result){
                    var tagid=result.insertId;
                    db.querydb("INSERT INTO noteshare.tagmap(tagid,uploadid) VALUES("+mysql.escape(tagid)+","+mysql.escape(req.query.uploadid)+");",function(result){
                        res.end(JSON.stringify(result));
                    })
                })
            } else {
               tagid=result[0].id;
               db.querydb("INSERT INTO noteshare.tagmap(tagid,uploadid) VALUES("+mysql.escape(tagid)+","+mysql.escape(req.query.uploadid)+");",function(result){
                   res.end(JSON.stringify(result));
               })
            }
       })
   }
});
router.get('/',function(req,res){
    if(req.query.uploadid){
        db.querydb("SELECT * from noteshare.tagmap,noteshare.tag where tagmap.uploadid="+mysql.escape(req.query.uploadid)+" AND tagmap.tagid=tag.id;",function(result){
            res.end(JSON.stringify(result));
        });
    }
})
module.exports=router;