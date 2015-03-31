/**
 * Created by vignesh on 9/2/15.
 */
var express = require('express');
var router = express.Router();
var mysql= require('mysql');
var db=require('../public/db_structure');
function match_name(search_str,fieldname){
    var search_words=search_str.split(" ");
    var s1="";
    for(var i=0;i<search_words.length;i++){
        s1+="*"+search_words[i]+"* ";
    }
    return "match("+fieldname+") against(\""+s1+"\" IN BOOLEAN MODE) as score";
}
function query_upload(req,callback){
    var querystring='';
    var tables=[];
    var columns=[];
    var conditions=[];
    var sort=[];
    /**
     * search parameters :
     *      name - by uploads.name
     *      user - by user.username
     *      userid - by user.userid
     *      rating - by uploads.rating >= ..
     *      tag - by tag.tagid
     *      college - by user.college
     */
    tables.push('uploads');
    columns.push('uploads.*');
    if(req.name){
        columns.push(match_name(req.name,"uploads.name"));
        sort.push("score DESC");
        //conditions.push('uploads.name LIKE '+mysql.escape('%'+req.name+'%'));
    }
    if(req.user){
        conditions.push('user.username = '+mysql.escape(req.user));
    }
    if(req.userid){
        conditions.push('user.userid = '+mysql.escape(req.userid));
    }
    if(req.rating){
        conditions.push('uploads.rating >= '+mysql.escape(req.rating));
    }
    if(req.sort){
        if(req.sort.length)
            sort.push(mysql.escapeId(req.sort));
        else {
            sort=req.sort;
        }
    }
    if(req.tag){
        tables.push('tagmap');
        tables.push('tag');
        conditions.push('tagmap.uploadid = uploads.id');
        conditions.push('tagmap.tagid=tag.id');
        conditions.push('tag.id='+mysql.escape(req.tag));
        columns.push('tag.name');
    }
    if(req.college){
        conditions.push('user.college = '+mysql.escape(req.college));
    }
    if(req.user || req.userid || req.college){
        tables.push('user');
        conditions.push('uploads.userid=user.id');
        columns.push('user.*');
    }

    querystring ='SELECT ';
    for(var i=0;i<columns.length;i++){
        if(i<columns.length-1) querystring+=columns[i]+",";
        else querystring+=columns[i];
    }
    querystring+=' FROM ';
    for(var i=0;i<tables.length;i++){
        if(i<tables.length-1) querystring+='noteshare.'+tables[i]+",";
        else querystring+='noteshare.'+tables[i];
    }
    if(conditions.length>0)
        querystring+=' WHERE ';
    for(var i=0;i<conditions.length;i++){
        if(i<conditions.length-1) querystring+=conditions[i]+" AND ";
        else querystring+=conditions[i];
    }
    if(sort.length>0)
        querystring+=' ORDER BY ';
    for(var i=0;i<sort.length;i++){
        if(i<sort.length-1) querystring+=mysql.escapeId(sort[i])+" , ";
        else querystring+=sort[i];
    }
    querystring+=';';
    db.querydb(querystring,function(result){
        console.log(querystring);
        callback(result);
    });
}
router.get('/', function(req, res) {
    query_upload(req.query,function(result){
        res.end(JSON.stringify(result));
    })
});
router.get('/user',function(req,res){
    var querystring="";
    if(req.query.name){
        querystring="SELECT user.*,"+match_name(req.query.name,"user.username,user.firstname,user.lastname")+" FROM " +
        "noteshare.user ORDER BY score DESC";
        db.querydb(querystring,function(result){
            console.log(querystring);
            res.end(JSON.stringify(result));
        });
    } else {
        res.end("error");
    }
});
module.exports = router;
