angular.module('service.plugin', [])

// Plugin API
.factory('pluginAPI', function ($ionicPopup) {
    
    var social = {
        share: function (input) {
            if(window.plugins && window.plugins.socialsharing) {
                window.plugins.socialsharing.share(input.content, input.subject, input.image, input.link);
            } else {
                $ionicPopup.alert({
                    okType: 'button-balanced',
                    title: 'Lỗi!',
                    template: 'Không thể sử dụng Chia sẻ!'
                });
            }
        },
        
        email: function (input, onSuccess, onError) {
            if(window.plugins && window.plugins.socialsharing) {
                window.plugins.socialsharing.shareViaEmail(
                  input.content, // can contain HTML tags, but support on Android is rather limited:  http://stackoverflow.com/questions/15136480/how-to-send-html-content-with-image-through-android-default-email-client
                  input.subject,
                  input.to, // TO: must be null or an array
                  input.cc, // CC: must be null or an array
                  input.bcc, // BCC: must be null or an array
                  input.files, // FILES: can be null, a string, or an array
                  onSuccess, // called when sharing worked, but also when the user cancelled sharing via email (I've found no way to detect the difference)
                  onError // called when sh*t hits the fan
                );
            } else {
                $ionicPopup.alert({
                    okType: 'button-balanced',
                    title: 'Lỗi!',
                    template: 'Không thể sử dụng Email!'
                });
            }
        }
    };
    
    var network = {
        
        init: function () {
            if(!this.check) {
                this.offline();
            } else {
                document.addEventListener('offline', this.offline, false);
            }
        },
        
        check: function () {
            if(navigator.connection) {
                if(navigator.connection.type == 'Connection.NONE') {
                    return false;
                }
                return true; 
            } else {
                return true;
            }
        },
        
        online: function () {
            
            document.addEventListener('offline', this.offline, false);
            document.removeEventListener('online', this.online, false);
        },
        
        offline: function () {
            
            $ionicPopup.alert({
                okType: 'button-balanced',
                title: 'Không có internet!',
                template: 'Vui lòng kiểm tra kết nối internet và thử lại sau!'
            });
            
            document.addEventListener('online', this.online, false);
            document.removeEventListener('offline', this.offline, false);
        }
    };
    
    var media = {
        audio: function (url, options) {
            if(window.plugins && window.plugins.streamingMedia) {
                window.plugins.streamingMedia.playAudio(url, options);               
            } else {
                $ionicPopup.alert({
                    okType: 'button-balanced',
                    title: 'Lỗi!',
                    template: 'Không thể sử dụng Trình phát mặc định!'
                });
            }
        }
    };
    
    return {
        
        social: social,
        
        network: network,
        
        media: media
        
    };
});