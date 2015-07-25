angular.module('app.controllers', [])

//  Overcome view cache
//    $scope.$on('$ionicView.enter', function (e) {
//        
//    });

.filter('date', function () {
    return function(input) {
        var date = new Date(input.replace(/-/g,"/"));
        return ('0' + date.getDate()).slice(-2)+'-'
            + ('0' + (date.getMonth()+1)).slice(-2)+'-'
            + date.getFullYear();
    };
})

.filter('clip', function () {
    return function(input) {
        var max = 53;
        if(input.length <= max) {
            return input;
        }
        return input.slice(0, max) + ' ...';
    };
})

.directive('scrollWatch', function() {
    return function(scope, elem, attr) {
        var timer;
        
        elem.bind('scroll', function(e) {
            if(timer) {
                window.clearTimeout(timer);
            }

            timer = window.setTimeout(function() {
                if( e.originalEvent.detail.scrollTop > 1000 ) {
                    $('#scroll-top-button').fadeIn();
                } else {
                    $('#scroll-top-button').fadeOut();
                }                
            }, 100);
            
        });
        
    };
})


.controller('AppCtrl', function (
            $rootScope,
            $ionicPopup,
            $ionicModal,
            $ionicActionSheet,
            navFactory, audioService, newsService, playerService, pluginAPI) {
    
    
    
    
    
    
    
    /*
    *   NAVIGATION
    */
    $rootScope.nav = navFactory;
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    /*
    *   AUDIO
    */
        
    $rootScope.audio = {
        
        init: function () {
            
            // Player    
            audioService.initPlayer(function (player) {
                if( $rootScope.player ) {
                    $rootScope.player.audio.stop();                    
                }
                $rootScope.player = player;
            });

            // TNHN
            audioService.tnhn(function (data) {
                $rootScope.audio.TNHN = data;
            });


            // Init audio
            audioService.categories(function (categories) { // Get categories

                $rootScope.audio.categories = _.sortByOrder(categories, function (i) {
                    i.search = i.slug.replace(/-/gi, ' ');
                    i.loaded = 0;
                    return parseInt(i.count);
                }, 'desc');  

            });
            
            setTimeout(function () {
                $rootScope.$broadcast('scroll.refreshComplete');
            }, 3000);
            
        }, 

        category: function (slug, success) {
                var audio = $rootScope.audio;
                if(audio.categories !== undefined && audio.categories.length > 0) {
                    for(var i = 0; i < audio.categories.length; i++) {
                        if(audio.categories[i].slug === slug) {
                            success(audio.categories[i]);
                        }
                    }
                } else {
                    audioService.category(slug, function (data) { // Get category
                        data[0].loaded = 0;
                        success(data[0]);
                    });
                }
            },

        load: function (slug, refresh) {

            var refresh = refresh || false;

            var audio = $rootScope.audio;

            audioService.load(slug, refresh, function (data) { // Load items                
                audio[slug] = data;

                $rootScope.$broadcast('scroll.refreshComplete');

                for(var i = 0; i < audio.categories.length; i++) {
                    if(audio.categories[i].slug === slug) {
                        audio.categories[i].loaded = data.length;
                    }
                }

                if(!$rootScope.$$phase) {
                    $rootScope.$digest();
                }
            }, function () { // Timeout or Request fails
                $rootScope.$broadcast('scroll.refreshComplete');
                $ionicPopup.alert({
                    title: 'Lỗi!',
                    template: 'Không thể tải được dữ liệu!'
                });
            });
        },

        loadMore: function (slug) {

            var audio = $rootScope.audio,
                indexed = -1;
            for(var i = 0; i < audio.categories.length; i++) {
                if(audio.categories[i].slug === slug) { indexed = i; }
            }

            if(indexed === -1 || audio[slug] === undefined) {
                return false;
            }

            var page = Math.ceil(audio.categories[indexed].loaded / 30) + 1;            

            audioService.more(slug, page, function (data) {
                audio[slug] = audio[slug].concat(data);                
                audio.categories[indexed].loaded = audio[slug].length;                
                $rootScope.$broadcast('scroll.infiniteScrollComplete');                
            }, function () { // Timeout or Request fails                
                $rootScope.nav.toTop();
                $ionicPopup.alert({
                    title: 'Lỗi!',
                    template: 'Không thể tải được dữ liệu!'
                }).then(function () {
                    $rootScope.$broadcast('scroll.infiniteScrollComplete');
                });
            });

        },

        canBeMore: function (slug) {
            var audio = $rootScope.audio;            
            for(var i = 0; i < audio.categories.length; i++) {
                if(audio.categories[i].slug === slug && audio.categories[i].count > audio.categories[i].loaded) {
                    return true;
                }
            }
            return false;
        },

        viewThis: function (id) {
            audioService.item(id, function (data) {                
                $rootScope.audio.view.self = data[0]; 
                setTimeout(function () {
                    $rootScope.audio.view.ready = true; $rootScope.$digest();
                }, 500);

            }, function () {
                $ionicPopup.alert({
                    title: 'Lỗi!',
                    template: 'Không thể tải được dữ liệu!'
                });
            });
            return true;
        },

        resetList: function (slug) {
            var audio = $rootScope.audio,
                indexed = -1;
            for(var i = 0; i < audio.categories.length; i++) {
                if(audio.categories[i].slug === slug) { indexed = i; }
            }

            if(indexed === -1 || audio[slug] === undefined) {
                return false;
            }

            var category = audio.categories[indexed];

            $ionicPopup.confirm({
                title: 'Reset "<strong>' + category.title + '</strong>"?',
                subTitle: category.loaded + '/' + category.count,
                template: 'Reset dữ liệu đang lưu trên thiết bị?',
                cancelText: 'Hủy',
                okText: 'Reset',
                okType: 'button-assertive',
            }).then(function(res) {
                if(res) {
                    $rootScope.nav.toTop(); // Scroll top                    
                    audioService.reset(category.slug, function (data) {
                        audio[category.slug] = data;                        
                        audio.categories[indexed].loaded = data.length;
                    }, function () {
                        $ionicPopup.alert({
                            title: 'Lỗi!',
                            template: 'Không thể tải được dữ liệu!'
                        });
                    });                        
                }
            });
        },

        moreActions: function (id) {
            var audio = this;

            $ionicActionSheet.show({
                buttons: [
                    { text: 'Trình phát mặc định' },
                    { text: 'Chia sẻ' },
                    { text: 'Thêm vào Playlist' },                    
                    { text: 'Đánh dấu' }
                ],
                //destructiveText: 'Delete',
                //titleText: 'Thao tác:',
                cancelText: 'Đóng',
                //cancel: function() {},
                buttonClicked: function(index) {
                    if(index === 0) {
                        audio.playThisRaw(id);
                    }
                    if(index === 1) {
                        audio.shareThis(id);
                    }
                    if(index === 2) {
                        console.log(index);
                    }
                    if(index === 3) {
                        console.log(index);
                    }
                    return true;
                }
            });
        },

        playThis: function (id) {
            audioService.item(id, function (data) {
                $rootScope.player.play(data);
            });
        },

        playThisRaw: function (id) {
            audioService.item(id, function (data) {                
                pluginAPI.media.audio(data[0].src, {
                    bgColor: "#FFFFFF",
                    bgImage: data[0].cover != null ? data[0].cover : data[0].thumbnail,
                    bgImageScale: "fit",
                    successCallback: function() { return true; },
                    errorCallback: function(errMsg) { return false; }
                });                
            });
        },

        shareThis: function (id) {

            audioService.item(id, function (data) {
                var item = data[0];

                pluginAPI.social.share({
                    content: item.title,
                    subject: item.title,
                    image: item.cover != null ? item.cover : item.thumbnail,
                    link: item.permalink
                });
            });

        }  

    };
    
    // View Audio Content
    $ionicModal.fromTemplateUrl('templates/audio/view-this-modal.html', {
        scope: $rootScope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $rootScope.audio.openViewThisModal = function (id) {
            $rootScope.audio.view = {};
            if( $rootScope.audio.viewThis(id) ) {
                modal.show();
            } else {
                console.log('Load data fail!');
            }
        };
        $rootScope.audio.closeViewThisModal = function () {
            $rootScope.audio.view.ready = false;
            modal.hide();
        };
        $rootScope.$on('$destroy', function () {
            modal.remove();
        });
    });
    
    
    $rootScope.audio.init();
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    /*
    *   NEWS
    */
    
    $rootScope.news = {};
    
    
    
    
    
    
            
    
})


