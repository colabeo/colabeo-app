var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var Account = require('../../app/models/account');

var Parse = require('parse').Parse;

// Use the LocalStrategy within Passport.

passport.use(new LocalStrategy({
    //usernameField: 'email'

  },
  function(email, password, done) {
      console.log("email - " + email);
      console.log("password - " + password);
      Parse.User.logIn(email, password, {
          success: function(user) {
              console.log("login - success");
              return done(user);
          },
          error: function(user, error) {
              //self.$(".login-form .error").html("Invalid username or password. Please try again.").show();
              //this.$(".login-form button").removeAttr("disabled");
              console.log("login - error");
              return done(error, user);
          }
      });
  }
));

// Passport session setup.

passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
//  Account.findById(id, function (err, user) {
//    done(err, user);
//  });
});