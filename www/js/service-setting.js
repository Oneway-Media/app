angular.module('service.setting', [])

.run(function ($rootScope, $ionicModal, pluginAPI) {
    
    // Network check
    pluginAPI.network.init();
    
    $rootScope.settings = {};
    
    
    
    // Welcome Modal
    $ionicModal.fromTemplateUrl('templates/welcome-modal.html', {
        scope: $rootScope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        if( localStorage.getItem('ow-welcome-off') != 'true' ) {
            modal.show();            
            localStorage.setItem('ow-welcome-off', 'true');
        }
        $rootScope.settings.openWelcomeModal = function () {
            modal.show();
        };
        $rootScope.settings.closeWelcomeModal = function () {
            modal.hide();
        };
        $rootScope.$on('$destroy', function () {
            modal.remove();
        });
    });
    
    
});