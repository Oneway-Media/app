angular.module('app.controllers', [])

//  Overcome view cache
//    $scope.$on('$ionicView.enter', function (e) {
//        
//    });

.filter('toDate', function () {
    return function(input) {
        var date = new Date(input.replace(/-/g,"/"));
        return ('0' + date.getDate()).slice(-2)+'-'
            + ('0' + (date.getMonth()+1)).slice(-2)+'-'
            + date.getFullYear();
    };
})

.filter('numberToMinute', function () {
    return function(input) {
        
        if(input == '∞') {
            return '∞';
        } else if(input != 0) {
            var sec_num = parseInt(input, 10); // don't forget the second param
            var hours   = Math.floor(sec_num / 3600);
            var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
            var seconds = sec_num - (hours * 3600) - (minutes * 60);

            if (hours   < 10) {hours   = "0"+hours;}
            if (minutes < 10) {minutes = "0"+minutes;}
            if (seconds < 10) {seconds = "0"+seconds;}
            var time    = hours != '00' ? hours+':'+minutes+':'+seconds: minutes+':'+seconds;
            return time;
        } else {
            return '--:--';
        }
    };
})

.filter('clipText', function () {
    return function(input, max) {
        var max = parseInt(max) || 70;
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
            navFactory, audioService, newsService, pluginAPI) {
    
    
    
    
    
    
    
    
    
    
    
    $rootScope.no_mark = function (str) {
		str= str.toLowerCase(); 
		str= str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g,"a"); 
		str= str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g,"e"); 
		str= str.replace(/ì|í|ị|ỉ|ĩ/g,"i"); 
		str= str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g,"o"); 
		str= str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g,"u"); 
		str= str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g,"y"); 
		str= str.replace(/đ/g,"d");
		str= str.replace(/\!|\@|\%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|\,|\:|\;|\'|\"|\&|\#|\[|\]|\~|\$|\_|\||\-/g," ");
		return str;
	}
    
    
    
    
    
    
    
    
    
    
    
    /*
    *   NAVIGATION
    */
    $rootScope.nav = navFactory;
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    /*
    *   AUDIO
    */
        
    $rootScope.audio = {
        
        init: function (pure) {
            
            // Player    
            audioService.initPlayer(function (player, data) {

                $rootScope.audio.RADIO = data;

                if(!$rootScope.player) {
                    $rootScope.player = player; 

                    if( $rootScope.settings.radioAutoplay ) {
                        
                        $ionicPopup.alert({
                            okType: 'button-balanced',
                            title: 'Radio trực tuyến',
                            template: 'Radio trực tuyến tự động phát. Thay đổi ở phần thiết lập.'
                        });
                        
                        $rootScope.player.audio.togglePlay();
                    }


                    return true; 
                }

                if( $rootScope.player && $rootScope.player.playlist[$rootScope.player.indexing].slug == 'oneway-radio-truc-tuyen' ) {

                    $ionicPopup.confirm({
                        okType: 'button-balanced',
                        title: 'Làm tươi Radio Trực tuyến?',
                        template: 'Sẽ khởi động lại Radio trực tuyến?'
                    }).then(function(res) {
                        if(res) {

                            $rootScope.player.audio.stop();                    
                            $rootScope.player = player;
                            //$rootScope.player.audio.togglePlay();
                            return true; 
                        }

                        return false;
                    });
                }
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
            }, 2000);
            
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
                    okType: 'button-balanced',
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
                    okType: 'button-balanced',
                    title: 'Lỗi!',
                    template: 'Không thể tải được dữ liệu!'
                }).then(function () {
                    $rootScope.$broadcast('scroll.infiniteScrollComplete');
                });
            });

        },

        canBeMore: function (slug) {
            var audio = $rootScope.audio;
            
            if(!audio.categories) {
                return true;
            }
            
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
                    okType: 'button-balanced',
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
                okType: 'button-balanced',
                title: 'Tải lại dữ liệu?',
                subTitle: category.title,
                template: 'Tải lại dữ liệu đang lưu trên thiết bị?',
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
                            okType: 'button-balanced',
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
                    { text: 'Nghe trực tiếp' },
                    { text: 'Chia sẻ' },
                    { text: 'Thêm vào Playlist' },                    
                    { text: 'Nghe sau' }
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
                        
                        if($rootScope.bookmark) {
                            audioService.item(id, function (data) {
                                var item = data[0];
                                $rootScope.bookmark.set('audio', {
                                    id: item.id,
                                    title: item.title,
                                    thumbnail: item.thumbnail
                                }, function () {
                                    $ionicPopup.alert({
                                        title: 'OK!',
                                        template: 'Đánh dấu thành công!'
                                    });
                                });
                            });
                        }
                        
                    }
                    return true;
                }
            });
        },

        playThis: function (id) {
            audioService.item(id, function (data) {
                $rootScope.player.play(data);
                
                $rootScope.history.set('audio', {id: data[0].id, title: data[0].title});
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
                
                $rootScope.history.set('audio', {id: data[0].id, title: data[0].title});
            });
        },

        shareThis: function (id) {

            audioService.item(id, function (data) {
                var item = data[0];

                pluginAPI.social.share({
                    content: '[Oneway Radio] ' + item.title,
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
    
    $rootScope.news = {
        
        newest: {},
        
        init: function () {
            
            // Categories
            newsService.categories(function (categories) {
                $rootScope.news.categories = _.sortByOrder(categories, function (i) {
                    i.search = i.slug.replace(/-/gi, ' ');
                    i.loaded = 0;
                    return parseInt(i.count);
                }, 'desc');
                


                // Get the newest
                for(var i = 0; i < categories.length; i++) {
                    newsService.load(categories[i].slug, true, function (data, slug) {
                        $rootScope.news.newest[slug] = data;
                    }, 6);                    
                }
                
            });
            
            //
            setTimeout(function () {
                $rootScope.$broadcast('scroll.refreshComplete');
            }, 2000);
            
            
        },
        
        category: function (slug, success) {
            var news = $rootScope.news;
            if(news.categories !== undefined && news.categories.length > 0) {
                for(var i = 0; i < news.categories.length; i++) {
                    if(news.categories[i].slug === slug) {
                        success(news.categories[i]);
                    }
                }
            } else {
                newsService.category(slug, function (data) { // Get category
                    data[0].loaded = 0;
                    success(data[0]);
                });
            }
        },
        
        load: function (slug, refresh) {

            var refresh = refresh || false,
                news = $rootScope.news;

            newsService.load(slug, refresh, function (data) { // Load items                
                news[slug] = data; $rootScope.$broadcast('scroll.refreshComplete');

                for(var i = 0; i < news.categories.length; i++) {
                    if(news.categories[i].slug === slug) {
                        news.categories[i].loaded = data.length;
                    }
                }

                if(!$rootScope.$$phase) {
                    $rootScope.$digest();
                }
            }, false, function () { // Timeout or Request fails
                $rootScope.$broadcast('scroll.refreshComplete');
                $ionicPopup.alert({
                    okType: 'button-balanced',
                    title: 'Lỗi!',
                    template: 'Không thể tải được dữ liệu!'
                });
            });
        },       
        

        loadMore: function (slug) {

            var news = $rootScope.news,
                indexed = -1;
            for(var i = 0; i < news.categories.length; i++) {
                if(news.categories[i].slug === slug) { indexed = i; }
            }

            if(indexed === -1 || news[slug] === undefined) {
                return false;
            }

            var page = Math.ceil(news.categories[indexed].loaded / 30) + 1;            

            newsService.more(slug, page, function (data) {
                news[slug] = news[slug].concat(data);                
                news.categories[indexed].loaded = news[slug].length;                
                $rootScope.$broadcast('scroll.infiniteScrollComplete');                
            }, function () { // Timeout or Request fails                
                $rootScope.nav.toTop();
                $ionicPopup.alert({
                    okType: 'button-balanced',
                    title: 'Lỗi!',
                    template: 'Không thể tải được dữ liệu!'
                }).then(function () {
                    $rootScope.$broadcast('scroll.infiniteScrollComplete');
                });
            });

        },

        canBeMore: function (slug) {
            var news = $rootScope.news;
            
            if(!news.categories) {
                return true;
            }
            
            for(var i = 0; i < news.categories.length; i++) {
                if(news.categories[i].slug === slug && news.categories[i].count > news.categories[i].loaded) {
                    return true;
                }
            }
            return false;
        },

        viewThis: function (id) {
            newsService.item(id, function (data) {                
                $rootScope.news.view.self = data[0]; 
                setTimeout(function () {
                    $rootScope.news.view.ready = true; $rootScope.$digest();
                }, 500);
                
                $rootScope.history.set('news', {id: data[0].id, title: data[0].title});

            }, function () {
                $ionicPopup.alert({
                    okType: 'button-balanced',
                    title: 'Lỗi!',
                    template: 'Không thể tải được dữ liệu!'
                });
            });
            return true;
        },
        
        
        resetList: function (slug) {
            var news = $rootScope.news,
                indexed = -1;
            for(var i = 0; i < news.categories.length; i++) {
                if(news.categories[i].slug === slug) { indexed = i; }
            }

            if(indexed === -1 || news[slug] === undefined) {
                return false;
            }

            var category = news.categories[indexed];

            $ionicPopup.confirm({
                okType: 'button-balanced',
                title: 'Tải lại dữ liệu?',
                subTitle: category.title,
                template: 'Tải lại dữ liệu đang lưu trên thiết bị?',
                cancelText: 'Hủy',
                okText: 'Reset',
                okType: 'button-assertive',
            }).then(function(res) {
                if(res) {
                    $rootScope.nav.toTop(); // Scroll top                    
                    newsService.reset(category.slug, function (data) {
                        news[category.slug] = data;                        
                        news.categories[indexed].loaded = data.length;
                    }, function () {
                        $ionicPopup.alert({
                            okType: 'button-balanced',
                            title: 'Lỗi!',
                            template: 'Không thể tải được dữ liệu!'
                        });
                    });                        
                }
            });
        },
        
        moreActions: function (id) {
            var news = this;

            $ionicActionSheet.show({
                buttons: [
                    { text: 'Chia sẻ' },                   
                    { text: 'Đọc sau' }
                ],
                cancelText: 'Đóng',
                buttonClicked: function(index) {
                    if(index === 0) {
                        news.shareThis(id);
                    }
                    if(index === 1) {
                        
                        if($rootScope.bookmark) {
                            newsService.item(id, function (data) {
                                var item = data[0];
                                $rootScope.bookmark.set('news', {
                                    id: item.id,
                                    title: item.title,
                                    thumbnail: item.thumbnail
                                }, function () {
                                    $ionicPopup.alert({
                                        title: 'OK!',
                                        template: 'Đánh dấu thành công!'
                                    });
                                });
                            });
                        }
                        
                    }
                    
                    return true;
                }
            });
        },
        
        shareThis: function (id) {
            
            newsService.item(id, function (data) {
                var item = data[0];

                pluginAPI.social.share({
                    content: '[Oneway Tin tức] ' + item.title,
                    subject: item.title,
                    image: item.cover != null ? item.cover : item.thumbnail,
                    link: item.permalink
                });
            });

        } 
        
        
    };
    
    
    
    
    // View news Content
    $ionicModal.fromTemplateUrl('templates/news/view-this-modal.html', {
        scope: $rootScope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $rootScope.news.openViewThisModal = function (id) {
            $rootScope.news.view = {};
            if( $rootScope.news.viewThis(id) ) {
                modal.show();
            } else {
                console.log('Load data fail!');
            }
        };
        $rootScope.news.closeViewThisModal = function () {
            $rootScope.news.view.ready = false;
            modal.hide();
        };
        $rootScope.$on('$destroy', function () {
            modal.remove();
        });
    });
    
    
    
    
    $rootScope.news.init();
    
            
    
})













.controller('HomeCtrl', function ($scope) { // console.log('Home Controller ...');
    

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
            okType: 'button-balanced',
            title: 'Don\'t eat that!',
            template: 'It might taste good'
        }).then(function (res) {
            console.log('Thank you for not eating my delicious ice cream cone');
        });
    };

})








