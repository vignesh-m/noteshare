var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var flash = require('connect-flash');
var session = require('express-session');
var multer = require('multer');
var passport = require('passport');
var routes = require('./routes/index');
var search = require('./routes/search');
var upload = require('./routes/upload');
var notifications = require('./routes/notifications');
var follow = require('./routes/follow');
var download = require('./routes/download');
var profile=require('./routes/profile');
var common = require('./routes/common');
var tag=require('./routes/tag');
var app = express();
var util = require('./routes/util/util');
var forgot=require('./routes/forgot_password');

var isAuth = function(req, res, next) {
    //console.log('Authenticating');
    if (req.isAuthenticated())
        next();
    else {
        res.redirect('/login')
    }
};

// view engine setup
app.use('/views/:uploadid/:imgname', isAuth, function (req, res, next) {
    next();
});
app.set('views', path.join(__dirname,'public'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ secret: 'SeKRetKeeY' } ));
require('./routes/passport')(passport);
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session
app.use(multer({
    dest: './uploads/',
    onFileUploadComplete: function (file) {
        console.log(file.fieldname + ' uploaded to  ' + file.path)
    }
}));

app.post('/', function(req, res) {
    res.end("awesome");
});

app.get('/email', function(req, res) {
    util.sendEmail(req.query.email);
    res.end("mailed to " + req.query.email);
});

app.use('/', routes);
app.use('/search', search);
app.use('/upload', upload);
app.use('/download', download);
app.use('/notifications', notifications);
app.use('/follow', follow);
app.use('/profile',profile);
app.use('/tag', tag);
app.use('/common', common);
app.use('/pass',forgot);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});


passport.serializeUser(function(user, done) {
    done(null, user.id);
});

// used to deserialize the user
passport.deserializeUser(function(id, done) {
    connection.query("SELECT * FROM user WHERE id = ? ",[id], function(err, rows){
        done(err, rows[0]);
    });
});


// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;
