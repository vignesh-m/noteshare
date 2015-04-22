var express = require('express');
var router = express.Router();
var error = require('./error');
var mysql = require('mysql');
var crypto=require('crypto');
var bcrypt=require('bcrypt-nodejs');
var db = require('../public/db_structure');
var mailer=require('./util/mailer');
var isAuth = function(req, res, next) {
    //console.log('Authenticating');
    if (req.isAuthenticated())
        next();
    else {
        req.flash('login', 'LOGIN');
        res.redirect('/login')
    }
};
function reset_url(user,newpass){
    return encodeURI("http://52.74.135.20/pass/activate?username="+user.username+"&code="+newpass);
}
router.get("/forgot",function(req,res){
    if(req.query.username){
        db.querydb("SELECT * from noteshare.user where username="+mysql.escape(req.query.username)+";",function(result){
            var user=result[0];
            console.log(user);
            crypto.randomBytes(20,function(err,buf){
                var newpass_plain=buf.toString('hex');
                console.log(newpass_plain)
                var newpass=bcrypt.hashSync(newpass_plain);
                db.querydb("UPDATE noteshare.user set newpass = "+mysql.escape(newpass)+",isupdatingpass= true "+"where username="+mysql.escape(req.query.username),function(result){
                    mailer.sendMail(req.query.email,'Reset Noteshare Password ','Your new password is '+newpass_plain+'\nClick this link to activate your password : '+reset_url(user,newpass));
                    res.end("{result:true}");
                })
            })
        })
    } else if(req.query.email){//todo enforce unique email or remove this
        db.querydb("SELECT * from noteshare.user where email="+mysql.escape(req.query.email)+";",function(result){
            var user=result[0];
            //console.log(user);
            crypto.randomBytes(20,function(err,buf){
                var newpass_plain=buf.toString('hex');
                //console.log(newpass_plain);
                var newpass=bcrypt.hashSync(newpass_plain);
                db.querydb("UPDATE noteshare.user set newpass = "+mysql.escape(newpass)+",isupdatingpass= true "+"where username="+mysql.escape(user.username),function(result){
                    mailer.sendMail(req.query.email,'Reset Noteshare Password ','Your new password is '+newpass_plain+'\nClick this link to activate your password : '+reset_url(user,newpass));
                    res.end("{result:true}");
                })

            })
        })
    } else {
        db.querydb("SELECT * from noteshare.user where username="+mysql.escape(req.user.username)+";",function(result){
            var user=result[0];
            //console.log(user);
            crypto.randomBytes(8,function(err,buf){
                var newpass_plain=buf.toString('hex');
                //console.log(newpass_plain)
                db.querydb("UPDATE noteshare.user set newpass = "+newpass_plain+",isupdatingpass= true "+"where username="+mysql.escape(user.username),function(result){
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
        var newpasshash=bcrypt.hashSync(user.newpass);
        if(req.query.code == newpasshash){
            db.querydb("UPDATE noteshare.user set password = "+mysql.escape(req.query.code)+",isupdatingpass= false "+"where username="+mysql.escape(user.username)+";",function(result){
                req.session.message="Succesfully changed password. Use this password to login : "+newpasshash;
            })
        } else {
            res.end('invalid request')
        }
    })

})
router.post("/change",isAuth,function(req,res){
    //console.log('oldpass ' +req.body.oldpass);
    //console.log('newpass '+req.body.newpass);
    if(!req.body.oldpass || !req.body.newpass){
        res.end("{result:false}");
        return;
    }
    db.querydb("SELECT * from noteshare.user where username="+mysql.escape(req.user.username)+";",function(result){
        var user=result[0];
        if(bcrypt.compareSync(req.body.oldpass,user.password)){
            var newhash=bcrypt.hashSync(req.body.newpass);
            db.querydb("UPDATE noteshare.user set password = "+mysql.escape(newhash)+" where username="+mysql.escape(user.username)+";",function(result){
                req.session.message='Successfully changed password';
                //console.log("changed")
                res.redirect('/info');
            })
        } else {
            req.session.message='Invalid password';
            //console.log("not changed")
            res.redirect('/info');
        }
    })
})
module.exports=router;
