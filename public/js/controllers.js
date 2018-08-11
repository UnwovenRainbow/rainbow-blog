blogje.controller('navbarCtrl', ['$scope', '$location', function($scope, $location) {
    if ($scope.active === undefined) {
        $scope.active = '/';
    }

    $scope.go = function(path) {
        $scope.active = path;
        $location.path(path);
    };
}]);

blogje.controller('postCtrl', ['$scope', '$http', function($scope, $http) {
    $http.get('/post').then(function(response) {
        $scope.posts = response.data.reverse();
    });
}]);

blogje.controller('quillCtrl', ['$scope', '$http', function($scope, $http) {
    $scope.submit = function() {
        var postObject = {
            title: $scope.blogTitle,
            content: quill.getContents(),
            tags: $scope.blogTags
        };
        console.log('Send this to the backend plox:')
        console.log(JSON.stringify(postObject));
        // send.quillContent => mrdatebase thx bb
        $http.post('/post', postObject).then(function(response) {
            console.log('posted to post', response)
            $scope.submitResponse = response.data;
        });
    };
    $scope.preview = function() {
        console.log('previewed muhahaha');
    }
}]);