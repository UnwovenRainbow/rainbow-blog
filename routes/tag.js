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
  const { rows } = await db.query('SELECT * FROM public."Tag"')
  res.json(rows)
})

router.get('/:id', async (req, res) => {
  const { id } = req.params
  const { rows } = await db.query('SELECT * FROM public."Tag" WHERE tag_id = $1', [id])
  res.json(rows[0])
})

router.post('/', async (req, res) => {
  let message = undefined
  if (!req.body) {
    message = 'Invalid JSON'
  } else if (req.body.name === undefined) {
    message = 'Missing name'
  } else if (req.body.name === '') {
    message = 'Empty name'
  } else if (!req.user) {
    message = 'Not logged in'
  } else if (!req.user.role || req.user.role !== 'administrator') {
    message = 'No permission'
  }

  if (message !== undefined) {
    return res.status(400).json({error: {message: message}})
  }

  const { response } = await db.query('INSERT INTO public."Tag"(name) VALUES($1) RETURNING *', [req.body.name])
  res.json(response)
})
