const LocalStrategy2 = require("passport-local").Strategy;
const bcrypt = require("bcrypt");

const { Pool, Client } = require('pg')

const pool = new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DB,
    password: process.env.PG_PW,
    port: process.env.PG_PORT,
})


function initialize2(passport) {
    console.log("Initialized2");

    const authenticateUser2 = (username, password, done) => {
        console.log(username, password);
        pool.query(
            `SELECT * FROM student_registration WHERE login_id = $1`,
            [username],
            (err, results) => {
                if (err) {
                    throw err;
                }
                console.log(results.rows);


                if (results.rows.length > 0) {
                    const user = results.rows[0];
                    console.log(user)

                    bcrypt.compare(password, user.paswword, (err, isMatch) => {
                        if (err) {
                            console.log(err);
                        }
                        if (isMatch) {
                            return done(null, user);
                        } else {
                            //password is incorrect
                            return done(null, false, { message: "Password is incorrect" });
                        }
                    });
                } else {
                    // No user
                    return done(null, false, {
                        message: "No user with that email address"
                    });
                }
            }
        );
    };

    passport.use(
        'user-player', new LocalStrategy2(
            { usernameField: "username", passwordField: "password" },
            authenticateUser2
        )
    );
    // Stores user details inside session. serializeUser determines which data of the user
    // object should be stored in the session. The result of the serializeUser method is attached
    // to the session as req.session.passport.user = {}. Here for instance, it would be (as we provide
    //   the user id as the key) req.session.passport.user = {id: 'xyz'}
    passport.serializeUser(function (user, done) {
        done(null, user);
    });
    // In deserializeUser that key is matched with the in memory array / database or any data resource.
    // The fetched object is attached to the request object as req.user

    passport.deserializeUser(function (user, done) {
        done(null, user);
    });
}

module.exports = initialize2;