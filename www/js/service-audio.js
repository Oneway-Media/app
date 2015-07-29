angular.module('service.audio', [])

.factory('audioFactory', function ($q, $http, $ionicPopup) {
    
//    var time = 7000;
//    
//    function fail(cb) {
//        $ionicPopup.alert({
//            title: 'Lỗi!',
//            template: 'Có vấn đề về mạng. Vui lòng thử lại sau!'
//        });
//    }
    
    var audio = {
        
        /* PROPERTIES */
        urls: {
            categories: 'http://oneway.vn/api/api-v3/index.php/category',
            category: 'http://oneway.vn/api/api-v3/index.php/category', // /:slug
            radio: 'http://oneway.vn/api/api-v3/index.php/radio',
            list: 'http://oneway.vn/api/api-v3/index.php/audio-category', // /:category-slug/:page (from 1)
            item: 'http://oneway.vn/api/api-v3/index.php/audio-item', // /:id
            tnhn: 'http://oneway.vn/api/api-v3/index.php/audio-category/tinh-nguyen-hang-ngay/1/1',
            search: 'http://oneway.vn/api/api-v3/index.php/search' // /:keyword
        },
        
        /* METHODS */
        radio: function () { // Online Radio
            var deferred = $q.defer();
            
            $http.get(this.urls.radio, { timeout: 30000 }).success(function (data) {
                deferred.resolve(data);
            }).error(function () {
                deferred.reject();
            });
            
            return deferred.promise;
            
        },
        
        categories: function () {
            var deferred = $q.defer();            
            $http.get(this.urls.categories, { timeout: 30000 }).success(function (data) {
                deferred.resolve(data);
            }).error(function () {
                deferred.reject();
            });            
            return deferred.promise;
        },
        
        category: function (slug) {
            var deferred = $q.defer();
            
            $http.get(this.urls.category+'/'+slug, { timeout: 30000 }).success(function (data) {
                deferred.resolve(data);
            }).error(function () {
                deferred.reject();
            });
            
            return deferred.promise;
            
        },
        
        load: function (slug, page) {
            var deferred = $q.defer();
            
            $http.get(this.urls.list+'/'+slug+'/'+page, { timeout: 30000 }).success(function (data) {
                deferred.resolve(data);
            }).error(function () {
                deferred.reject();
            });
            
            return deferred.promise;
        },
        
        item: function (id) {
            var deferred = $q.defer();
            
            $http.get(this.urls.item+'/'+id, { timeout: 30000 }).success(function (data) {
                deferred.resolve(data);
            }).error(function () {
                deferred.reject();
            });
            
            return deferred.promise;
        },
        
        tnhn: function () {
            var deferred = $q.defer();
            
            $http.get(this.urls.tnhn, { timeout: 30000 }).success(function (data) {
                deferred.resolve(data);
            }).error(function () {
                deferred.reject();
            });
            
            return deferred.promise;
        },      
        
        search: function (keyword, category) {
            var deferred = $q.defer(),
                url = '';
            
            if(category) {
                url = this.urls.search + '/' + keyword + '/' + category;
            } else {
                url = this.urls.search + '/' + keyword;
            }
            
            $http.get(url, { timeout: 10000 }).success(function (data) {
                deferred.resolve(data);
            }).error(function () {
                deferred.reject();
            });
            
            return deferred.promise;
        }
        
    };
    
    return audio;
})

