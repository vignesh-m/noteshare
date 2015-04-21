/**
 * Created by vignesh on 9/2/15.
 */
 var express = require('express');
 var router = express.Router();
 var mysql= require('mysql');
 var db=require('../public/db_structure');
 function match_name(search_str,fieldname,col){
    var search_words=search_str.split(" ");
    var s1="";
    for(var i=0;i<search_words.length;i++){
        s1+="*"+search_words[i]+"* ";
    }
    return "match("+fieldname+") against(\""+s1+"\" IN BOOLEAN MODE) as "+col;
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
     *      user - by user.username,firstname,lastname
     *      userid - by user.userid
     *      rating - by uploads.rating >= ..
     *      tag - by tag.tagid
     *      tagname - bt tag.name
     *      college - by user.college
     *      department - by uploads.department
     *      semester - by uploads.semester
     *      year - by uploads.year
     */

     
     if(req.user || req.userid || req.college){
        tables.push('user');
        conditions.push('uploads.userid=user.id');
        columns.push('user.*');
    }

    tables.push('uploads');
    columns.push('uploads.*');
    if(req.name){
        columns.push(match_name(req.name,"uploads.name","score1"));
        sort.push("score1");
        //conditions.push('uploads.name LIKE '+mysql.escape('%'+req.name+'%'));
    }
    if(req.user){
        columns.push(match_name(req.user,"user.username,user.firstname,user.lastname","score2"));
        sort.push("score2");
    }
    if(req.userid){
        conditions.push('user.userid = '+mysql.escape(req.userid));
    }
    if(req.rating){
        conditions.push('uploads.rating >= '+mysql.escape(req.rating));
    }
    if(req.department){
        conditions.push('uploads.department like '+mysql.escape('%'+(req.department)+'%'));
    }
    if(req.semester){
        conditions.push('uploads.semester like '+mysql.escape('%'+(req.semester)+'%'));
    }
    if(req.year){
        conditions.push('uploads.year = '+mysql.escape(req.year));
    }
    if(req.sort){
        if(req.sort.length)
            sort.push(mysql.escapeId(req.sort));
        else {
            sort=req.sort;
        }
    }
    if(req.tag || req.tagmap || req.tagname){
        tables.push('tagmap');
        tables.push('tag');
        conditions.push('tagmap.uploadid = uploads.id');
        conditions.push('tagmap.tagid=tag.id');
        columns.push('tag.*');
    }
    if(req.tag){
        conditions.push('tag.id='+mysql.escape(req.tag));
    }
    if(req.tagname){
       //console.log(req.tagname);
        conditions.push('tag.name='+mysql.escape(req.tagname));
    }
    if(req.college){
        conditions.push('user.college = '+mysql.escape(req.college));
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
    for(var i=0;i<sort.length;i++){//todo manage desc and asc
        if(i<sort.length-1) querystring+=mysql.escapeId(sort[i])+" DESC, ";
        else querystring+=mysql.escapeId(sort[i])+" DESC";
    }
    if(req.limit) {
        querystring+=' LIMIT ' + req.limit;
    }
    if(req.offset) {
        querystring+=' OFFSET ' + req.offset;
    }
    querystring+=';';
    db.querydb(querystring,function(result){
       //console.log(querystring);
        callback(result);
    });
}
router.get('/', function(req, res) {
    var query=req.query;

    if(req.query.limit && req.query.limit==0) {
        res.end(JSON.stringify([]));
    }
    else {

        query_upload(query,function(result){
            res.end(JSON.stringify(result));
        });
    }
});
router.get('/user',function(req,res){
    var querystring="";
    if(req.query.name){
        querystring="SELECT user.*,"+match_name(req.query.name,"user.username,user.firstname,user.lastname","score")+" FROM " +
        "noteshare.user ORDER BY score DESC;";
        db.querydb(querystring,function(result){
           //console.log(querystring);
           //console.log(result);
            res.end(JSON.stringify(result));
        });
    } else {
        res.end("error");
    }
});
module.exports = router;
