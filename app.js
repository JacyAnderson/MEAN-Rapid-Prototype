angular.module('news', ['ui.router'])
.config([
	'$stateProvider',
	'$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {

		$stateProvider
		.state('home', {
			url: '/home',
			templateUrl: '/home.html',
			controller: 'MainController'
		})
		.state('posts', {
			url: '/posts/{id}',
			templateUrl: '/posts.html',
			controller: 'PostsController'
		});

      // if route doesn't exist, redirect home
      $urlRouterProvider.otherwise('home');
    }])

// Posts Factory
.factory('posts', [function() {
	var object = {
		posts: []
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

		$scope.addPost = function() {
			if ($scope.title === '') { return; }
			$scope.posts.push({
				title: $scope.title,
				link: $scope.link,
				upvotes: 0,
				comments: [
				{author: 'Joe', body: 'Cool post!', upvotes: 0},
				{author: 'Bob', body: 'Great idea but everything is wrong!', upvotes: 0}
				]
			});
			$scope.title = '';
			$scope.link = '';
		};

 		// Adds upvotes on click 
 		$scope.incrementUpvotes = function(post) {
 			post.upvotes += 1;
 		};	
 	}])

.controller('PostsController', [
	'$scope',
	'$stateParams',
	'posts',
	function($scope, $stateParams, posts) {
		$scope.post = posts.posts[$stateParams.id];

    // adds comments from form
		$scope.addComment = function() {
			if ($scope.body === '') { return; }
			$scope.post.comments.push({
				body: $scope.body,
				link: 'user',
				upvotes: 0
			});

			// Reset comment body
			$scope.body = "";
		}
	}
]);
