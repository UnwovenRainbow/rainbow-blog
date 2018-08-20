'use strict'

const config = require('./config')

const express = require('express')
const session = require('express-session')
const FileStore = require('session-file-store')(session)
config.session['store'] = new FileStore()
const morgan = require('morgan')
const bodyParser = require('body-parser')
const passport = require('passport')

require('./db/initDb')
require('./auth')

const mountRoutes = require('./routes')

const app = express()

app.set('trust proxy', 1)
app.use(session(config.session))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
	extended: false
}))
app.use(morgan('dev'))
app.use(passport.initialize())
app.use(passport.session())

mountRoutes(app)

app.use(express.static(__dirname + '/public'))

app.listen(3000, function() {
	console.log("Ready - Let's go!")
})