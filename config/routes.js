module.exports = function routes() {
  this.root('mainpanel#show');
  this.resource('account');
  this.match('main', 'mainpanel#show', { via: 'get' });
  this.match('famous', 'mainpanel#famous', { via: 'get' });
  //this.match('index', 'account#loginForm', { via: 'get' });
  this.match('register', 'account#registrationForm', { via: 'get' });
  this.match('signup', 'account#signup', { via: 'post' });
  this.match('login', 'account#loginForm', { via: 'get' });
  this.match('login', 'account#login', { via: 'post' });
  this.match('logout', 'account#logout');
  this.match('contact/import', 'account#importContacts', { via: 'post' });
};
