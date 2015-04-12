var express = require('express');
var router = express.Router();
var error = require('./error');
var mysql = require('mysql');
var crypto=require('crypto');
var bcrypt=require('bcrypt-nodejs');
var db = require('../public/db_structure');
var mailer=require('./util/mailer');
var isAuth = function(req, res, next) {
    console.log('Authenticating');
    if (req.isAuthenticated())
        next();
    else {
        req.flash('login', 'LOGIN');
        res.redirect('/login')
    }
};
function reset_url(user,newpass){
    return encodeURI("http://localhost:3000/pass/activate?username="+user.username+"&code="+newpass);
}
router.get("/forgot",isAuth,function(req,res){
    if(req.query.username){
        db.querydb("SELECT * from noteshare.user where username="+mysql.escape(req.query.username)+";",function(result){
            var user=result[0];
            console.log(user);
            crypto.randomBytes(20,function(err,buf){
                var newpass_plain=buf.toString('hex');
                console.log(newpass_plain)
                var newpass=bcrypt.hashSync(newpass_plain);
                db.querydb("UPDATE noteshare.user set newpass = "+mysql.escape(newpass)+",isupdatingpass= true "+"where username="+mysql.escape(user.username),function(result){
                    mailer.sendMail(req.query.email,'Reset Noteshare Password ','Your new password is '+newpass_plain+'\nClick this link to activate your password : '+reset_url(user,newpass));
                    res.end('done');})
            })
        })
    } else if(req.query.email){//todo enforce unique email or remove this
        db.querydb("SELECT * from noteshare.user where email="+mysql.escape(req.query.email)+";",function(result){
            var user=result[0];
            console.log(user);
            crypto.randomBytes(20,function(err,buf){
                var newpass_plain=buf.toString('hex');
                console.log(newpass_plain);
                var newpass=bcrypt.hashSync(newpass_plain);
                db.querydb("UPDATE noteshare.user set newpass = "+mysql.escape(newpass)+",isupdatingpass= true "+"where username="+mysql.escape(user.username),function(result){
                    mailer.sendMail(req.query.email,'Reset Noteshare Password ','Your new password is '+newpass_plain+'\nClick this link to activate your password : '+reset_url(user,newpass));
                    res.end('done');
                })

            })
        })
    } else {
        db.querydb("SELECT * from noteshare.user where username="+mysql.escape(req.user.username)+";",function(result){
            var user=result[0];
            console.log(user);
            crypto.randomBytes(8,function(err,buf){
                var newpass_plain=buf.toString('hex');
                console.log(newpass_plain)
                var newpass=bcrypt.hashSync(newpass_plain);
                db.querydb("UPDATE noteshare.user set newpass = "+mysql.escape(newpass)+",isupdatingpass= true "+"where username="+mysql.escape(user.username),function(result){
                    mailer.sendMail(req.query.email,'Reset Noteshare Password ','Your new password is '+newpass_plain+'\nClick this link to activate your password : '+reset_url(user,newpass));
                    res.end('done');})
            })
        })
    }
})
router.get("/activate",function(req,res){
    if(!req.query.username || !req.query.code) {
        res.end("{result:false}");
        return;
    }
    db.querydb("SELECT * from noteshare.user where username="+mysql.escape(req.query.username)+";",function(result){
        var user=result[0];
        if(req.query.code == user.newpass){
            db.querydb("UPDATE noteshare.user set password = "+mysql.escape(req.query.code)+",isupdatingpass= false "+"where username="+mysql.escape(user.username)+";",function(result){
                res.end("successfully changed password");
            })
        } else {
            res.end('invalid request')
        }
    })
})
router.post("/change",isAuth,function(req,res){
    console.log('at change');
    if(!req.body.oldpass || !req.body.newpass){
        res.end("{result:false}");
        return;
    }
    db.querydb("SELECT * from noteshare.user where username="+mysql.escape(req.user.username)+";",function(result){
        var user=result[0];
        if(bcrypt.compareSync(req.body.oldpass,user.password)){
            var newhash=bcrypt.hashSync(req.body.newpass);
            db.querydb("UPDATE noteshare.user set password = "+mysql.escape(newhash)+" where username="+mysql.escape(user.username)+";",function(result){
                res.end("successfully changed password");
            })
        } else {
            res.end('invalid request. wrong password')
        }
    })
})
module.exports=router;