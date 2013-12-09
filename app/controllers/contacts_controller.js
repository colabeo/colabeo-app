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
        var API_USERNAME = "chapman";
        var API_PASSWORD = "qwerty23";

        var sendgrid  = require('sendgrid')(API_USERNAME, API_PASSWORD);

        var smtpapiHeaders = new sendgrid.SmtpapiHeaders();
        smtpapiHeaders.addFilterSetting('subscriptiontrack', 'enable', '0');

        sendgrid.send({
            smtpapi: smtpapiHeaders,
            to:       newContact.email,
            from:     user.get("email"),
            subject:  "Hello from Colabeo",
            text : "Please install Colabeo"
        }, function(err, json) {
            if (err) {
                console.error(err);
            }
            else
                console.log(json);
            self.res.json(json);
        });
    });
};

module.exports = ContactsController;