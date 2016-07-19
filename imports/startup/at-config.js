/* globals AccountsTemplates */

// This removes the password field but returns it, 
// so that we can re-add it later, preserving the
// desired order of the fields
var pwd = AccountsTemplates.removeField('password');
AccountsTemplates.removeField('email');
AccountsTemplates.addFields([
  {
      _id: "username",
      type: "text",
      displayName: "username",
      required: true,
      minLength: 5,
  },
  pwd
]);

AccountsTemplates.configure({
    homeRoutePath: '/',
    redirectTimeout: 4000,
    defaultLayout: 'layout',
    defaultLayoutRegions: {},
    defaultContentRegion: 'content',
});

// /sign-in
AccountsTemplates.configureRoute('signIn');
// /sign-up
AccountsTemplates.configureRoute('signUp');