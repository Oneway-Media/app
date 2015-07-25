angular.module('app.controllers', [])

//  Overcome view cache
//    $scope.$on('$ionicView.enter', function (e) {
//        
//    });

.controller('AppCtrl', function ($rootScope, $ionicModal, $ionicPopup, $ionicHistory, $state, audioAPI, newsAPI, playerService) { // console.log('App Controller ...');
    
    // Data objects
    $rootScope.audio = {};
    $rootScope.player = {};
    $rootScope.news = {};
    
    
    // Audio categories    
    audioAPI.category(function (data) {
        $rootScope.audio.category = data;
    }, function () {
        console.log('Load data fail!');
    });
    
    // News Categories
    newsAPI.category(function (data) {
        $rootScope.news.category = data;
    }, function () {
        console.log('Load data fail!');
    });
    
    
    // Welcome Modal
    $ionicModal.fromTemplateUrl('templates/welcome-modal.html', {
        scope: $rootScope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $rootScope.welcomeModal = modal;
        if( localStorage.getItem('ow-welcome-off') != 'true' ) {
            $rootScope.welcomeModal.show();            
            localStorage.setItem('ow-welcome-off', 'true');
        }
        $rootScope.openWelcomeModal = function () {
            $rootScope.welcomeModal.show();
        };
        $rootScope.closeWelcomeModal = function () {
            $rootScope.welcomeModal.hide();
        };
        $rootScope.$on('$destroy', function () {
            $rootScope.welcomeModal.remove();
        });
    });
    
    
    
    // Navigation
    $rootScope.nav = {
        goBack: function () {
//            if($ionicHistory.backView() != null) {
//                $ionicHistory.goBack();
//            } else {
//                $state.go('app.home');
//            }
            $ionicHistory.goBack();
        },
        
        goTo: function (name) {
            $state.go(name);
        }
    };
    
    
    /*--------------------------------------------------------------------------------------------------*/
    
    //console.log(playerService);
    var html = {
        player_button_play: '#player_button_play', // Play button 
        
        player_seek_wrapper: '.player_seek_wrapper',
        player_seek_buffered: '.player_seek_buffered',
        player_seek_played: '.player_seek_played',
        player_timing_timer: '.player_timing_timer',
        player_timing_duration: '.player_timing_duration',
        
        player_open_content: '#player_open_content', // More button
        player_content_wrapper: '#player_content_wrapper', // Popup panel
        player_content_text: '#player_content_text', // Text
        player_content_playlist: '#player_content_playlist', // Playlist
        player_content_text_button: '#player_content_text_button', // Text button
        player_content_playlist_button: '#player_content_playlist_button' // Playlist button
    };
    
    audioAPI.radio(function (data) {
        //console.log(data);
        $rootScope.player = playerService.init({
            html: html,
            autoplay: true,
            loop: false,
            initAudio: data
        });
    }, function () {
        console.log('Load data fail!');
    });
    
    
    /*--------------------------------------------------------------------------------------------------*/
    
    /* Searching */
    $rootScope.search = {
        searchString: '',        
        searchResult: [],
        
        openSearchPanel: function () {
            $('#search_panel').fadeIn(250);
        },
    
        closeSearchPanel: function () {
            $('#search_panel').fadeOut(250);
        },
        
        searchInputChange: function (string) {
            console.log('Change: ' + string);
        }
    };
            
    
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

.controller('SearchCtrl', function ($scope) { // console.log('Search Controller ...');
    
//    $scope.$on('$ionicView.enter', function (e) {
//        setTimeout(function () {
//            $('input[type=search]')[0].focus();            
//        }, 1000);
//    });
    
    
    $scope.doSearching = function () {
        console.log($scope.searchString);
    };
    
})

.controller('TestCtrl', function ($scope) { // console.log('Test Controller ...');
    
    
})


/*
*   AUDIO
*/

.controller('AudioHomeCtrl', function ($scope) { // console.log('Audio Home Controller ...');
    
    
});