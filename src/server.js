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
const LocalStrategy = require('passport-local').Strategy
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

app.get('/home', (req, res) => {
    res.render('home', {title: 'Home Page'})
})

app.get('/login', (req, res) => {
    res.render('login', {title: 'Login'})
})

app.post('/login', (req, res) => {

})

app.get('/register', (req, res) => {
    res.render('register', {title: 'Register'})
})

app.post('/register', (req, res) => {
    
})

app.get('/welcome', (req, res) => {
    res.render('welcome', {title: 'Welcome'})
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})