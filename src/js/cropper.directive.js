// todo: use image bounds instead of target to restrict the selection.

angular.module('bg.imageCropper')
    .directive('bgImageCropper', [
        '$document', function($document) {

            function controller($scope, $element, $rootScope) {

                // todo: remove listeners on destroy

                var el = $element[0],
                    document = $document[0],
                    canvas = el.querySelector('canvas'),
                    context = canvas.getContext('2d'),
                    reader = new FileReader(),
                    fileInput = el.querySelector('input[type="file"]'),
                    source = el.querySelector('.bgic-source'),
                    selection = source.querySelector('.bgic-selection'),
                    image = source.querySelector('img'),
                    dragging = false,
                    resizing = false,
                    selectionSize = $scope.previewWidth,
                    dragLimits, previewBounds, selectionBounds,
                    startTop, startLeft,
                    startWidth, startHeight,
                    maxSize, resizeDir,
                    startX, startY, scale,
                    listeners = [];

                selection.addEventListener('mousedown', function(e) {

                    selectionBounds = selection.getBoundingClientRect();

                    startTop = selectionBounds.top;
                    startLeft = selectionBounds.left;
                    startX = e.clientX;
                    startY = e.clientY;

                    if(e.target.classList.contains('bgic-handle')) {
                        resizing = true;
                        startHeight = selectionBounds.bottom - selectionBounds.top;
                        startWidth = selectionBounds.right - selectionBounds.left;
                        resizeDir = e.target.dataset.resizeDir;

                        switch(resizeDir) {

                            case 'nw':
                                maxSize = Math.min(selectionBounds.bottom - previewBounds.top + window.scrollY, selectionBounds.right - previewBounds.left + window.scrollX);
                                selection.style.bottom = previewBounds.bottom - selectionBounds.bottom - window.scrollY + 'px';
                                selection.style.right = previewBounds.right - selectionBounds.right - window.scrollX + 'px';
                                selection.style.top = null;
                                selection.style.left = null;
                                $scope.sourceState = 'resizing-nwse';
                                break;
                            case 'ne':
                                maxSize = Math.min(selectionBounds.bottom - previewBounds.top + window.scrollY, previewBounds.right - selectionBounds.left - window.scrollX);
                                selection.style.bottom = previewBounds.bottom - selectionBounds.bottom - window.scrollY + 'px';
                                selection.style.left = window.scrollX + selectionBounds.left - previewBounds.left + 'px';
                                selection.style.top = null;
                                selection.style.right = null;
                                $scope.sourceState = 'resizing-nesw';
                                break;
                            case 'se':
                                maxSize = Math.min(previewBounds.bottom - selectionBounds.top - window.scrollY, previewBounds.right - selectionBounds.left - window.scrollX);
                                selection.style.top = window.scrollY + selectionBounds.top - previewBounds.top + 'px';
                                selection.style.left = window.scrollX + selectionBounds.left - previewBounds.left + 'px';
                                selection.style.bottom = null;
                                selection.style.right = null;
                                $scope.sourceState = 'resizing-nwse';
                                break;
                            case 'sw':
                                maxSize = Math.min(previewBounds.bottom - selectionBounds.top - window.scrollY, selectionBounds.right - previewBounds.left + window.scrollX);
                                selection.style.top = window.scrollY + selectionBounds.top - previewBounds.top + 'px';
                                selection.style.right = previewBounds.right - selectionBounds.right - window.scrollX + 'px';
                                selection.style.bottom = null;
                                selection.style.left = null;
                                $scope.sourceState = 'resizing-nesw';
                                break;
                        }
                    } else {
                        selection.style.top = window.scrollY + selectionBounds.top - previewBounds.top + 'px';
                        selection.style.left = window.scrollX + selectionBounds.left - previewBounds.left + 'px';
                        selection.style.bottom = null;
                        selection.style.right = null;
                        dragLimits = {
                            right: previewBounds.width - selectionBounds.height,
                            bottom: previewBounds.height - selectionBounds.height
                        };
                        dragging = true;
                        $scope.sourceState = 'moving';
                    }

                    $scope.$apply();
                }, true);

                document.addEventListener('mousemove', function(e) {

                    var x, y;
                    if(dragging) {
                        var xDelta = (e.clientX - startX),
                            yDelta = (e.clientY - startY);

                        x = Math.min(dragLimits.right, Math.max(0, startLeft + xDelta + window.scrollX - previewBounds.left));
                        y = Math.min(dragLimits.bottom, Math.max(0, startTop + yDelta + window.scrollY - previewBounds.top));
                        selection.style.top = y + 'px';
                        selection.style.left = x + 'px';
                    } else if(resizing) {

                        var widthDelta = e.clientX - startX,
                            heightDelta = e.clientY - startY,
                            width, height;

                        switch(resizeDir) {
                            case 'nw':
                                width = startWidth - widthDelta;
                                height = startHeight - heightDelta;
                                break;
                            case 'ne':
                                width = startWidth + widthDelta;
                                height = startHeight - heightDelta;
                                break;
                            case 'se':
                                width = startWidth + widthDelta;
                                height = startHeight + heightDelta;
                                break;
                            case 'sw':
                                width = startWidth - widthDelta;
                                height = startHeight + heightDelta;
                                break;
                        }
                        selectionSize = Math.min(maxSize, Math.max(width, height));
                        selection.style.width = selectionSize + 'px';
                        selection.style.height = selectionSize + 'px';
                        selectionBounds = selection.getBoundingClientRect();

                        x = window.scrollX + selectionBounds.left - previewBounds.left;
                        y = window.scrollY + selectionBounds.top - previewBounds.top;
                    }

                    if(dragging || resizing) {
                        context.clearRect(0, 0, $scope.previewHeight, $scope.previewWidth);
                        context.drawImage(image, x / scale, y / scale, selectionSize / scale, selectionSize / scale, 0, 0, $scope.previewHeight, $scope.previewWidth);
                    }
                }, true);

                document.addEventListener('mouseup', function(e) {
                    dragging = false;
                    resizing = false;
                    $scope.sourceState = '';
                    $scope.$apply();
                }, true);

                image.addEventListener('load', function() {

                    context.clearRect(0, 0, canvas.width, canvas.height);
                    context.drawImage(image, 0, 0, image.width, image.height, 0, 0, image.width, image.height);
                    previewBounds = source.getBoundingClientRect();
                    scale = image.height / image.naturalHeight;
                    selectionSize = $scope.previewWidth * scale;
                    selection.style.top = '0';
                    selection.style.left = '0';
                    selection.style.bottom = null;
                    selection.style.right = null;
                    selection.style.width = selectionSize + 'px';
                    selection.style.height = selectionSize + 'px';

                    selectionBounds = selection.getBoundingClientRect();
                }, true);

                reader.addEventListener('load', function(event) {

                    //image.src = event.target.result;
                    $scope.src = event.target.result;
                    $scope.$apply();
                }, true);

                fileInput.addEventListener('change', function(event) {

                    var file = event.target.files[0];

                    if(file) {
                        $scope.filename = file.name;
                        reader.readAsDataURL(file);
                        $scope.$apply();
                    }
                }, true);

                source.addEventListener('dragover', function(e) {
                    e.preventDefault();
                }, true);

                source.addEventListener('drop', function(e) {

                    e.preventDefault();
                    var file = e.dataTransfer.files[0];

                    if(file) {
                        $scope.filename = file.name;
                        reader.readAsDataURL(file);
                        $scope.$apply();
                    }
                }, true);

                $scope.savePic = function(callbackId) {
                    canvas.toBlob(function(blob) {

                        var pic = {
                            contents: blob,
                            filename: $scope.filename
                        };

                        $scope.pic = pic;
                        if(angular.isDefined(callbackId)) {
                            $rootScope.$emit('bgic.captured', callbackId, pic);
                        }
                    });
                };

                listeners.push($rootScope.$on('bgic.clear', function() {

                    delete $scope.src;
                    delete $scope.filename;
                    context.clearRect(0, 0, $scope.previewHeight, $scope.previewWidth);
                }));

                listeners.push($rootScope.$on('bgic.load', function(e, src) {

                    $scope.src = src;
                }));

                listeners.push($rootScope.$on('bgic.choose', function() {

                    // todo: add support for MouseEvent since this way is deprecated but it's the one supported  in IE
                    var event = document.createEvent("MouseEvents");
                    event.initMouseEvent("click");
                    fileInput.dispatchEvent(event);

                }));

                listeners.push($rootScope.$on('bgic.capture', function(e, callbackId) {

                    $scope.savePic(callbackId);
                }));

                $scope.$on('$destroy', function() {

                    listeners.forEach(function(listener) {
                        listener();
                    });
                });
            }

            return {
                scope: {
                    previewWidth: "@bgicPreviewWidth",
                    previewHeight: "@bgicPreviewHeight",
                    src: "@bgicDefaultSrc",
                    previewRounded: "@bgicPreviewRounded",
                    pic: "=ngModel"
                },
                restrict: 'E',
                templateUrl: '/templates/cropper.html',
                controller: ['$scope', '$element', '$rootScope', controller]
            };
        }
    ]);
