const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); 
const { check, validationResult } = require('express-validator');
const bodyParser = require('body-parser');
const passport = require('passport');

//Bring in Article model
let User = require('../models/user');

//Register form
router.get('/register', (req, res) =>{
	res.render('register');
});

//Register process
router.post('/register', [
		check('name', 'Name is required.').exists({checkFalsy: true}),
		check('email', 'Email is not valid.').isEmail(),
		check('username', 'Username is required.').exists({checkFalsy: true}),
		check('password', 'Password is required.').exists({checkFalsy: true}),
		check('password2', 'Passwords do not match.')
			.exists({checkFalsy: true})
			.custom((value, { req }) => value === req.body.password)
	], (req, res) =>{

	//Get errors
	let errors = validationResult(req);

	if(!errors.isEmpty()){
		res.render('register', {
			errors: errors.array()
		});
	} else {
		let newUser = new User ({
			name: req.body.name,
			email: req.body.email,
			username: req.body.username,
			password: req.body.password
		});

		bcrypt.genSalt(10, (err, salt) => {
			bcrypt.hash(newUser.password, salt, (err, hash) => {
				if(err) {
					console.log(err);
				}
				newUser.password = hash;
				newUser.save((err) =>{
					if(err){
						console.log(err);
						return;
					} else {
						req.flash('success', 'You are now registered and can log in.')
						res.redirect('/users/login');
					}
				});
			});
		});
	}
});

//Login form
router.get('/login', (req, res) =>{
	res.render('login');
});

//Login process
router.post('/login', (req, res, next) =>{
	passport.authenticate('local', {
		successRedirect: '/',
		failureRedirect: '/users/login',
		failureFlash: true
	})(req, res, next);
});

//Logout
router.get('/logout', (req, res) => {
	req.logout();
	req.flash('success', 'You are logged out');
	res.redirect('/users/login');
});

module.exports = router;