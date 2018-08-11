const Router = require('express-promise-router');

const db = require('../db');

// create a new express-promise-router
// this has the same API as the normal express router except
// it allows you to use async functions as route handlers
const router = new Router();

// export our router to be mounted by the parent application
module.exports = router;

router.get('/', async (req, res) => {
  const { id } = req.params;
  const { rows } = await db.query('SELECT * FROM public."Post"');
  res.send(rows);
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const { rows } = await db.query('SELECT * FROM public."Post" WHERE id = $1', [id]);
  res.send(rows[0]);
});

router.post('/', async (req, res) => {
	if (!req.body || !req.body.title || !req.body.content) {
    let message = undefined;
    if (!req.body) {
      message = 'Invalid JSON';
    } else if (req.body.title === undefined) {
      message = 'Missing title';
    } else if (req.body.title === '') {
      message = 'Empty title';
    } else if (req.body.content === undefined) {
      message = 'Missing content';
    } else if (!req.body.content) {
      message = 'Empty content';
    }

    return res.status(400).send({error: {message: message}});
  }
  const { response } = await db.query('INSERT INTO public."Post"(title, content) VALUES($1, $2) RETURNING *', [req.body.title, req.body.content]);
  res.send(response);
});
