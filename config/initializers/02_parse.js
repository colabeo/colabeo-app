var Parse = require('parse').Parse;

var APP_ID = "qX7XUc4JLzh6Y3rvKYuLeELLKqHk3KAXQ4xgCoue";
var JAVASCRIPT_KEY = "PhF8gvGcaWNBwWX24K7LG7wEEjIe0cVaTCtjtaXb";
var MASTER_KEY = "a9M6qBsVNJU1Zap2eumLVKV09fB94aY9K4ZXdHe1";

Parse.initialize(APP_ID, JAVASCRIPT_KEY, MASTER_KEY);

Parse.User.extend({
    socialConnectors: [],
    fireBaseRef: null,
    initFirebaseRef: function(firebaseRef) {
        this.fireBaseRef = firebaseRef;
    },
    addSocialConnector: function(socialConnector) {
        this.socialConnectors.push(socialConnector);
    },
    getSocialConnector: function(connectType) {
        return this.socialConnectors[connectType];
    },
    importContacts: function(connectType, done) {
        var connector = this.getSocialConnector(connectType);
        var self = this;
        connector.getContacts(function(data) {
            // console.log(data);

            //import
            var friendList = null;
            // Error handling, in case token is invalid.
            try{
                friendList = JSON.parse(data);
            }
            catch (err)
            {
                done(err);
                return;
            }

            var contacts = {};
            var imported = 1;
            self.fireBaseRef.once('value', function (snapshot) {
                var contact_old = snapshot.val();

                for (var i = 0; i < friendList.length; i++) {
                    //***************************************************
                    var conflict = false;
                    if (self.id == friendList[i].id) {
                        conflict = true;  //can not add self to contact list!
                    }
                    if (!conflict && contact_old != null) {
                        for (var name in contact_old) {
                            if (contact_old[name].handle.yammer == friendList[i].id) {
                                conflict = true;
                            }
                        }
                    }

                    if (!conflict) {
                        var tmp = {
                            handle: {
                                yammer: friendList[i].id
                            },
                            id: friendList[i].full_name,
                            avatar: friendList[i].mugshot_url,
                            description: friendList[i].job_title
                        };

                        self.fireBaseRef.push(tmp, function () {
                            imported++;
                            if (imported == friendList.length) {
                                console.log('- @/user.importContact(): All contacts added.');
                                callback();
                            }
                        });
                    } else {
                        imported++;
                        if (imported == friendList.length) {
                            console.log('- @/user.importContact(): All contacts added.');
                            callback();
                        }
                    }

                    //***************************************************
                }
            });
    }
}, {
    /*
    classMethod1: function() { ... },
    classMethod2: function() { ... }
    */
});