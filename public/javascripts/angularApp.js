angular.module('news', ['ui.router'])
.config([
	'$stateProvider',
	'$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {

		$stateProvider
		.state('home', {
			url: '/home',
			templateUrl: '/home.html',
			controller: 'MainController',

			// waits to load until page is populated with posts
			resolve: {
				postPromise: ['posts', function(posts) {
					return posts.getAll();
				}]
			}
		})
		.state('posts', {
			url: '/posts/{id}',
			templateUrl: '/posts.html',
			controller: 'PostsController',
			resolve: {
        post: ['$stateParams', 'posts', function($stateParams, posts) {
          return posts.get($stateParams.id);
        }]
      }
		});

      // if route doesn't exist, redirect home
      $urlRouterProvider.otherwise('home');
    }])

// Posts Factory
.factory('posts', ['$http', function($http) {
	var object = {
		posts: []
	};

  // GET all posts 
	object.getAll = function() {
		return $http.get('/posts').success(function(data) {

      // makes a copy of data 
			angular.copy(data, object.posts);
		});
	};
  
  // CREATE a post and push the data to DB on success
  object.create = function(post) {
  	return $http.post('posts', post).success(function(data) {
  		object.posts.push(data);
  	});
  };
 
  // When upvoted, update post
  object.upvote = function(post) {
  	return $http.put('/posts/' + post._id + '/upvote')
  	  .success(function(data) {
  	  	post.upvotes += 1;
  	  });
  };
  
  // SHOW one post by id, then return the responded data
  object.get = function(id) {
  	return $http.get('/posts/' + id).then(function(res) {
  		return res.data;
  	});
  };

  // POST a comment to the database
  object.addComment = function(id, comment) {
  	return $http.post('/posts/' + id + '/comments', comment);
  };
  
  // UPDATE a posts upvotes
  object.upvoteComment = function(post, comment) {
  	console.log('inside upvoteComment');
  	return $http.put('/posts/' + post._id + '/comments/'+ comment._id + '/upvote')
  	.success(function(data) {
  		comment.upvotes += 1;
  	});
  };
	return object;
}])

// Main controller
.controller('MainController', [
	'$scope', 
	'posts',
	function($scope, posts) {
		$scope.test = 'Hello world!',
		$scope.posts = posts.posts;
    
    // add Post and check if there is anything inputed 
		$scope.addPost = function() {
			if (!$scope.title || $scope.title === '') { return; }
			posts.create({
				title: $scope.title,
				link: $scope.link,
			});
			$scope.title = '';
			$scope.link = '';
		};

 		// Adds upvotes on click 
 		$scope.incrementUpvotes = function(post) {
 			posts.upvote(post);
 		};

 	}])


// POSTS CONTROLLER
.controller('PostsController', [
	'$scope',
	'posts',
	'post',
	function($scope, posts, post) {
		$scope.post = post;

    // adds comments from form
    $scope.addComment = function() {
    	if ($scope.body === '') { return; }
    	posts.addComment(post._id, {
    		body: $scope.body,
    		author: 'user',
    	}).success(function(comment){
    		$scope.post.comments.push(comment);
    	});

			// Reset comment body
			$scope.body = "";
		};


    // add upvotes to comment
		$scope.incrementUpvotes = function(comment) {
			console.log('incrementing the upvotes');
			posts.upvoteComment(post, comment);
		};
	}
]);