.controller('HistoryCtrl', function ($scope, $ionicPopup, historyFactory) { // console.log('Setting Controller ...');
    
    
    
    $scope.currentHistory = 'audio';
    
    $scope.switchHistory = function (which) {
        
        if(which !== 'audio' && which !== 'news') {
            return false;
        }
        
        var thisHistory = $scope.history.get(which),
            aDay = 86400000;

        $scope.thisHistory = [];

        for(var key in thisHistory) {
            
            var today = (JSON.parse(JSON.stringify(new Date()))).substr(0,10),
                date = '';
            
            if(Date.parse(key) === Date.parse(today)) {
                date = 'Hôm nay';
            } else if( ( Date.parse(today) - Date.parse(key) ) <= aDay*2 ) {
                date = 'Hôm qua';
            } else {
                date = 'Ngày ' + key.substr(8,2) + ' tháng ' + key.substr(5, 2) + ' năm ' + key.substr(0,4);
            }
            
            
            $scope.thisHistory.push({
                date: date,
                rawDate: key,
                data: _.sortByOrder(thisHistory[key], function (i) {
                    i.search = $scope.no_mark(i.title);
                    return Date.parse(i.time);
                }, 'desc')
            });
        }

        // Sort
        $scope.thisHistory  = _.sortByOrder($scope.thisHistory, function (i) {
            return Date.parse(i.rawDate);
        }, 'desc');
        
        $scope.currentHistory = which;

        // console.log($scope.thisHistory, today);
    };
    
    $scope.clearHistory = function () {
        
        var text = $scope.currentHistory !== 'news' ? 'Audio': 'Tin tức';
        
        $ionicPopup.confirm({
            okType: 'button-assertive',
            okText: 'Xóa',
            cancelText: 'Không',
            title: 'Xóa lịch sử ' + text + '?',
            template: 'Bạn có chắc muốn xóa lịch sử ' + text + '?'
        }).then(function(res) {
            if(res) {

                $scope.history.delete($scope.currentHistory);
                $scope.thisHistory = [];
                return true; 
            }

            return false;
        });
        
    };    
    
    $scope.viewThisHistory = function (id) {
        if($scope.currentHistory === 'news') {
            $scope.news.openViewThisModal(id);
        } else {
            $scope.audio.openViewThisModal(id);
        }
    };
    
    
    $scope.$on('$ionicView.enter', function (e) {    
        $scope.switchHistory('audio');    
    });
    
    
})



