/**
 * Created by vigneshm on 11/04/15.
 */
var nodemailer=require('nodemailer');

// create reusable transporter object using SMTP transport
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'bot.noteshare@gmail.com',
        pass: 'noteshare123'
    }
});

// NB! No need to recreate the transporter object. You can use
// the same transporter object for all e-mails

// setup e-mail data with unicode symbols


// send mail with defined transport object
function test() {
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Message sent: ' + info.response);
        }
    });
}
function sendMail(tolist,subject,text,res){
    var mailOptions = {
        from: 'Noteshare Bot <bot.noteshare@gmail.com>', // sender address
        to: tolist, // list of receivers
        subject: subject, // Subject line
        text: text, // plaintext body
        //html: '<b>Hello world ✔</b>' // html body todo html content
    };
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Message sent: ' + info.response);
        }
    });
}

module.exports={
    test:test,
    sendMail:sendMail
};