.service('audioService', function ($ionicModal, audioFactory, cacheFactory, playerService) {
        
    var limit = 90,
        lifetime = 60000; // 1*60000 = 1 minute => 24*60*60000 = 1 day    
    
    function getRadio(success) {
        var key = 'ow-audio-items',
            target = '0',
            cache = cacheFactory.check({key:key,target:target,lifetime:lifetime});
            
        if(!cache) {
            audioFactory.radio().then(function (data) {
                if(cacheFactory.set({key:key,target:target,value:data,method:'override',limitInKey:limit})) {
                    success(data); 
                }
            });
        } else {
            success( cacheFactory.get({key:key,target:target}) );
        }
    }
    
    function initPlayer(success) {
        
        var html = {
            player_button_play: '#player_button_play', // Play button 

            player_seek_wrapper: '.player_seek_wrapper',
            player_seek_range_major: '#player_seek_range_major',
            player_seek_range_minor: '#player_seek_range_minor',
            
            player_timing_timer: '.player_timing_timer',
            player_timing_duration: '.player_timing_duration',

            player_open_content: '#player_open_content', // More button
            player_content_wrapper: '#player_content_wrapper', // Popup panel
            player_content_text: '#player_content_text', // Text
            player_content_playlist: '#player_content_playlist', // Playlist
            player_content_text_button: '#player_content_text_button', // Text button
            player_content_playlist_button: '#player_content_playlist_button' // Playlist button
        };
        
        getRadio(function (data) {
            var player = playerService.init({
                html: html,
                autoplay: true,
                loop: false,
                initAudio: data
            });
            
            //player.audio.togglePlay();
            
            success(player, data);
        });
    }
    
    function getCategories(success) {
        
        var key = 'ow-audio-lists',
            target = 'categories',
            cache = cacheFactory.check({key:key,target:target,lifetime:lifetime});

        if(!cache) {
            audioFactory.categories().then(function (data) {
                if(cacheFactory.set({key:key,target:target,value:data,method:'override'})) {
                    success(data);   
                }                
            });
        } else {
            success(cacheFactory.get({key:key,target:target}));
        }
        
    }    
    
    function getCategory(slug, success) {
        var key = 'ow-audio-lists',
            target = 'categories',
            cache = cacheFactory.check({key:key,target:target,lifetime:lifetime});
        
        if(!cache) {
            audioFactory.category(slug).then(function (data) {
                success(data[0]);
            });
        } else {                   
            _.forEach( cacheFactory.get({key:key,target:target}), function (i) {
                if(i.slug === slug) {
                    success(i);
                }
            });
        }
    }
        
    function getItem(id, success, fail) {
        var key = 'ow-audio-items',
            target = id,
            cache = cacheFactory.check({key:key,target:target,lifetime:lifetime});

        if(!cache) {
            if(id == 0) {
                getRadio(function (data) {
                    success(data);
                });
            } else {
                audioFactory.item(id).then(function (data) {
                    if(cacheFactory.set({key:key,target:target,value:data,method:'override',limitInKey:limit})) {
                        success(data);   
                    } 
                }, fail);
            }
        } else {              
            success( cacheFactory.get({key:key,target:target}) );
        }
    }
    
    function reset(slug, success, fail) {
        var key = 'ow-audio-lists',
            target = slug,
            method = 'override';            
        
        audioFactory.load(slug, 1).then(function (data) {
            if(cacheFactory.set({key:key,target:target,value:data,method:method})) {
                success( data );   
            }
        }, fail);
    } 
    
    function loadTop(slug, refresh, success, fail) {
        var key = 'ow-audio-lists',
            target = slug,
            method = 'unshift',
            cache = false;
            
        if(!refresh) {
            cache = cacheFactory.check({key:key,target:target,lifetime:lifetime})
        }

        if(!cache) {
            audioFactory.load(slug, 1).then(function (data) {
                if(cacheFactory.set({key:key,target:target,value:data,method:method})) {
                    success( cacheFactory.get({key:key,target:target}) );   
                }
            }, fail);
        } else {               
            success( cacheFactory.get({key:key,target:target}) );
        }
    }    
    
    function loadBottom(slug, page, success, fail) {
        var key = 'ow-audio-lists',
            target = slug,
            method = 'push';
        
        audioFactory.load(slug, page).then(function (data) {
            if(cacheFactory.set({key:key,target:target,value:data,method:method,limitInTarget:300})) {
                success(data);
            }
        }, fail);
    }
    
    function getTNHN(success) {
        audioFactory.tnhn().then(function (data) {
            var id = parseInt(data[0].id);            
            
            var key = 'ow-audio-items',
                target = id,
                cache = cacheFactory.check({key:key,target:target,lifetime:lifetime});

            if(!cache) {
                audioFactory.item(id).then(function (data) {
                    if(cacheFactory.set({key:key,target:target,value:data,method:'override',limitInKey:limit})) {
                        success(data);   
                    } 
                });
            } else {              
                success( cacheFactory.get({key:key,target:target}) );
            }
        });
    }
    
    function search(keyword, success, category, fail) {        
        audioFactory.search(keyword, category).then(function (data) {
            success(data);
        }, fail);
    }
    
    var audioService = {
        
        radio: getRadio,
        
        initPlayer: initPlayer,
        
        categories: getCategories,
        
        category: getCategory,
        
        item: getItem,
        
        reset: reset,
        
        load: loadTop,
        
        more: loadBottom,
        
        tnhn: getTNHN,
        
        search: search
        
    };
    
    return  audioService;    
});