.controller('BookmarkCtrl', function ($scope, $ionicPopup, bookmarkFactory) {
    
    
    
    $scope.currentBookmark = 'audio';
    
    
    
    $scope.switchBookmark = function (which) {
        
        if(which !== 'audio' && which !== 'news') {
            return false;
        }
        
        var thisBookmark = $scope.bookmark.get(which),
            aDay = 86400000;

        $scope.thisBookmark = [];

        for(var key in thisBookmark) {
            
            var bookmark = thisBookmark[key],
                today = (JSON.parse(JSON.stringify(new Date()))).substr(0,10),
                date = '';
            
            if(Date.parse(bookmark.time.substr(0, 10)) === Date.parse(today)) {
                date = 'Hôm nay';
            } else if( ( Date.parse(today) - Date.parse(bookmark.time.substr(0, 10)) ) <= aDay*2 ) {
                date = 'Hôm qua';
            } else {
                date = 'Ngày ' + bookmark.time.substr(8,2) + ' tháng ' + bookmark.time.substr(5, 2) + ' năm ' + bookmark.time.substr(0,4);
            }
            
            bookmark.date = date;
            
            $scope.thisBookmark.push(bookmark);
        }

        // Sort
        $scope.thisBookmark  = _.sortByOrder($scope.thisBookmark, function (i) {
            i.search = $scope.no_mark(i.title);
            return Date.parse(i.time);
        }, 'desc');
        
        $scope.currentBookmark = which;
        
    };
    
    
    $scope.clearBookmark = function () {
        
        var text = $scope.currentBookmark !== 'news' ? 'Audio': 'Tin tức';
        
        $ionicPopup.confirm({
            okType: 'button-assertive',
            okText: 'Xóa',
            cancelText: 'Không',
            title: 'Xóa tất cả đánh dấu ' + text + '?',
            template: 'Bạn có chắc muốn xóa tất cả đánh dấu ' + text + '?'
        }).then(function(res) {
            if(res) {

                $scope.bookmark.delete($scope.currentBookmark, false, function () {
                    $scope.thisBookmark = [];
                });
                
                return true; 
            }

            return false;
        });
        
    };
    
    
    $scope.deleteBookmark = function (id) {
        $scope.bookmark.delete($scope.currentBookmark, id, function () {
            for(var i = 0; i < $scope.thisBookmark.length; i++) {
                if($scope.thisBookmark[i].id === id) {
                    $scope.thisBookmark.splice(i, 1);
                }
            }
        });       
    };
    
    
    $scope.viewThisBookmark = function (id) {
        if($scope.currentBookmark === 'news') {
            $scope.news.openViewThisModal(id);
        } else {
            $scope.audio.openViewThisModal(id);
        }
    };
    
    
    $scope.$on('$ionicView.enter', function (e) {
        $scope.switchBookmark('audio');    
    });
    
})



