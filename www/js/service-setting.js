angular.module('service.setting', [])





.factory('historyFactory', function (storageFactory) {
    var historyFactory = {
        get: function (key) {
            var key = 'ow-history-' + key || 'ow-history-audio',
                history = storageFactory.get(key);
            
            if(history === null) {
                return {};
            }
            
            return history;
        },
        
        set: function (key, value, success) {
            var key = 'ow-history-' + key || 'ow-history-audio',
                history = storageFactory.get(key),
                id = value.id,
                title = value.title;
            
            if(history === null) {
                history = {};
                history[id] = {
                    id: id,
                    title: title,
                    viewed: 1,
                    like: false,
                    time: new Date()
                };
                
                if( storageFactory.set(key, history) ) {
                    success( storageFactory.get(key) );
                }
                return true;
            } else {
                
                if(history[id]) {
                    history[id].viewed++;
                    history[id].time = new Date();
                } else {
                    history[id] = {
                        id: id,
                        title: title,
                        viewed: 1,
                        like: false,
                        time: new Date()
                    };
                }
                
                if( storageFactory.set(key, history) ) {
                    success( storageFactory.get(key) );
                }
                return true;
                
            }
            
        },
        
        delete: function (key, success) {
            
            var key = 'ow-history-' + key || 'ow-history-audio',
                history = storageFactory.get(key);
            
            if(history !== null) {
                storageFactory.remove(key);                
                success();
            }
            
        }
    };
    return historyFactory;
})



.factory('bookmarkFactory', function (storageFactory, $ionicPopup) {
    
    var bookmarkFactory = {
        
        get: function (key) {
            var key = 'ow-bookmark-' + key || 'ow-bookmark-audio',
                bookmark = storageFactory.get(key);
            
            if(bookmark === null) {
                return {};
            }
            
            return bookmark;
        },
        
        
        set: function (key, value, success) {
            var key = 'ow-bookmark-' + key || 'ow-bookmark-audio',
                bookmark = storageFactory.get(key),
                id = value.id,
                title = value.title,
                thumbnail = value.thumbnail;
            
            if(bookmark === null) {
                bookmark = {};
                bookmark[id] = {
                    id: id,
                    title: title,
                    thumbnail: thumbnail,
                    time: new Date()
                };
                
                if( storageFactory.set(key, bookmark) ) {
                    success( storageFactory.get(key) );
                    return true;
                }
            } else {
                
                if(bookmark[id]) {
                    bookmark[id].time = new Date();
                    
                    $ionicPopup.alert({
                        title: ':)',
                        template: 'Nội dung này đã có sẵn trong danh sách được đánh dấu!'
                    });
                    
                    return false;
                }
                
                bookmark[id] = {
                    id: id,
                    title: title,
                    thumbnail: thumbnail,
                    time: new Date()
                };
                
                
                if( storageFactory.set(key, bookmark) ) {
                    success( storageFactory.get(key) );
                    return true;
                }
                
            }
            
        },
        
        delete: function (key, id, success) {
            
            var key = 'ow-bookmark-' + key || 'ow-bookmark-audio',
                bookmark = storageFactory.get(key);
            
            if(bookmark === null) {
                return false;
            }
            
            if(!id) {
                
                storageFactory.remove(key);                
                success();
                return true;
                
            } else {
                
                if(!bookmark[id]) {
                    return false;
                }
                
                delete bookmark[id];                
                
                if( storageFactory.set(key, bookmark) ) {
                    success( storageFactory.get(key) );
                    return true;
                }
                
            }
            
        }
        
    };
    
    return bookmarkFactory;
    
})


.service('settingService', function (storageFactory) {
    
    var settingService = {
        
        key: 'ow-settings',
        
        defaults: {
            showWelcome: true,
            radioAutoplay: true
        },
        
        get: function (success) {
            var settings = storageFactory.get(this.key);
            
            if(!settings) {
                settings = this.defaults;
                storageFactory.set(this.key, settings);
            }
            
            success(settings);
            
        },
        
        set: function (key, value, success, fail) {
            var settings = storageFactory.get(this.key);
            
            if(!settings) {
                settings = defaults;
                storageFactory.set(this.key, settings);
                
                success(settings);
            }
            
            if(settings[key] === undefined) {
                fail();
            }
            
            settings[key] = value;
            storageFactory.set(this.key, settings);
            
            success(settings);
            
        }
    };
    
    return settingService;
})

.run(function ($rootScope, $ionicModal, pluginAPI, settingService, historyFactory, bookmarkFactory) {
    
    // Network check
    pluginAPI.network.init();
    
    settingService.get(function (data) {
        $rootScope.settings = data;   
    });
    
    $rootScope.setSettings = function(key, value) {
        settingService.set(key, value, function (data) {
            $rootScope.settings = data;
        }, function () {
            console.log('Set setting fails!');
        });
    };
    
    
    
    
    
    
    // Welcome Modal
    $ionicModal.fromTemplateUrl('templates/welcome-modal.html', {
        scope: $rootScope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        if( $rootScope.settings.showWelcome ) {
            modal.show();
        }
        $rootScope.settings.openWelcomeModal = function () {
            modal.show();
        };
        $rootScope.settings.closeWelcomeModal = function () {
            modal.hide();
            $rootScope.setSettings('showWelcome', false);
        };
        $rootScope.$on('$destroy', function () {
            modal.remove();
        });
    });
    
    
    
    $rootScope.history = {

        audio: historyFactory.get('audio'),

        news: historyFactory.get('news'),        

        get: function (key) {
            var raw = $rootScope.history[key];

            var grouped = _.groupBy(raw, function (i) {
                return i.time.slice(0, 10);
            });

            return grouped;
        },

        set: function (key, value) {
            historyFactory.set(key, value, function (data) {
                $rootScope.history[key] = data;
            });
        },

        delete: function (key) {
            historyFactory.delete(key, function () {
                $rootScope.history[key] = {};
            });
        }

    };
    
    
    
    $rootScope.bookmark = {

        audio: bookmarkFactory.get('audio'),

        news: bookmarkFactory.get('news'),        

        get: function (key) {
            return $rootScope.bookmark[key];
        },

        set: function (key, value, success) {
            bookmarkFactory.set(key, value, function (data) {
                $rootScope.bookmark[key] = data;                
                success();
            });
        },

        delete: function (key, id, success) {
            var id = id || false;

            bookmarkFactory.delete(key, id, function () {
                
                $rootScope.bookmark[key] = bookmarkFactory.get(key);
                
                success();
            });
        }

    };
    
    
});