.controller('HomeCtrl', function ($scope) { // console.log('Home Controller ...');
    

})

.controller('SettingCtrl', function ($scope) { // console.log('Setting Controller ...');
    

})


.controller('HelpCtrl', function ($scope, $ionicModal, $ionicPopup) { // console.log('Help Controller ...');
    
    // About Modal
    $ionicModal.fromTemplateUrl('templates/about-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.aboutModal = modal;
        $scope.openAboutModal = function () {
            $scope.aboutModal.show();
        };
        $scope.closeAboutModal = function () {
            $scope.aboutModal.hide();
        };
        $scope.$on('$destroy', function () {
            $scope.aboutModal.remove();
        });
    });
    
    // Record Popup
    $scope.openRecordPopup = function () {
        $ionicPopup.alert({
            title: 'Don\'t eat that!',
            template: 'It might taste good'
        }).then(function (res) {
            console.log('Thank you for not eating my delicious ice cream cone');
        });
    };

})


.controller('TestCtrl', function ($scope) { // console.log('Test Controller ...');
    
    $scope.play = function (single) {
        if( single ) {
            $scope.player.play([{
                slug: 'audio-single',
                title: 'Audio single mp3',
                thumbnail: 'https://cdn2.iconfinder.com/data/icons/strategy-management/512/competition-128.png',
                src: 'http://oneway.vn/temp/radio/test-3/audio-3.mp3',
                content: 'Audio single ... blah blah blah'
            }]);
        } else {
            $scope.player.play([{
                slug: 'audio-0',
                title: 'Audio 0 mp3',
                thumbnail: 'https://cdn3.iconfinder.com/data/icons/photos-icons/128/macro-128.png',
                src: 'http://oneway.vn/temp/radio/test-3/audio-0.mp3',
                content: 'Audio 0 ... blah blah blah'
            },{
                slug: 'audio-1',
                title: 'Audio 1 mp3',
                thumbnail: 'https://cdn0.iconfinder.com/data/icons/kameleon-free-pack-rounded/110/Vector-128.png',
                src: 'http://oneway.vn/temp/radio/test-3/audio-1.mp3',
                content: 'Audio 1 ... blah blah blah'
            },
            {
                slug: 'audio-2',
                title: 'Audio 2 mp3',
                thumbnail: 'https://cdn2.iconfinder.com/data/icons/strategy-management/512/competition-128.png',
                src: 'http://oneway.vn/temp/radio/test-3/audio-2.mp3',
                content: 'Audio 2 ... blah blah blah'
            }]);
        }
    };
    
})


