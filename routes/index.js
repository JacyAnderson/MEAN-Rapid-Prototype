var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

var mongoose = require('mongoose');
var Post = mongoose.model('Post');
var Comment = mongoose.model('Comment');

// GET all POSTS
router.get('/posts', function(req, res, next) {
	Post.find(function(err, posts) {
		if(err) { return next(err); }
		res.json(posts);
	});
});

// CREATE a new POST
router.post('/posts', function(req, res, next) {

  // assign a new variable using the Post model and the req's body
	var post = new Post(req.body);

	// save the new post
  post.save(function(err, post) {
  	if(err) {return next(err); }
    res.json(post);
  });
});

// Preloads post objects when a post parameter conatins an id
router.param('post', function(req, res, next, id) {
  var query = Post.findById(id);
  query.exec(function (err, post) {
  	if (err) {return next(err); }
  	if (!post) { return next (new Error("can't find post")); 
  }
  req.post = post;
  return next();
  });
});

// Preload comment objects on routes with ':comment'
router.param('comment', function(req, res, next, id) {
  var query = Comment.findById(id);

  query.exec(function (err, comment){
    if (err) { return next(err); }
    if (!comment) { return next(new Error("can't find comment")); }

    req.comment = comment;
    return next();
  });
});

// SHOW one post
router.get('/posts/:post', function(req, res, next) {
  req.post.populate('comments', function(err, post) {
    res.json(post);
  });
});

// UPDATE post's upvotes
router.put('/posts/:post/upvote', function(req, res, next) {
	req.post.upvote(function(err, post) {
		if (err) { return next(err); }
		res.json(post);
	});
});

// POST a comment to a post
router.post('/posts/:post/comments', function(req, res, next) {
  var comment = new Comment(req.body);
  comment.post = req.post;

  comment.save(function(err, comment){
    if(err){ return next(err); }

    req.post.comments.push(comment);
    req.post.save(function(err, post) {
      if(err){ return next(err); }

      res.json(comment);
    });
  });
});

// upvote a comment
router.put('/posts/:post/comments/:comment/upvote', function(req, res, next) {
  req.comment.upvote(function(err, comment){
    if (err) { return next(err); }

    res.json(comment);
  });
});


// export router for use elsewhere
module.exports = router;
