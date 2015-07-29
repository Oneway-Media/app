angular.module('service.news', [])

// News data API
.factory('newsFactory', function ($q, $http) {
    
    var news = {
        
        /* PROPERTIES */
        urls: {
            categories: 'http://oneway.vn/api/api-v3/index.php/category-news',
            category: 'http://oneway.vn/api/api-v3/index.php/category-news', // /:slug
            list: 'http://oneway.vn/api/api-v3/index.php/news-category', // /:category-slug/:page (from 1)
            item: 'http://oneway.vn/api/api-v3/index.php/news-item', // /:id
            search: 'http://oneway.vn/api/api-v3/index.php/search-news' // /:keyword
        },
        
        /* METHODS */
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
        
        load: function (slug, page, limit) {
            var deferred = $q.defer(),
                limit = limit || 30;
            
            $http.get(this.urls.list + '/' + slug + '/' + page + '/' + limit, { timeout: 30000 }).success(function (data) {
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
    
    
    return news;
    
})

.service('newsService', function ($rootScope, newsFactory, cacheFactory) {
    
    var limit = 30,
        lifetime = 60000; // 1*60000 = 1 minute => 24*60*60000 = 1 day 
    
    
    function getCategories(success, fail) {
        var key = 'ow-news-lists',
            target = 'categories',
            cache = cacheFactory.check({key:key,target:target,lifetime:lifetime});

        if(!cache) {
            newsFactory.categories().then(function (data) {
                if(cacheFactory.set({key:key,target:target,value:data,method:'override'})) {
                    success(data);   
                }                
            }, fail);
        } else {
            success(cacheFactory.get({key:key,target:target}));
        }
    }
    
    
    function getCategory(slug, success) {
        var key = 'ow-news-lists',
            target = 'categories',
            cache = cacheFactory.check({key:key,target:target,lifetime:lifetime});
        
        if(!cache) {
            newsFactory.category(slug).then(function (data) {
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
        var key = 'ow-news-items',
            target = id,
            cache = cacheFactory.check({key:key,target:target,lifetime:lifetime});

        if(!cache) {
            newsFactory.item(id).then(function (data) {
                if(cacheFactory.set({key:key,target:target,value:data,method:'override',limitInKey:limit})) {
                    success(data);   
                } 
            }, fail);
        } else {              
            success( cacheFactory.get({key:key,target:target}) );
        }
    }
    
    function reset(slug, success, fail) {
        var key = 'ow-news-lists',
            target = slug,
            method = 'override';            
        
        newsFactory.load(slug, 1).then(function (data) {
            if(cacheFactory.set({key:key,target:target,value:data,method:method})) {
                success( data );   
            }
        }, fail);
    } 
    
    
    function loadTop(slug, refresh, success, limit, fail) {
        var key = 'ow-news-lists',
            target = slug,
            method = 'unshift',
            limit = limit || false,
            cache = false;
            
        if(!refresh) {
            cache = cacheFactory.check({key:key,target:target,lifetime:lifetime})
        }

        if(!cache) {
            newsFactory.load(slug, 1, limit).then(function (data) {
                if(limit) {
                    success(data, slug);
                } else {
                    if(cacheFactory.set({key:key,target:target,value:data,method:method})) {
                        success( cacheFactory.get({key:key,target:target}), slug );   
                    }
                }
            }, fail);
        } else {
            success( cacheFactory.get({key:key,target:target}), slug );
        }
    }    
    
    function loadBottom(slug, page, success, fail) {
        var key = 'ow-news-lists',
            target = slug,
            method = 'push';
        
        newsFactory.load(slug, page).then(function (data) {
            if(cacheFactory.set({key:key,target:target,value:data,method:method,limitInTarget:90})) {
                success(data);
            }
        }, fail);
    }
    
    function search(keyword, success, category, fail) {
        newsFactory.search(keyword, category).then(function (data) {
            success(data);
        }, fail);
    }
    
    
    return {
        categories: getCategories,
        
        category: getCategory,
        
        item: getItem,
        
        reset: reset,
        
        load: loadTop,
        
        more: loadBottom,
                
        search: search
    };
});