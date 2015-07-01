angular.module('app.controllers', [])

//  Overcome view cache
//    $scope.$on('$ionicView.enter', function (e) {
//        
//    });

.controller('AppCtrl', function ($rootScope, $ionicModal, $ionicPopup) { // console.log('App Controller ...');
    
    // Sample data
    $rootScope.sampleData = {
        audio: [
            {title: '1'},
            {title: '3'},
            {title: '10'},
            {title: '20'},
            {title: '30'}
        ],
        news: [
            {title: '52'},
            {title: '13'},
            {title: '10'},
            {title: '20'},
            {title: '11'}
        ]
    };
    
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
    
    
    // Alert
    $rootScope.alertMe = function () {
        alert('Hello there!');
    };
    
    // Open Player Content
    $rootScope.openPlayerContent = function () {
        $('#player_content_wrapper').fadeIn(300);
    };
    // ClosePlayer Content
    $rootScope.closePlayerContent = function () {
        $('#player_content_wrapper').fadeOut(300);
    };
    
    // showContentPlaylist()
    $rootScope.showContentPlaylist = function () {
        $('#player_content_text').fadeOut(30);
        $('#player_content_playlist').fadeIn(300);
        
        // Button
        $('#player_content_text_button').removeClass('active activated');
        $('#player_content_playlist_button').addClass('active');
    };
    // showContentText()
    $rootScope.showContentText = function () {
        $('#player_content_playlist').fadeOut(30);
        $('#player_content_text').fadeIn(300);
        
        // Button
        $('#player_content_playlist_button').removeClass('active activated');
        $('#player_content_text_button').addClass('active');
    };
    
})

.controller('FrontCtrl', function ($scope) { // console.log('Front Controller ...');    
    
    

})

.controller('HomeCtrl', function ($scope) { // console.log('Home Controller ...');
    

})

.controller('SettingCtrl', function ($scope, $ionicModal, $ionicPopup) { // console.log('Setting Controller ...');
    
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

});