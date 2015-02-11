/**
 * Created by vignesh on 9/2/15.
 */
var express = require('express');
var router = express.Router();
var mysql= require('mysql');
var db=require('../public/db_structure.js');
router.get('/', function(req, res, next) {
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
    if(req.query.name){
       conditions.push('uploads.name LIKE '+mysql.escape('%'+req.query.name+'%'));
    }
    if(req.query.user){
        conditions.push('user.username = '+mysql.escape(req.query.user));
    }
    if(req.query.userid){
        conditions.push('user.userid = '+mysql.escape(req.query.userid));
    }
    if(req.query.rating){
        conditions.push('uploads.rating >= '+mysql.escape(req.query.rating));
    }
    if(req.query.sort){
        if(req.query.sort.length)
            sort.push(mysql.escape(req.query.sort));
        else {
            sort=req.query.sort;
        }
    }
    if(req.query.tag){
        tables.push('tagmap');
        tables.push('tag');
        conditions.push('tagmap.uploadid = uploads.id');
        conditions.push('tagmap.tagid=tag.id');
        conditions.push('tag.id='+mysql.escape(req.query.tag));
        columns.push('tag.name');
    }
    if(req.query.college){
        conditions.push('user.college = '+mysql.escape(req.query.college));
    }
    if(req.query.user || req.query.userid || req.query.college){
        tables.push('user');
        conditions.push('uploads.userid=user.id');
        columns.push('user.*');
    }
    columns.push('uploads.*');
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
        if(i<sort.length-1) querystring+=sort[i]+" AND ";
        else querystring+=sort[i];
    }
    querystring+=';';
    db.querydb(querystring,function(result){
        console.log(querystring);
        res.end(JSON.stringify(result));
    });
});
module.exports = router;
