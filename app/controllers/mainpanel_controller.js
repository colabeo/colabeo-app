var locomotive = require('locomotive');
var Controller = locomotive.Controller;

var MainPanelController = new Controller();

MainPanelController.show = function() {
    if (!this.req.isAuthenticated())
        return this.res.redirect("/login");

    //this.user = this.req.user;
    this.render();
}

module.exports = MainPanelController;