function twoDigits(d) {
  if(0 <= d && d < 32) return "0" + d.toString();
  if(-32 < d && d < 0) return "-0" + (-1*d).toString();
  return d.toString();
}

var dateToMysqlFormat = function(date) {
    return date.getUTCFullYear() + "-" + twoDigits(1 + date.getUTCMonth()) + "-" + twoDigits(date.getUTCDate());// + " " + twoDigits(date.getUTCHours()) + ":" + twoDigits(date.getUTCMinutes()) + ":" + twoDigits(date.getUTCSeconds());
  };

  var savePDFToSWF = function(PDFPath, SWFPath) {
   var exec = require('child_process').exec;
   exec("pdf2swf "+ PDFPath + " " + SWFPath, function (error, stdout, stderr) {
   //console.log('stdout: ' + stdout);
   //console.log('stderr: ' + stderr);
    if (error !== null) {
     //console.log('exec error: ' + error);
      return false;
    }
    return true;
  });
 }

 var sendEmail = function(email) {
  var exec = require('child_process').exec;
  var commandLineInput = "mail" + " -s " + "\"Noteshare Team\" \"" + email + "\" ";
 //console.log(commandLineInput);
  exec(commandLineInput, function (error, stdout, stderr) {
   //console.log('stdout: ' + stdout);
   //console.log('stderr: ' + stderr);
    if (error !== null) {
     //console.log('exec error: ' + error);
      return false;
    }
    return true;
  });
}

var getPages = function(upload_id, res, callback) {
  var exec = require('child_process').exec;
  exec("find "+ "public/views/" + upload_id + " -type f | wc -l", function (error, stdout, stderr) {
   //console.log('stdout: ' + stdout);
   //console.log('stderr: ' + stderr);
    if (error !== null) {
     //console.log('exec error: ' + error);
      return null;
    }
    stdout.replace("\\","");
    stdout.replace("n","");
   //console.log(stdout);
    callback(upload_id, res, stdout);
  });
}

var savePDFToPNG = function(PDFPath, IMGPath, upload_id, callback) {
  var exec = require('child_process').exec;

  exec("mkdir public/views/" + upload_id, function (error, stdout, stderr) {
   //console.log('stdout: ' + stdout);
   //console.log('stderr: ' + stderr);
    if (error !== null) {
     //console.log('exec error: ' + error);
      return false;
    }
    exec("convert "+ PDFPath + " " + IMGPath, function (error, stdout, stderr) {
     //console.log('stdout: ' + stdout);
     //console.log('stderr: ' + stderr);
      callback();
      if (error !== null) {
       //console.log('exec error: ' + error);
        return false;
      }
      return true;
    });
  });  
}

module.exports = {sendEmail:sendEmail,savePDFToSWF:savePDFToSWF, dateToMysqlFormat:dateToMysqlFormat, savePDFToPNG:savePDFToPNG, getPages:getPages};