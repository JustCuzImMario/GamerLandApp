if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

// Importing libraries via npm
const express = require('express');
const app = express();
const bcrypt = require('bcrypt'); // for password hashing
const initializePassport = require('./passport-config');
const flash = require('express-flash');
const session = require('express-session');
const passport = require('passport');
const methodOverride = require('method-override');

// Serve static files from the "views" directory
app.use(express.static('views'));



initializePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
  );

app.use(express.static('views'));


const users = []

app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(session({
    secret: process.env.SESSION_SECRET, // used to sign the session ID cookie
    resave: false, // will not save session if nothing is modified
    saveUninitialized: false, // will not save empty value in session if there is no value
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));

// POST Login
app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/login_success',
    failureRedirect: '/login',
    failureFlash: true,
}));

// POST Register
app.post('/register', checkNotAuthenticated, async (req, res) => {
    
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        users.push({
            id: Date.now().toString(),
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword,
        })
        console.log(users) //logging users array to console
        res.redirect('/login')
    } catch (error) {
        console.log(error)
        res.redirect('/register');
    }}
);

app.get('/login_success', checkAuthenticated, (req, res) => {
    res.render('login_success.ejs', {username: req.user.username});
});

app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs');
});

app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register.ejs');
});

//END Routes

app.delete('/logout', (req, res) => {
    req.logout(req.user, err => {
        if (err) return next(err);
        res.redirect('/login');
    });
});

function checkAuthenticated (req, res, next){
    if (req.isAuthenticated()){
        return next();
    }
    res.redirect('/login');
}

function checkNotAuthenticated (req, res, next){
    if (req.isAuthenticated()){
       return res.redirect('/index.html');
    }
    next();
}


app.listen(3000);
