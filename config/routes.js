module.exports = function routes() {
  this.root('account#new');
  this.resource('account');
  this.match('index', 'account#loginForm', { via: 'get'});
  this.match('register', 'account#registrationForm', { via: 'get'});
  this.match('login', 'account#loginForm', { via: 'get' });
  this.match('login', 'account#login', { via: 'post' });
  this.match('logout', 'account#logout');
};
