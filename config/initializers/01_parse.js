var Parse = require('parse').Parse;

var APP_ID = "qX7XUc4JLzh6Y3rvKYuLeELLKqHk3KAXQ4xgCoue";
var JAVASCRIPT_KEY = "PhF8gvGcaWNBwWX24K7LG7wEEjIe0cVaTCtjtaXb";
var MASTER_KEY = "a9M6qBsVNJU1Zap2eumLVKV09fB94aY9K4ZXdHe1";

Parse.initialize(APP_ID, JAVASCRIPT_KEY, MASTER_KEY);
/*
Parse.User._saveCurrentUser = function(user) {

    console.log("override Parse.User._saveCurrentUser()");

    if (Parse.User._currentUser !== user) {
        Parse.User.logOut();
    }
    user._isCurrentUser = true;
    Parse.User._currentUser = user;
    Parse.User._currentUserMatchesDisk = true;

    var json = user.toJSON();
    json._id = user.id;
    json._sessionToken = user._sessionToken;
    Parse.localStorage.setItem(
        Parse._getParsePath(user._sessionToken + "/" + Parse.User._CURRENT_USER_KEY),
        JSON.stringify(json));

    console.log("Parse.localStorage - ", Parse.localStorage);
}

Parse.User.current = function(sessionToken) {

    console.log("override Parse.User.current()");


    if (Parse.User._currentUser) {
        return Parse.User._currentUser;
    }

    if (Parse.User._currentUserMatchesDisk) {
        // TODO: Lazily log in anonymous user.
        return Parse.User._currentUser;
    }


    // Load the user from local storage.
    Parse.User._currentUserMatchesDisk = true;

    console.log("Parse.localStorage - ", Parse.localStorage);
    var userData;
    if (sessionToken) {
        console.log("Parse._getParsePath(sessionToken) - ", Parse._getParsePath(sessionToken));
        userData = Parse.localStorage.getItem(Parse._getParsePath(sessionToken + "/" + Parse.User._CURRENT_USER_KEY));
    }

    if (!userData) {
        // TODO: Lazily log in anonymous user.
        return null;
    }
    Parse.User._currentUser = Parse.Object._create("_User");
    Parse.User._currentUser._isCurrentUser = true;

    var json = JSON.parse(userData);
    Parse.User._currentUser.id = json._id;
    delete json._id;
    Parse.User._currentUser._sessionToken = json._sessionToken;
    delete json._sessionToken;
    Parse.User._currentUser.set(json);

    Parse.User._currentUser._synchronizeAllAuthData();
    Parse.User._currentUser._refreshCache();
    Parse.User._currentUser._opSetQueue = [{}];
    return Parse.User._currentUser;

}
*/
Parse.User.extend({
    socialConnectors: {},
    fireBaseRef: null,
    // TODO: If you were concern about security you can use firebase-token-generator to generate a toke for user's Ref, use it to auth user' Ref and pass user's Ref(instead of serverRootRef) to init.
    initFirebaseRef: function(uid, serverRootRef) {
        var self=this;
        this.fireBaseRef = serverRootRef.child('users').child(uid);
        this.fireBaseIndexRef=serverRootRef.child('index');
        this.fireBaseContactRef=this.fireBaseRef.child('contacts');
        this.fireBaseRef.child('email').once('value', function(snapshot) {
            if (snapshot.val()==null || snapshot.val()=='unknown')
            {
                if (self.attributes.email)
                {
                    console.log('Init user FirebaseRef, email=' + self.attributes.email)
                    self.fireBaseRef.update({email: self.attributes.email});
                }
                else
                {
                    console.log('Init user FirebaseRef, email=unknown')
                    self.fireBaseRef.update({email: 'unknown'});
                }
            }
        });
    },
    _updateFireBaseIndex: function(connectType, social_network_id) {
        var tmp_obj={};
        var tmp=social_network_id;
        tmp_obj[tmp]=this.id;
        this.fireBaseIndexRef.child(connectType).update(tmp_obj);
    },
    addSocialConnector: function(connectType, socialConnector) {
        this.socialConnectors[connectType]=socialConnector;
        this._updateFireBaseIndex(connectType, socialConnector.id);    // Update/Create user's Filebase "index/yammer" branch
    },
    getSocialConnector: function(connectType) {
        return this.socialConnectors[connectType];
    },
    importContacts: function(connectType, done) {
        var connector = this.getSocialConnector(connectType);
        var self = this;
        connector.getContacts(function(data) {
            // console.log(data);
            if (!data)
                done('No contact data found!');

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
            self.fireBaseContactRef.once('value', function (snapshot) {
                var contact_old = snapshot.val();

                for (var i = 0; i < friendList.length; i++) {
                    //***************************************************
                    var conflict = false;
                    if (self.id == friendList[i].id) {
                        conflict = true;  //can not add self to contact list!
                    }
                    if (!conflict && contact_old != null) {
                        for (var name in contact_old) {
                            var contact = contact_old[name];

                            if ((contact.handle) && (contact.handle.yammer == friendList[i].id)) {
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

                        self.fireBaseContactRef.push(tmp, function () {
                            imported++;
                            if (imported == friendList.length) {
                                console.log('All contacts added!');
                                done();
                            }
                        });
                    } else {
                        imported++;
                        if (imported == friendList.length) {
                            console.log('- @/user.importContact(): All contacts added.');
                            done();
                        }
                    }

                    //***************************************************
                }
            });
        })
    },
    importContactByEmail : function(newContact, done) {
        var self = this;
        this.fireBaseContactRef.once('value', function (snapshot) {
            var contactList = snapshot.val();
            var conflict = false;
            for (var id in contactList) {
                console.log("contact in contactList" + JSON.stringify(id));
                if (contactList[id].email == newContact.email) {
                    conflict = true;
                }
            }

            if (!conflict) {
                console.log("new Contact" + JSON.stringify(newContact));
                self.fireBaseContactRef.push(newContact, function () {
                    console.log('contact added!');
                    done();
                });
            } else {

            }
        });
    }
}, {

//    classMethod1: function() { ... },
//    classMethod2: function() { ... }

});

//console.log(Parse.User);