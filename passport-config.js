const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('users.db');



function initialize(passport, getUserByEmail, getUserById){
    // Function to authenticate users
    const authenticateUsers = async (email, password, done) => {
        const sql = `SELECT * FROM users WHERE email = ?`;
        db.get(sql, [email], async (err, row) => {
            if (err) {
              return done(err);
            }
            if (!row) {
              return done(null, false, { message: 'No user with that email' });
            }
            try {
              if (await bcrypt.compare(password, row.password)) {
                return done(null, row);
              } else {
                return done(null, false, { message: 'Password incorrect' });
              }
            } catch (error) {
              console.log(error);
              return done(error);
            }

          });

    };

   
        passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUsers));

        passport.serializeUser((user, done) => done(null, user.id));
      
        passport.deserializeUser((id, done) => {
          const sql = 'SELECT * FROM users WHERE id = ?';
          db.get(sql, [id], (err, row) => {
            if (err) {
              return done(err);
            }
            return done(null, row);
          });
        });
      }

// Function to create a new user
async function createUser(name, email, password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`;
    db.run(sql, [name, email, hashedPassword], function(err) {
        if (err) {
            console.log(err.message);
            return false;
        }
        console.log(`A new user has been added with rowid ${this.lastID}`);
        return true;
    });
}

module.exports = initialize;