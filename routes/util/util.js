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
      console.log('stdout: ' + stdout);
      console.log('stderr: ' + stderr);
      if (error !== null) {
          console.log('exec error: ' + error);
          return false;
      }
      return true;
  });
}

module.exports = {savePDFToSWF:savePDFToSWF, dateToMysqlFormat:dateToMysqlFormat};