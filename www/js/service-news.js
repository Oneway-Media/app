angular.module('service.news', [])

// News data API
.factory('newsFactory', function ($q, $http, cacheFactory) {
    var rootUrl = 'http://oneway.vn/api/api-v3/index.php',
        urls = {
            category: rootUrl+'/category-news'
        };
    return {
        // News category
        categories: function () {
            var deferred = $q.defer(),
                key = 'ow-news-categories',
                cache = cacheFactory.getExpire(key, 5*60000);
            
            if(!cache) { // Not cache or already expired                
                $http.get(urls.category).success(function (dat) {                    
                    var data = cacheFactory.setExpire(key, dat, 'override');                    
                    deferred.resolve(_.sortByOrder(data, function (i) {
                        i.search = i.slug.replace(/-/gi, ' ');
                        return parseInt(i.count);
                    }, 'desc'));
                }).error(function () {
                    deferred.reject();
                });                
            } else { // In Cache
                deferred.resolve(_.sortByOrder(cache, function (i) {
                    i.search = i.slug.replace(/-/gi, ' ');
                    return parseInt(i.count);
                }, 'desc'));
            }
            
            return deferred.promise;
        }
    };
})

.service('newsService', function ($rootScope, newsFactory) {
    function run() {
        
        $rootScope.news = {};
        
        // News Categories
        newsFactory.categories().then(function (data) {
            $rootScope.news.categories = data;
        }, function () {
            console.log('Load data fail!');
        });
    
    }
    
    return {
        run: run
    };
});