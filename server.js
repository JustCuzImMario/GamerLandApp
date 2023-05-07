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
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('users.db');



app.set('view-engine', 'ejs');



// Serve static files from the "views" directory
app.use(express.static('views'));
app.use(express.static(__dirname));
app.use(express.static('images'));


initializePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
  );

app.use(express.static('views'));
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



// Login and Register routes
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const sql = `SELECT * FROM users WHERE email = ?`;
    db.get(sql, [email], (err, row) => {
      if (err) {
        return console.error(err.message);
      }
      if (row) {
        const hashedPassword = row.password;
        if (bcrypt.compareSync(password, hashedPassword)) {
          res.render('login_success.ejs', { title: 'Login Success', username: row.username });
        } else {
          res.render('login.ejs', { title: 'Login', error: 'Invalid email or password' });
        }
      } else {
        res.render('login.ejs', { title: 'Login', error: 'Invalid email or password' });
      }
    });
  });
  
  
app.get('/register', (req, res) => {
res.render('register.ejs', { title: 'Register' });
});

app.post('/register', (req, res) => {
const { username, email, password } = req.body;
const hashedPassword = bcrypt.hashSync(password, 10);
const sql = `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`;
db.run(sql, [username, email, hashedPassword], (err) => {
    if (err) {
    return console.error(err.message);
    }
    res.render('login.ejs', { title: 'Login', message: 'Registration successful. Please login.' });
});
});



// Routes
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


// Logout route
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
