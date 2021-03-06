/**
 * Created by vignesh on 11/2/15.
 */
 var express = require('express');
 var router = express.Router();
 var mysql=require('mysql');
 var db = require('../public/db_structure');
 var notification = require('./util/notification');
 var util = require('./util/util');
 var _ = require('underscore');
 var http=require('http');

 var isAuth = function(req, res, next) {
   //console.log('Authenticating');
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
    if(req.query.id) {
        var id = req.query.id;
    }
    else id=req.user.id;
    var querystring = "SELECT * FROM noteshare.uploads WHERE userid=" + mysql.escape(id) + " ORDER BY uploads.dateUploaded";
    db.querydb(querystring,function(result){ 
       //console.log(querystring);
        res.end(JSON.stringify(result));
    });
});
router.get('/getupload',isAuth,function(req,res){
    if(!req.query.id){
        res.end();return;
    }
    var querystring = "SELECT * FROM noteshare.uploads WHERE id=" + mysql.escape(req.query.id) + " ORDER BY uploads.dateUploaded";
    db.querydb(querystring,function(result){
       //console.log(result);
        db.querydb("SELECT * FROM noteshare.user WHERE id="+result[0].userid+";",function(userobj){
            db.querydb("SELECT tagmap.tagid FROM noteshare.tagmap WHERE uploadid="+ req.query.id + ";",function(tagids){
                var tagidsfinal = "(";
                    for(var i = 0;i<tagids.length - 1;i++) {
                        tagidsfinal+=tagids[i].tagid+",";
                    }
                    if(tagids[tagids.length-1]) {
                        tagidsfinal+=tagids[tagids.length-1].tagid+")";
        }
        var qs = "SELECT * FROM noteshare.tag WHERE tag.id IN " + tagidsfinal + ";";
        debugger;
        db.querydb(qs,function(tags){
            debugger;
           //console.log(tags);
            res.end(JSON.stringify({file:result[0],user:userobj[0],tags:tags}));
        });
    });
           //console.log(userobj);
        });

    });
});
router.post('/',isAuth,function(req,res){
   //console.log(req.files);
   //console.log(req.headers.x);
   //console.log(req.body);
    var files = req.files.uploadedFile;
    if(!files){
        res.end('error no files sent');
    } else {
        var querystring="INSERT INTO noteshare.uploads(userid,name,filename,views,rating,dateUploaded,department,semester,year) VALUES(";
            if(req.user && req.user.id){
                querystring+=mysql.escape(req.user.id)+',';
            } else {
                res.end('{result:false,error:"not auth"}');
                return ;
            }
            if(req.body.uploadfilename){
                querystring+=(req.body.name)?req.body.name:mysql.escape(req.body.uploadfilename)+',';
            } else {
                querystring+=mysql.escape(files.originalname)+',';
            }
            querystring+=mysql.escape(files.name)+',';
        querystring+='0,';//default no of views
        querystring+='3,';//default rating
        querystring+=mysql.escape(util.dateToMysqlFormat(new Date()))+",";
        querystring+=mysql.escape(req.body.department?req.body.department:'none')+",";
        querystring+=mysql.escape(req.body.semester?req.body.semester:'1')+",";
        querystring+=mysql.escape(req.body.year?req.body.year:'1');
        querystring+=");";
db.querydb(querystring,function(result){
   //console.log(querystring);
            //TODO : extend it for an array
            //util.savePDFToSWF("uploads/" + files.name, "public/views/" + "test1.swf");
            
           //console.log(result);

            var uid = result.insertId;
            debugger;
            var link = "/upload/getupload?id=" + uid;
           //console.log("/upload/getupload?id=" + result.insertId);
            debugger;
           //console.log(link);
            notification.notifyAllFollowers(req.user.id,"Unread",req.user.username + " has uploaded a file : " + files.originalname, "Upload", "/upload/getupload?id=" + result.insertId);
            debugger;
            res.end(JSON.stringify({result:true,upload_id:uid}));
            util.savePDFToPNG("uploads/" + files.name, "public/views/" + result.insertId + "/page.png", result.insertId, function() {
               //console.log('completed converting..');
            });
            /*        var qs1 = [];
                    var qs2 = [];

                    for(var ind=0;ind<tags.length;ind++) {
                        qs1.push("SELECT tag.* from noteshare.tag WHERE tag.name = '"+tags[ind]+"';");
                        qs2.push("INSERT INTO noteshare.tag(name) VALUES('"+tags[ind]+"');");

                       //console.log("it");

                        if(ind == tags.length - 1) {
                            for (var i = 0; i < tags.length; i++) {
                                debugger;
                               //console.log("multi tag/add?tagname=" + tags[i] + "&uploadid=" + result.insertId);
                                var tag = tags[i];

                                debugger;
                                db.querydb(qs1[i],function(result){
                                   //console.log(qs1[i]);
                                    debugger;
                                    if(result.length==0){
                                        db.querydb(qs2[i],function(result){
                                           //console.log(qs2[i]);
                                            var tagid=result.insertId;
                                            var qs3 = "INSERT INTO noteshare.tagmap(tagid,uploadid) VALUES("+mysql.escape(tagid)+","+mysql.escape(uid)+");";
                                           //console.log("INSERT INTO noteshare.tag(name) VALUES('"+tags[i]+"');");
                                            db.querydb(qs3,function(result){
                                                res.end(JSON.stringify(result));
                                            })
                                        })
                                    } else {
                                     tagid=result[0].id;
                                     db.querydb("INSERT INTO noteshare.tagmap(tagid,uploadid) VALUES("+mysql.escape(tagid)+","+mysql.escape(req.query.uploadid)+");",function(result){
                                         res.end(JSON.stringify(result));
                                     })
                                 }
                             });
}

}

}
*/

})
}
});


module.exports=router;