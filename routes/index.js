const post = require('./post');
const comment = require('./comment');
const tag = require('./tag');
const auth = require('./auth');

module.exports = (app) => {
  app.use('/post', post);
  app.use('/comment', comment);
  app.use('/tag', tag);
  app.use('/auth', auth);
}