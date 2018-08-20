const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const db = require('../db')
const bcrypt = require('bcryptjs')

passport.serializeUser( (user, done) => {
    done(null, user['user_id'])
});

passport.deserializeUser( async (user_id, done) => {
    try {
        const { rows } = await db.query('SELECT * FROM public."User" WHERE user_id = $1', [user_id])
        done(undefined, rows[0])
    } catch(err) {
        done(err)
    }
});

passport.use(new LocalStrategy( async (username, password, done) => {
    console.log(`Locally authenticating ${username} with ${password}`)
    const { rows } = await db.query('SELECT * FROM public."User" WHERE username = $1', [username])

    if (!rows || !rows[0]) {
        return done(null, false, {
            message: 'Incorrect username/password.'
        });
    }

    const user = rows[0]
    const res = await bcrypt.compare(password, user.password)

    if (!res) {
        return done(null, false, {
            message: 'Incorrect username/password.'
        });
    }

    return done(null, user);
}));