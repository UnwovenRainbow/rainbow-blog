const Router = require('express-promise-router')

const db = require('../db')

// create a new express-promise-router
// this has the same API as the normal express router except
// it allows you to use async functions as route handlers
const router = new Router()

// export our router to be mounted by the parent application
module.exports = router

router.get('/', async (req, res) => {
  const { id } = req.params
  const { rows } = await db.query('SELECT * FROM public."Post"')
  res.json(rows)
})

router.get('/:id', async (req, res) => {
  const { id } = req.params
  const { rows } = await db.query('SELECT * FROM public."Post" WHERE post_id = $1', [id])
  res.json(rows[0])
})

router.post('/', async (req, res) => {
  let message = undefined
  if (!req.body) {
    message = 'Invalid JSON'
  } else if (req.body.title === undefined) {
    message = 'Missing title'
  } else if (req.body.title === '') {
    message = 'Empty title'
  } else if (req.body.content === undefined) {
    message = 'Missing content'
  } else if (!req.body.content) {
    message = 'Empty content'
  } else if (!req.user) {
    message = 'Not logged in'
  } else if (!req.user.role || req.user.role !== 'administrator') {
    message = 'No permission'
  }

  if (message !== undefined) {
    return res.status(400).json({error: {message: message}})
  }

  const { response } = await db.query('INSERT INTO public."Post"(title, content) VALUES($1, $2) RETURNING *', [req.body.title, req.body.content])
  res.json(response)
})

router.get('/:id/comment', async (req, res) => {
  const { id } = req.params
  const { rows } = await db.query('SELECT * FROM public."Post" INNER JOIN public."Comment" USING (post_id) WHERE post_id = $1', [id])
  res.json(rows[0])
})

router.post('/:id/comment', async (req, res) => {
  const { id } = req.params

  let message = undefined
  if (!req.body) {
    message = 'Invalid JSON'
  } else if (req.body.text === undefined) {
    message = 'Missing comment'
  } else if (req.body.text === '') {
    message = 'Empty comment'
  } else if (!req.user) {
    message = 'Not logged in'
  }

  if (message !== undefined) {
    return res.status(400).json({error: {message: message}})
  }

  try {
    const { response } = await db.query('INSERT INTO public."Comment"(text, user_id, post_id) VALUES($1, $2, $3) RETURNING *', [req.body.text, req.user.user_id, id])
    res.json(response)
  } catch (err) {
    res.status(400).json({error: {message: err.message}})
  }
})
