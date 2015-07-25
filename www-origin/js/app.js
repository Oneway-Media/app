// Oneway App
angular.module('app', ['ionic', 'app.controllers', 'app.services', 'app.player'])

.run(function ($ionicPlatform) {
    $ionicPlatform.ready(function () {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
        }
    });
    
    $ionicPlatform.on('offline', function () {
        // Offline
    });
    
})

.config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider

    /*
    * GENERAL
    */
    .state('app', {
        url: "/app",
        abstract: true,
        templateUrl: "templates/menu.html",
        controller: 'AppCtrl'
    })
    
    .state('app.home', {
        url: "/home",
        views: {
            'menuContent': {
                templateUrl: "templates/home.html",
                controller: 'HomeCtrl'
            }
        }
    })

    .state('app.setting', {
        url: "/setting",
        views: {
            'menuContent': {
                templateUrl: "templates/setting.html",
                controller: 'SettingCtrl'
            }
        }
    })

    .state('app.help', {
        url: "/help",
        views: {
            'menuContent': {
                templateUrl: "templates/help.html",
                controller: 'HelpCtrl'
            }
        }
    })


    .state('app.search', {
        url: "/search",
        views: {
            'menuContent': {
                templateUrl: "templates/search.html",
                controller: 'SearchCtrl'
            }
        }
    })

    
    /*
    * AUDIO
    */
    .state('app.audio', {
        url: "/audio",
        views: {
            'menuContent': {
                templateUrl: "templates/audio/index.html",
                controller: 'AudioHomeCtrl'
            }
        }
    })
    
    .state('app.audio-categories', {
        url: "/audio/categories",
        views: {
            'menuContent': {
                templateUrl: "templates/audio/categories.html",
                //controller: 'AudioCategoriesCtrl'
            }
        }
    })
    
    .state('app.audio-category', {
        url: "/audio/category/:slug",
        views: {
            'menuContent': {
                templateUrl: "templates/audio/category.html",
                //controller: 'AudioCategoryCtrl'
            }
        }
    })
    
    .state('app.audio-item', {
        url: "/audio/item/:slug",
        views: {
            'menuContent': {
                templateUrl: "templates/audio/item.html",
                //controller: 'AudioItemCtrl'
            }
        }
    })
    
    .state('app.audio-surprise', {
        url: "/audio/surprise",
        views: {
            'menuContent': {
                templateUrl: "templates/audio/surprise.html",
                //controller: 'AudioSurpriseCtrl'
            }
        }
    })
    
    
    /*
    * NEWS
    */
    .state('app.news', {
        url: "/news",
        views: {
            'menuContent': {
                templateUrl: "templates/news/index.html",
                //controller: 'NewsCtrl'
            }
        }
    })

    
    
    
    
    
    .state('app.test', {
        url: "/test",
        views: {
            'menuContent': {
                templateUrl: "templates/test.html",
                controller: 'TestCtrl'
            }
        }
    });
    
    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/app/home');
});