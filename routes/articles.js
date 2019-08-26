const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');

//Bring in Article model
let Article = require('../models/article');

//Bring in User model
let User = require('../models/user');


//Add route
router.get('/add', ensureAuthenticated, (req, res) =>{
	res.render('add_article', {
		title:'Add Article'
	});
});

//Add submit POST route
router.post('/add', [
		check('title', 'Title is required.').exists({checkFalsy: true}),
		//check('author', 'Author is required.').exists({checkFalsy: true}),
		check('body', 'Body is required.').exists({checkFalsy: true})
	], (req, res) =>{

	//Get errors
	let errors = validationResult(req);

	if(!errors.isEmpty()){
		res.render('add_article', {
			title: 'Add Article',
			errors: errors.array()
		});
	} else {
		let article = new Article();
		article.title = req.body.title;
		article.author = req.user._id;
		article.body = req.body.body;

		article.save((err) => {
			if(err) {
				console.log(err);
				return;
			} else {
				req.flash('success', 'Article added.')
				res.redirect('/');
			}
		});
	}	
});

//Load edit form
router.get('/edit/:id', ensureAuthenticated, (req, res) => {
	Article.findById(req.params.id, (err, article) =>{
		if(article.author != req.user._id) {
			req.flash('danger', 'Not authorized');
			return res.redirect('/');
		}

		res.render('edit_article', {
			title: 'Edit Article',
			article: article
		});
	
	});
});

//Update submit
router.post('/edit/:id', [
		check('title', 'Title is required.').exists({checkFalsy: true}),
		//check('author', 'Author is required.').exists({checkFalsy: true}),
		check('body', 'Body is required.').exists({checkFalsy: true})
	], (req, res) => {

	//Get errors
	let errors = validationResult(req);
	
	if(!errors.isEmpty()){
		Article.findById(req.params.id, (err, article) => {
			res.render('edit_article', {
				title: 'Edit Article',
				article: article,
				errors: errors.array()
			});
		});
	} else {
		let article = {};
		article.title = req.body.title;
		//article.author = req.body.author;
		article.body = req.body.body;

		let query = {_id:req.params.id}

		Article.updateOne(query, article, (err, rawResponse) => {
			if(err) {
				console.log(err);
				return;
			} else {
				console.log(`${rawResponse.nModified} file updated.`);
				req.flash('success', 'Article updated.');
				res.redirect('/');
			}
		});
	}
});

//Delete article
router.delete('/:id', (req, res) => {

	if(!req.user._id){
		res.status(500).send();
	}

	let query = {_id:req.params.id}

	Article.findById(req.params.id, (err, article) => {
		if(article.author != req.user._id) {
			res.status(500).send();
		} else {
			Article.deleteOne(query, err => {
				if(err){
				console.log(err);
				}
				res.send('Success');
			});
		}
	});
});

//Get single article
router.get('/:id', (req, res) => {
	Article.findById(req.params.id, (err, article) => {
		User.findById(article.author, (err, user) => {
			res.render('article', {
				article: article,
				author: user.name
			});
		});
		
	});
});

//Access control
function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		return next();
	} else {
		req.flash('danger', 'Please login');
		res.redirect('/users/login');
	}
}

module.exports = router;