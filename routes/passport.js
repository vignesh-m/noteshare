// config/passport.js

// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;

// load up the user model
var mysql = require('mysql');
var bcrypt = require('bcrypt-nodejs');
var dbconfig = require('../public/db_structure');
var db=require('./util/db_structure');
var util = require('./util/util');
var connection = mysql.createConnection(dbconfig.connection);
connection.query('USE '+dbconfig.database);
// expose this function to our app using module.exports
module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        connection.query("SELECT * FROM user WHERE id = ? ",[id], function(err, rows){
            done(err, rows[0]);
        });
    });

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'
    var FacebookStrategy = require('passport-facebook').Strategy;

    passport.use('facebook',new FacebookStrategy({
        clientID: '101982750133452',
        clientSecret: "e2aa9d68d8a47fa9cb507a2a5ba5d8b5",
        callbackURL: "facebook/callback"
        },
        function(accessToken, refreshToken, profile, done) {
            /*User.findOrCreate(..., function(err, user) {
                if (err) { return done(err); }
                done(null, user);
            });*/
                debugger;
                 connection.query("SELECT * FROM user WHERE username = ?",[profile.name.givenName+' '+profile.name.familyName], function(err, rows) {
                    debugger;
                if (err)
                    return done(err);
                if (rows.length) {

                    return done(null, false);
                } else {
                    // if there is no user with that username
                    // create the user
                    debugger;
                    var newUserMysql = {
                        username: profile.name.givenName+' '+profile.name.familyName,
                        password: bcrypt.hashSync("nothing", null, null)  // use the generateHash function in our user model
                    };

                    var insertQuery = "INSERT INTO user ( username, password, dateCreated) values (?,?,?)";

                    connection.query(insertQuery,[newUserMysql.username, newUserMysql.password, util.dateToMysqlFormat(new Date())],function(err, rows) {
                        debugger;
                        newUserMysql.id = rows.insertId;

                        return done(null, newUserMysql);
                    });
                }
            });

    }
));
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

passport.use('google',new GoogleStrategy({
    clientID: '419932949832-es2h8m4k4vmr97ckqsntd9v1unh7mjoa.apps.googleusercontent.com',
    clientSecret: 'dSVVSQXKC-pyFS-tQvspYJ8n',
    callbackURL: "auth/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {
   /* User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return done(err, user);
    });*/
  }
));
    passport.use(
        'local-signup',
        new LocalStrategy({

            // by default, local strategy uses username and password, we will override with email
            usernameField : 'username',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, username, password,done) {
            // find a user whose email is the same as the forms email
            // we are checking to see if the user trying to login already exists
           //console.log(req.body);
            connection.query("SELECT * FROM user WHERE username = ?",[username], function(err, rows) {
                if (err)
                    return done(err);
                if (rows.length) {
                    return done(null, false, req.flash('signupMessage', 'That username is already taken.'));
                } else {
                    // if there is no user with that username
                    // create the user
                    debugger;
                    var newUserMysql = {
                        username: username,
                        password: bcrypt.hashSync(password,null,null)  // use the generateHash function in our user model
                    };
                    debugger;
                    var insertQuery = "INSERT INTO user ( username, password ,college,firstname,lastname,credits,views, dateCreated) values (?,?,?,?,?,0,0,?)";

                    connection.query(insertQuery,[newUserMysql.username, newUserMysql.password,req.body.college,req.body.firstname,req.body.lastname,util.dateToMysqlFormat(new Date())],function(err, rows) {
                        newUserMysql.id = rows.insertId;

                        return done(null, newUserMysql);
                    });
                }
            });
        })
    );

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use(
        'local-login',
        new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'username',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, username, password, done) { // callback with email and password from our form
            connection.query("SELECT * FROM user WHERE username = ?",[username], function(err, rows){
                if (err)
                    return done(err);
                if (!rows.length) {
                    return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash
                }

                // if the user is found but the password is wrong
                if (!bcrypt.compareSync(password, rows[0].password))
                    return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

                // all is well, return successful user
                return done(null, rows[0]);
            });
        })
    );
};
