// todo: use image bounds instead of target to restrict the selection.

angular.module('bg.imageCropper')
    .factory('bgImageCropper', [
        '$rootScope', '$q', function($rootScope, $q) {

            var promises = {},
                promiseCtr = 0;

            function loadImage(src) {

                $rootScope.$emit('bgic.load', src);
            }

            function chooseImage() {

                $rootScope.$emit('bgic.choose');
            }

            function clearImage() {

                $rootScope.$emit('bgic.clear');
            }

            function captureSelection() {

                var id = promiseCtr++,
                    deferred = $q.defer();
                promises[id] = deferred;
                $rootScope.$emit('bgic.capture', id);

                return deferred.promise;
            }

            $rootScope.$on('bgic.captured', function(e, id, pic) {

                if(promises[id]) {
                    promises[id].resolve(pic);
                    delete promises[id];
                }
            });

            return {
                loadImage: loadImage,
                clearImage: clearImage,
                chooseImage: chooseImage,
                captureSelection: captureSelection
            };
        }
    ]);
