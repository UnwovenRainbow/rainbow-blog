const Router = require('express-promise-router')
const passport = require('passport')
const bcrypt = require('bcryptjs')
const db = require('../db')

// create a new express-promise-router
// this has the same API as the normal express router except
// it allows you to use async functions as route handlers
const router = new Router()

// export our router to be mounted by the parent application
module.exports = router

router.get('/identity', (req, res) => {
    if (!req.user) {
        return res.json({})
    }
    res.json(req.user)
})

// router.post('/login', passport.authenticate('local'))
router.post('/login', passport.authenticate('local'), (req, res) => {
    if (!req.user) {
        return res.status(403).json({success: false, error: {message: 'The username and password could not be found'}})
    }
    res.json({success: true})
})

router.post('/register', async (req, res) => {
    if (!req.body || !req.body.username || !req.body.password || !req.body.email) {
        return res.status(400).json({success: false})
    }
    const hash = await bcrypt.hash(req.body.password, 8)
    console.log(hash)
    try {
        await db.query('INSERT INTO public."User"(username, password, email) VALUES($1, $2, $3) RETURNING *', [req.body.username, hash, req.body.email])
        res.json({success: true})
    } catch(err) {
        if (err.code === '23505') {
            return res.status(400).json({success: false, error: {message: `${err.constraint.split('_')[1]} already in use.`}})
        }
        console.error(err)
        res.status(500).json({success: false})
    }
})