//.controller('TestCtrl', function ($scope) { // console.log('Test Controller ...');
//    
//    $scope.play = function (single) {
//        if( single ) {
//            $scope.player.play([{
//                slug: 'audio-single',
//                title: 'Audio single mp3',
//                thumbnail: 'https://cdn2.iconfinder.com/data/icons/strategy-management/512/competition-128.png',
//                src: 'http://oneway.vn/temp/radio/test-3/audio-3.mp3',
//                content: 'Audio single ... blah blah blah'
//            }]);
//        } else {
//            $scope.player.play([{
//                slug: 'audio-0',
//                title: 'Audio 0 mp3',
//                thumbnail: 'https://cdn3.iconfinder.com/data/icons/photos-icons/128/macro-128.png',
//                src: 'http://oneway.vn/temp/radio/test-3/audio-0.mp3',
//                content: 'Audio 0 ... blah blah blah'
//            },{
//                slug: 'audio-1',
//                title: 'Audio 1 mp3',
//                thumbnail: 'https://cdn0.iconfinder.com/data/icons/kameleon-free-pack-rounded/110/Vector-128.png',
//                src: 'http://oneway.vn/temp/radio/test-3/audio-1.mp3',
//                content: 'Audio 1 ... blah blah blah'
//            },
//            {
//                slug: 'audio-2',
//                title: 'Audio 2 mp3',
//                thumbnail: 'https://cdn2.iconfinder.com/data/icons/strategy-management/512/competition-128.png',
//                src: 'http://oneway.vn/temp/radio/test-3/audio-2.mp3',
//                content: 'Audio 2 ... blah blah blah'
//            }]);
//        }
//    };
//    
//})












