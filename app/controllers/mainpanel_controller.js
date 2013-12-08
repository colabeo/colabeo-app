var locomotive = require('locomotive');
var Controller = locomotive.Controller;

var MainPanelController = new Controller();

MainPanelController.show = function() {
    if (!this.req.isAuthenticated())
        return this.res.redirect("/login");

    //this.user = this.req.user;
    console.log("user = " + this.req.user.id + this.req.user.get("email"));
    this.render({ user: this.req.user });
}

MainPanelController.famous = function() {
    if (!this.req.isAuthenticated())
        return this.res.redirect("/login");

    //this.user = this.req.user;
    this.render('famous');
}

module.exports = MainPanelController;