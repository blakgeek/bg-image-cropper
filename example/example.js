angular.module('example', ['bg.imageCropper']).controller('ExampleCtrl', function($scope, $http, bgImageCropper) {

    $scope.upload = function() {

        bgImageCropper.captureSelection().then(function(pic) {

            var fd = new FormData();

            if(pic) {
                console.log(pic.filename);
                fd.append('pic', pic.contents, pic.filename);
            }
            fd.append('name', 'A Picture');

            $http.post('/upload', fd);
        });
    };

    $scope.clear = function() {
        bgImageCropper.clearImage();
    };

    $scope.pickIt = function() {
        bgImageCropper.chooseImage();
    }
});
