'use strict';

const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const mountRoutes = require('./routes');

const app = express();

passport.use(new LocalStrategy(
	function(username, password, done) {
		User.findOne({
			username: username
		}, function(err, user) {
			if (err) {
				return done(err);
			}
			if (!user) {
				return done(null, false, {
					message: 'Incorrect username.'
				});
			}
			if (!user.validPassword(password)) {
				return done(null, false, {
					message: 'Incorrect password.'
				});
			}
			return done(null, user);
		});
	}
));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: false
}));
app.use(morgan('dev'));

mountRoutes(app);

app.use(express.static(__dirname + '/public'));

app.listen(3000, function() {
	console.log("Ready - Let's go!");
});