var https = require('https');

var YammerConnector = function() {
}

YammerConnector.prototype.init = function(accessToken) {
    this.accessToken = accessToken;
}

YammerConnector.prototype.getData = function(accessToken, apiPath, callback) {
    var options = {
        host: 'www.yammer.com',
        port: 443,
        path: "/api/v1" + apiPath + '?access_token=' + accessToken,
        method: 'GET'
    };

    console.log('get data from Yammer: ' + apiPath + '?access_token=' + accessToken);
    this.invoke(options, accessToken, apiPath, callback);
}

YammerConnector.prototype.getContacts = function(callback) {
    this.getData(this.accessToken, '/users.json', function(data){
        //TODO to be implemented

        // self1.userFirebaseContactRef.set(contacts);
        console.log("@User.YammerConnector.getContacts()");
        callback(data);
    });
}

module.exports = YammerConnector;