/*
*   AUDIO
*/

.controller('AudioHomeCtrl', function ($scope) { // console.log('Audio Home Controller ...');
    $scope.$on('$ionicView.enter', function (e) {
   
        
        
    });
})


.controller('AudioCategoryCtrl', function ($scope, $stateParams) { // console.log('Audio Category Controller ...');

    var slug = $stateParams.slug;
    
    $scope.$on('$ionicView.enter', function (e) {
        
        

        var audio = $scope.audio,
            retry = setInterval(function () {
                if( audio.category !== undefined ) {
                    audio.category(slug, function (data) {

                        $scope.category = data; // This category info
                        audio.load( $scope.category.slug ); // Load audio by category
                    });

                    clearInterval(retry);
                }
            }, 1000);
        
    });
    
    
})















/*
*   NEWS
*/

.controller('NewsHomeCtrl', function ($scope) { // console.log('Audio Home Controller ...');
    
    
    $scope.$on('$ionicView.enter', function (e) {
        
        
        
    });
    
})

.controller('NewsCategoryCtrl', function ($scope, $stateParams) {
    
    var slug = $stateParams.slug;
    
    $scope.$on('$ionicView.enter', function (e) {
        
        
        
        var news = $scope.news,
            retry = setInterval(function () {

                if( news.category !== undefined ) {
                    news.category(slug, function (data) {

                        $scope.category = data; // This category info
                                                
                        news.load( $scope.category.slug ); // Load news by category
                    });

                    clearInterval(retry);
                }
            }, 1000);
        
        
    });
    
});