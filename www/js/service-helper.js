angular.module('service.helper', [])


.factory('sessionFactory', function () {
    
})

.factory('storageFactory', function () {    
    var storageFactory =  {        
        // CHECK
        check: function () {
            return true;
        },
        
        // GET
        get: function (key) {
            // Check 
            if(!this.check()) {
                console.log('No LocalStorage!'); return false;
            }
            
            key = window.localStorage.getItem(key);
            
            if(key === null) {
                return null;
            }

            if(isNaN(key)) {
                try{
                    var json = JSON.parse(key);
                    return json;
                } catch(e) {
                    return key;
                }
            }

            return parseInt(key);
            
        },
        
        // SET
        set: function (key, value) {key
            // Check 
            if(!this.check()) {
                console.log('No LocalStorage!'); return false;
            }                                    
            if(typeof value === 'object') {
                window.localStorage.setItem(key, JSON.stringify(value)); return true;
            }
            window.localStorage.setItem(key, value); return true;
        },
        
        // REMOVE
        remove: function (key) {
            return window.localStorage.removeItem(key);
        }        
    };    
    return storageFactory;
})

.factory('cacheFactory', function (storageFactory) {
    
    var storageFactory = storageFactory;
    
    var cacheFactory = {
        
        /*
            - Params:            
                params = Object {
                    key: String,
                    target: String,
                    lifetime: Number (optional)
                }
            
            - Return: Boolean - false
        */
        check: function (params) {
            //console.log('CACHE: check() {} ...');
            
            var params = params || {};
            
            // Params is not an object
            if( typeof params != 'object' ) {
                //console.log('CACHE: check() {} ... fails 1 ...');
                return false;
            }
            
            var key = params.key || false,
                target = params.target || false,
                lifetime = params.lifetime || false;
            
            // No storage key
            if(!key || !target) {
                //console.log('CACHE: check() {} ... fails 2 ...');
                return false;
            }
            
            var data = this.get({
                key: key,
                target: target,
                forChecking: true
            });
            
            //console.log(data);
            
            if(data.length <= 0) {
                //console.log('CACHE: check() {} ... NO CACHE ...');
                return false;
            }
            
            if(data[0] <= 0) {
                //console.log('CACHE: check() {} ... NO CACHE FOR THIS KEY ...');
                return false;
            }

            if(lifetime) { //console.log('CACHE: check() {} ... HAS LIFETIME ...');
                // EXPIRED
                var storageTime = Date.parse(data[1]),
                    now = Date.parse( JSON.parse( JSON.stringify( new Date() ) ) );
                if(parseInt(now - storageTime) > lifetime) { //console.log('CACHE: check() {} ... EXPIRED ...', parseInt(now - storageTime), lifetime);
                    return false;
                }
            }
                
            //console.log('CACHE: check() {} ... HAS CACHE ...');
            return true;
        },
        
        /*
            - Params:            
                params = Object {
                    key: String,
                    target: String,
                    forChecking: (optional) Boolean - false
                }
            
            - Return: Array - []
        */
        get: function (params) {
            //console.log('CACHE: get() {} ...');
            
            var params = params || {};
            
            // Params is not an object
            if( typeof params != 'object' ) { //console.log('CACHE: get() {} ... fails ...');
                return [];
            }
            
            var key = params.key || false,
                target = params.target || false;
                forChecking = params.forChecking || false;
            
            if(!key || !target) {
                return [];
            }
            
            var data = storageFactory.get(key);                       
            
            if(data !== null) {
                var found = {
                    storage: data.storage[target] || false,
                    updated: data.updated[target] || false                    
                };
                
                if(found.storage && found.updated) {
                    if(!forChecking) {
                        return found.storage;
                    }
                    return [ found.storage.length, found.updated ];
                }
                
            }
            
            return [];
        },
        
        /*
            - Params:            
                params = Object {
                    key: String,
                    target: String,
                    value: Array
                    method: (optional) String - 'override',
                    limit: (optional) Number;
                }
            
            - Return: Boolean - false
        */
        set: function (params) {
            //console.log('CACHE: set() {} ...');
            
            var params = params || {};
            
            // Params is not an object
            if( typeof params != 'object' ) {
                //console.log('CACHE: set() {} ... PARAMS IS NOT AN OBJECT ...');
                return false;
            }
            
            var key = params.key || false,
                target = params.target || false,
                value = params.value || false,
                method = params.method || 'override',
                limitInKey = params.limitInKey || false,
                limitInTarget = params.limitInTarget || false;
            
            if(!key || !target || !value) { //console.log('CACHE: set() {} ... NOT ENOUGH DATA ...');
                return false;
            }
            
            var data = storageFactory.get(key);
            
            // No cache for this key
            if( data === null ) {
                //console.log('CACHE: set() {} ... NO CACHE FOR THIS KEY ...');
                data = { storage: {}, updated: {} };
                
                data.storage[target] = value;
                data.updated[target] = new Date();
                
                // Save to localStorage
                if(storageFactory.set(key, data)) { return true; }  
            }
            
            
            var found = {
                storage: data.storage[target] || false,
                updated: data.updated[target] || false                    
            };

            // Target not found
            if(!found.storage || !found.updated) { //console.log('CACHE: set() {} ... NO CACHE FOR THIS TARGET ...');
                data.storage[target] = [].concat(value);
                data.updated[target] = new Date();
                                                  
                
                // Limit in key
                if(limitInKey && Object.keys(data.storage).length > limitInKey) {

                    var updated = JSON.parse(JSON.stringify(data.updated)),
                        sortable = [];

                    for(var target in updated) {
                        sortable.push([target, updated[target]]);
                    }

                    sortable.sort(function (a, b) {
                        return Date.parse(a[1]) - Date.parse(b[1]);
                    });

                    data = this.remove(data, [sortable[0][0]]);


                    //console.log(data);
                }
                
                // Save to localStorage
                if(storageFactory.set(key, data)) { return true; }
            }

            // Already cached
            if(method === 'unshift') { //console.log('CACHE: set() {} ... HAS CACHE FOR THIS TARGET (unshift) ...');
                var length = value.length;
                found.storage = value.concat(found.storage);
                found.storage.splice(-length); // Remove last items 
                found.updated = new Date();

                data.storage[target] = found.storage;
                data.updated[target] = found.updated;
            } else if(method === 'push') {
                //console.log('CACHE: set() {} ... HAS CACHE FOR THIS TARGET (push) ...');
                
                if(limitInTarget && found.storage.length < limitInTarget) {
                    found.storage = found.storage.concat(value);
                    found.updated = new Date();

                    data.storage[target] = found.storage;
                    data.updated[target] = found.updated;
                } else {
                    return true;
                }
            } else { //method === 'override'
                //console.log('CACHE: set() {} ... HAS CACHE FOR THIS TARGET (override) ...');
                
                found.storage = value;
                found.updated = new Date();

                data.storage[target] = found.storage;
                data.updated[target] = found.updated;
            }
            
            
            // Save to localStorage
            if(storageFactory.set(key, data)) { return true; }
                
                
        },
        
        remove: function (data, targets) {
            for(var i = 0; i <= targets.length; i++) {
                delete data.storage[targets[i]];
                delete data.updated[targets[i]];
            }
            return data;
        }
    };
    
    return cacheFactory;
})

// Navigation
.factory('navFactory', function ($state, $ionicHistory, $ionicScrollDelegate) {
    
    var timer = null;
    
    var nav = {
        goBack: function () {
            if($ionicHistory.backView() != null) {
                $ionicHistory.goBack();
            } else {              
                window.history.back();
                $ionicHistory.nextViewOptions({
                  disableBack: true
                });
            }
        },
        
        goTo: function (name) {
            $state.go(name);
        },
        
        toTop: function () {
            $ionicScrollDelegate.scrollTop(true);
        }
    };
    
    return nav;
});