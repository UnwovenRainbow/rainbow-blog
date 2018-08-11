var blogje = angular.module('blogje', ['ngRoute']);

blogje.config(function($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: '/views/index.html',
            controller: 'postCtrl',
            // resolve: {
            //   log: function(/*$q*/) {
            //     // var delay = $q.defer();
            //     // $timeout(delay.resolve, 1000);
            //     // return delay.promise;
            //     console.log('routeProvider:', '/')
            //   }
            // }
        })
        .when('/blog', {
            templateUrl: '/views/blog.html'
        })
        .otherwise({
            redirectTo: '/'
        });
});

blogje.directive('quillViewer', function() {
    return function(scope, elements, attrs) {
        let element = elements[0];
        let postTitle = document.createElement('span');
        let postContent = document.createElement('div');
        let postTimestamp = document.createElement('span');

        postTitle.textContent = scope.post.title;
        postTimestamp.textContent = moment(scope.post.timestamp).format('dddd Mo MMMM YYYY [at] HH:MM z');

        element.classList.add('post')
        postTitle.classList.add('post-title')
        postContent.classList.add('post-content')
        postTimestamp.classList.add('post-timestamp')

        element.appendChild(postTitle);
        element.appendChild(postContent);
        element.appendChild(postTimestamp);

        try {
            (new Quill(postContent)).setContents(JSON.parse(scope.post.content));
        } catch (error) {
            postContent.textContent = scope.post.content;
        }
    };
});