/*
*   AUDIO
*/

.controller('AudioHomeCtrl', function ($scope) { // console.log('Audio Home Controller ...');
    $scope.$on('$ionicView.enter', function (e) {
        
        if($scope.search) {
            $scope.search.criteria.type = 'audio';
            $scope.search.criteria.category = null;
        }
        
    });
})


.controller('AudioCategoryCtrl', function ($scope, $stateParams) { // console.log('Audio Category Controller ...');

    $scope.$on('$ionicView.enter', function (e) {
        
        if($scope.search) {
            $scope.search.criteria.type = 'audio';
            $scope.search.criteria.category = $stateParams.slug;
        }
        
    });
    
    
//$scope.$on('$ionicView.enter', function (e) {

    var audio = $scope.audio;

    var retry = setInterval(function () {
        if( audio.category !== undefined ) {
            audio.category($stateParams.slug, function (data) {
                
                $scope.category = data; // This category info
                audio.load( $scope.category.slug ); // Load audio by category
            });

            clearInterval(retry);
        }
    }, 1000);


//});
    
    
})



/*
*   NEWS
*/

.controller('NewsHomeCtrl', function ($scope) { // console.log('Audio Home Controller ...');
    $scope.$on('$ionicView.enter', function (e) {
        
        
        if($scope.search) {
            $scope.search.criteria.type = 'news';
            $scope.search.criteria.category = null;
        }
        
        
    });
})

.controller('NewsCategoryCtrl', function ($scope, $stateParams) {
    
    $scope.$on('$ionicView.enter', function (e) {
        
        if($scope.search) {
            $scope.search.criteria.type = 'news';
            $scope.search.criteria.category = $stateParams.slug;
        }
        
    });
    
});