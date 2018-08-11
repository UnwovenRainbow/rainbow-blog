// const user = require('./user');
const post = require('./post');

module.exports = (app) => {
  // app.use('/user', user);
  app.use('/post', post);
}