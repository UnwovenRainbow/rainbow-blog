// const user = require('./user');
const post = require('./post');
const auth = require('./auth');

module.exports = (app) => {
  // app.use('/user', user);
  app.use('/post', post);
  app.use('/auth', auth);
}