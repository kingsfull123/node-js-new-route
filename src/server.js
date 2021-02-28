if(process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express')
const app = express()
const port = process.env.PORT || 8000
const bodyParser = require('body-parser')
const session = require('express-session')
const flash = require('express-flash')
const mongoose = require('mongoose')
mongoose.connect(`mongodb+srv://senyang:${process.env.DB_PASSWORD}@cluster0.aapka.mongodb.net/${process.env.DB_USERNAME}?retryWrites=true&w=majority`, {useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true});
const User = require('../models/user')
const Article = require('../models/article')
const passport = require('passport')
const initialize = require('../passport-config')
initialize(passport)
const bcrypt = require('bcrypt')
app.set('view engine', 'ejs')
app.use(express.urlencoded({extended: false}))
app.use(bodyParser.json())
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())

app.get('/welcomeback', (req, res) => {
    res.render('welcome', {title: 'welcome home'})
})

app.get('/new', (req, res) => {
    res.render('new', {title: 'New post'})
})

app.post('/new', async (req, res) => {
    const article = new Article({
        text: req.body.text,
        user: req.user._id
    })
    await article.save(function(err) {
        if(err) {res.send(err)}
        res.redirect('/welcomeback')
    })
})

app.get('/home', (req, res) => {
    res.render('home', {title: 'Home Page'})
})

app.get('/login', (req, res) => {
    res.render('login', {title: 'Login'})
})

app.post('/login', passport.authenticate('local', {
    successRedirect: '/welcomeback',
    failureRedirect: '/login',
    failureFlash: true
}))

app.get('/register', (req, res) => {
    res.render('register', {title: 'Register'})
})

app.post('/register', async (req, res) => {
    const role = req.body.role;
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    try {
        if(role === 'user') {
            const user = new User({
                name: req.body.name,
                email: req.body.email,
                password: hashedPassword,
                role: 'user'
            })
            await user.save()
            res.redirect('/login')
        }

        if(role === 'admin') {
            if(req.body.email === process.env.ADMIN_EMAIL && req.body.password === process.env.ADMIN_PASSWORD) {
                const admin = new User({
                    name: req.body.name,
                    email: req.body.email,
                    password: hashedPassword,
                    role: 'admin'
                })
                await admin.save()
                res.redirect('/login')
            } else {
                res.send('Not authorized')
            }
        }

    } catch(e) {
        res.send(e)
    }
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})