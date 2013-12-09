var locomotive = require('locomotive');
var Controller = locomotive.Controller;

var Parse = require('parse').Parse;

var ContactsController = new Controller();

ContactsController.add = function() {

    var newContact = {
        email : this.param("email"),
        lastname : this.param("lastName"),
        firstname : this.param("firstName")
    };
    var user = Parse.User.current();
    var self = this;
    user.importContactByEmail(newContact, function() {
        self.res.json({ status : 'done' });
    });
};

module.exports = ContactsController;