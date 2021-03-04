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
const Comment = require('../models/commet')
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

app.get('/welcomeback', checkRole , (req, res) => {

    User.findById(req.user._id)
        .populate('article')
        .exec(function(err, result) {
            if(err) {console.log(err)}
            res.render('welcome', {title: 'Welcome home, admin', user: result.name, article: result.article})
        })


        //original code
    // res.render('welcome', {title: 'welcome home', user: req.user.name, article: req.user.article})
})

app.get('/new', (req, res) => {
    res.render('new', {title: 'New post', user: req.user.name})
})

app.post('/new', async (req, res) => {
    const article = new Article({
        text: req.body.text,
        user: req.user.id
    })
    await article.save()
    const user = await User.findById(req.user.id)
    user.article.push(article)
    await user.save(function(err) {
        if(err) {console.log(err)}
        res.redirect('/welcomeback')
    })
})

app.get('/userview', (req, res) => {
    User.findById(req.user._id)
        .populate('article')
        .exec(function(err, result) {
            if(err) {console.log(err)}
            res.render('userview', {title: 'User view page', article: result.article})
        })
    // res.render('userview', {title: 'user view Page', article: req.user.article})
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

// Register function when admin and user share userSchema
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

function checkRole (req, res, next) {
    if(req.user.role === 'admin') {
        next()
    } else {
        res.redirect('/userview')
    }
}

// register function have user and admin seperated, doesn't work as admin account can not pass passport authorization

// app.post('/register', async (req, res) => {
//     const hashedPassword = await bcrypt.hash(req.body.password, 10);
//     if(req.body.email === process.env.ADMIN_EMAIL && req.body.password === process.env.ADMIN_PASSWORD) {
//         const admin = new Admin({
//             name: req.body.name,
//             email: req.body.email,
//             password: hashedPassword,
//             role: 'admin'
//         })
//         await admin.save()
//         res.redirect('/login')
//     } else if(req.body.email === process.env.ADMIN_EMAIL && req.body.password !== process.env.ADMIN_PASSWORD) {
//         res.send('Not Authorized')
//     } else {
//         const user = new User({
//             name: req.body.name,
//             email: req.body.email,
//             password: hashedPassword,
//             role: 'user'
//         })
//         await user.save()
//         res.redirect('/login')
//     }
// })

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})