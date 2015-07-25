angular.module('service.search', [])

.directive('searchPanel', function () {
    return {
        restrict: 'E',
        templateUrl: 'templates/search-panel.html',
        controller: 'SearchCtrl'
    }
})

.controller('SearchCtrl', function ($rootScope, audioService, newsService) {
    
    var timer;
    
    // Searching popup
    $rootScope.search = {
        criteria: {
            type: 'audio',
            category: null
        },

        searchString: '',

        searchResult: [],

        openSearchPanel: function () {
            $('#search_panel').fadeIn(300, function () {
                $(this).find('input')[0].focus();
            });
        },

        closeSearchPanel: function () {
            $('#search_panel').fadeOut(300, function () {
                $(this).find('input')[0].blur();

                // Reset search data                      
                $rootScope.search.searchString = '';
                $rootScope.search.searchResult = [];

            });

        },

        searchInputChange: function (string) {

            var search = $rootScope.search;

            string = string.replace(/\//g, ' '); // Replace /

            if( string.length > 3 ) { // string.slice(-2, -1) === ' '
                
                search.loading = true;
                
                if(timer) {
                    window.clearTimeout(timer);
                }

                timer = window.setTimeout(function() {
                    console.log('Do HTTP request!');                

                    $rootScope.nav.toTop();

                    if(search.criteria.type === 'news' && search.criteria.category === null) {
                        console.log('Search all news!');
                    } else if(search.criteria.type === 'news' && search.criteria.category !== null) {
                        console.log('Search news by category!');
                    } else if(search.criteria.type === 'audio' && search.criteria.category === null) {

                        audioService.search(string, function (data) {
                            search.searchResult = data;
                            search.loading = false;
                        }, false, function () {
                            search.loading = false;
                        });

                    } else if(search.criteria.type === 'audio' && search.criteria.category !== null) {
                        console.log('Search audio by category!');
                        audioService.search(string, function (data) {
                            search.searchResult = data;
                            search.loading = false;
                        }, search.criteria.category, function () {
                            search.loading = false;
                        });
                    } else {
                        return false;
                    }
                    
                }, 2000);

            }
        },

        view: function (id) {
            var search = $rootScope.search;
            if(search.criteria.type === 'audio') {
                $rootScope.audio.openViewThisModal(id);
            } else if(search.criteria.type === 'news') {
                $rootScope.news.openViewThisModal(id);
            } else {
                return false;
            }
        },
        
        loading: false,

    };
            
});