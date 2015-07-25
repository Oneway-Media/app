angular.module('app.services', [])

// Audio data API
.factory('audioAPI', function ($http) {
    return {
        
        // Audio Categories
        category: function (success, fail) {
            $http.get('http://oneway.vn/api/api-v3/index.php/category').success(function (data) {
                success(_.sortByOrder(data, function (i) {
                    i.search = i.slug.replace(/-/gi, ' ');
                    return parseInt(i.count);
                }, 'desc'));
            }).error(function () {
                fail();
            });
        },
        
        // Online Radio
        radio: function (success, fail) {
            $http.get('http://oneway.vn/api/api-v3/index.php/radio').success(function (data) {
                success(data);
            }).error(function () {
                fail();
            });
        }
    };
})

// News data API
.factory('newsAPI', function ($http) {
    return {
        // News category
        category: function (success, fail) {
            $http.get('http://oneway.vn/api/api-v3/index.php/category-news').success(function (data) {
                success(_.sortByOrder(data, function (i) {
                    i.search = i.slug.replace(/-/gi, ' ');
                    return parseInt(i.count);
                }, 'desc'));
            }).error(function () {
                fail();
            });
        }
    };
})

// Search API
.factory('searchAPI', function ($http) {
    return {
        
    };
})

// Plugin API
.factory('pluginAPI', function () {
    return {        
        // Do something ...
    };
});