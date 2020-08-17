if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = process.env.PORT || 3000;
const path = require('path')
var ws = require('ws')
var bcrypt = require('bcrypt')
var passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
var dateTime = require('node-datetime');
var dt = dateTime.create();


const initializePassport = require('./passport-config')
initializePassport(passport)


const { Pool, Client } = require('pg')

const users = []


const pool = new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DB,
    password: process.env.PG_PW,
    port: process.env.PG_PORT,
})

app.set('view engine', 'ejs');
app.use('/public', express.static(path.join(__dirname, 'public')));


app.use(bodyParser.json())
app.use(
    bodyParser.urlencoded({
        extended: true,
    }),
)
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())

app.get('/', (req, res) => {
    res.redirect('/home')
})




const wsServer = new ws.Server({ noServer: true });




const server = app.listen(port, () => {
    console.log(`App running on port ${port}.`)
})
server.on('upgrade', (request, socket, head) => {
    wsServer.handleUpgrade(request, socket, head, socket => {
        wsServer.emit('connection', socket, request);
    });
});



const gets3 = (request, response) => {
    const id = 3
    pool.query(
        'SELECT * FROM sensordata31 WHERE id::text LIKE $1 ORDER BY serial_no DESC LIMIT 10', [id],
        (error, results) => {
            if (error) {
                throw error
            }

            response.status(200).json(results.rows)
        },

    )
}

const gets1 = (request, response) => {
    pool.query(
        'SELECT * FROM sensordata11 ORDER BY serial_no DESC LIMIT 10', ['1'],
        (error, results) => {
            if (error) {
                throw error
            }

            response.status(200).json(results.rows)
        },

    )
}

const gets2 = (request, response) => {
    pool.query(
        'SELECT * FROM sensordata21 ORDER BY serial_no DESC LIMIT 10',
        (error, results) => {
            if (error) {
                throw error
            }

            response.status(200).json(results.rows)
        },

    )
}



app.get('/s3', gets3)
app.get('/s2', gets2)
app.get('/s1', gets1)



var interval

app.get('/home', checkAuthenticated, function (req, res, next) {
    if (req.user.iscoach === true) {
        console.log("Coach True");
        let player = req.query.player;
        clearInterval(interval);
        pool.query(
            'SELECT user_name FROM user_registration WHERE coach_name = $1', [req.user.user_name],
            (error, results) => {
                if (error) {
                    throw error
                }

                if (player) {
                    player_name = req.query.player
                    res.render('home', { name: req.user.user_name, first: player_name, data: results.rows })

                }
                else {

                    if (results.rows.length > 0) {
                        player_name = results.rows[0].user_name
                        res.render('home', { name: req.user.user_name, first: player_name, data: results.rows })
                    } else {
                        player_name = "No players found"
                        res.render('home', { name: req.user.user_name, first: player_name, data: player_name })
                    }
                }
                console.log("Current player is " + player_name)


                pool.query(
                    'SELECT device_id FROM user_registration WHERE user_name LIKE $1', [player_name],
                    (error, results) => {
                        if (error) {
                            throw error
                        }
                        console.log("Current with device is " + player_name)
                        //id = 02
                        if (results.rows.length > 0) {
                            const id = results.rows[0].device_id

                            console.log("Device ID is " + id)

                            interval = setInterval(queryFunction, 1000, id);

                        } else {
                            console.log("No players found")
                        }



                    },
                )
            },

        )
    } else {
        console.log("Player true");
        const id = req.user.device_id
        res.render('phome', { name: req.user.user_name });
        interval = setInterval(queryFunction, 1000, id);
    }
});

app.post('/home', async (req, res) => {
    try {
        console.log(req.body)
        const player_name = req.body.player
        res.redirect('home/?player=' + player_name)
    }
    catch{
        console.log("Error")
    }
})






var sensorQuery1 = null;
var sensorQuery2 = null;
var sensorQuery3 = null;



function queryFunction(id) {

    pool.query('SELECT * FROM sensordata11 ORDER BY serial_no DESC LIMIT 10', (err, res1) => {
        if (err) throw err
        sensorQuery1 = res1;

        pool.query('SELECT * FROM sensordata21 WHERE id = $1 ORDER BY serial_no DESC LIMIT 10', [id], (err, res2) => {
            if (err) throw err
            sensorQuery2 = res2;

            pool.query('SELECT * FROM sensordata31 WHERE id = $1 ORDER BY serial_no DESC LIMIT 10', [id], (err, res3) => {
                if (err) throw err
                sensorQuery3 = res3;
                myFun();


            });


        });


    });
}

var x = [];
var y = [];
var roll1 = [];
var roll2 = [];
var roll3 = [];
var pitch3 = [];
var pitch2 = [];
var pitch1 = [];
var avg1 = null;
var avg2 = null;
var avg21 = null;
var avg3 = null;
var avg31 = null;

function myFun() {
    sensor2 = sensorQuery2.rows;
    console.log(sensorQuery2.rows[0].id)
    console.log(sensorQuery2.rows[0].serial_no)
    sensor3 = sensorQuery3.rows;
    console.log(sensorQuery3.rows[0].id)

    for (var i in sensor2) roll2.push((sensor2[i].imu2_roll) + 0.3)
    for (var i in sensor3) roll3.push((sensor3[i].imu3_roll) - 0.1)
    for (var i in sensor3) x.push((2 * roll3[i]) - (roll2[i]))

    for (var i in sensor3) pitch3.push((sensor3[i].imu3_pitch) - 3.5)
    for (var i in sensor2) pitch2.push((sensor2[i].imu2_pitch) - 2.18)
    for (var i in sensor2) y.push((pitch2[i]) - (pitch3[i]))


    //console.log(y)
    //console.log(x)

    const sum1 = x.reduce((a, b) => a + b, 0);
    avg1 = (sum1 / x.length) || 0;

    //console.log(avg1)

    const sum2 = pitch3.reduce((a, b) => a + b, 0);
    avg2 = (sum2 / pitch3.length) || 0;
    if (avg2 < 0) {
        avg21 = Math.abs(avg2)
    }
    else {
        avg21 = 0
    }

    const sum3 = y.reduce((a, b) => a + b, 0);
    avg3 = (sum3 / y.length) || 0;
    avg31 = Math.abs(avg3)


    var data = JSON.stringify({ "first": avg1, "second": avg21, "third": avg31 });
    wsServer.clients.forEach(function each(client) {
        client.send(data);
        console.log('Sent: ' + data);
    });



    roll1.length = 0
    roll2.length = 0
    roll3.length = 0
    x.length = 0
    pitch3.length = 0
    pitch1.length = 0
    pitch2.length = 0
    y.length = 0


    //console.log("Sensor 2:" + sensor2[0].serial_no)
    //console.log("Sensor 3:" + sensor3[0].serial_no)

}
// setInterval(queryFunction, 1000);


app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login')
    clearInterval(interval);
})

app.post('/login', checkNotAuthenticated, passport.authenticate("local", {
    successRedirect: '/home',
    failureRedirect: '/login',
    failureFlash: true
}))


app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register')
    console.log("registration page")
    clearInterval(interval);
})


app.post('/register', checkNotAuthenticated, async (req, res) => {
    try {
        let errors = [];

        console.log(req.body)
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        const password = req.body.password
        const password2 = req.body.password2
        const coach_name = req.body.name
        const coach_email = req.body.email
        const coach_mobile = req.body.mobile
        const coach_cname = req.body.club_name
        const coach_caddr = req.body.club_addr
        const coach_uname = req.body.username
        const coach_status = active
        const created_by = req.body.name
        const created_on = dt.format('Y-m-d H:M:S');
        const isCoach = true
        console.log(created_on);
        if (!coach_name || !coach_email || !password || !password2) {
            errors.push({ message: "Please enter all fields" });
        }

        if (password.length < 6) {
            errors.push({ message: "Password must be a least 6 characters long" });
        }

        if (password !== password2) {
            errors.push({ message: "Passwords do not match" });
        }

        if (errors.length > 0) {
            res.render("register", { errors });
        } else {

            pool.query(
                `SELECT * FROM user_registration
              WHERE email_id = $1`,
                [coach_email],
                (err, results) => {
                    if (err) {
                        console.log(err);
                    }
                    console.log(results.rows);

                    if (results.rows.length > 0) {
                        return res.render("register", {
                            message: "Email already registered"
                        });
                    } else {
                        pool.query(
                            'INSERT INTO user_registration (user_name,email_id,mobile_no,club_name,club_address,login_id,paswword,status,created_by,created_on,iscoach) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)', [coach_name, coach_email, coach_mobile, coach_cname, coach_caddr, coach_uname, hashedPassword, coach_status, created_by, created_on, isCoach],
                            (error, results) => {
                                if (error) {
                                    throw error
                                }

                                console.log("New coach added")
                                res.redirect('/login')

                            },

                        );
                    }
                }
            );
        }

    }
    catch{
        res.redirect('/register')
    }
})


app.get('/studentreg', isCoach, (req, res) => {
    res.render('studentreg')
    clearInterval(interval);
})


app.post('/studentreg', async (req, res) => {

    try {
        console.log(req.body)
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        const category = req.body.categories
        const pname = req.body.pname
        const fname = req.body.fname
        const mname = req.body.mname
        const dob = req.body.dob
        const gender = req.body.gender
        const mobile = req.body.mobile
        const email = req.body.email
        const height = req.body.height
        const weight = req.body.weight
        const waist = req.body.waist
        const tshirt = req.body.tshirt
        const address = req.body.addr
        const username = req.body.username
        const coach_name = req.user.user_name
        const created_by = req.user.user_name
        const created_on = dt.format('Y-m-d H:M:S');
        const isPlayer = true
        console.log(created_on);

        pool.query(
            'INSERT INTO user_registration (player_category,user_name,fathr_name,mother_name,dob,sex,mobile_no,email_id,height,weight,waist_size,t_shirt_size,residential_address,login_id,paswword,coach_name,created_by,created_on,isplayer) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)', [category, pname, fname, mname, dob, gender, mobile, email, height, weight, waist, tshirt, address, username, hashedPassword, coach_name, created_by, created_on, isPlayer],
            (error, results) => {
                if (error) {
                    throw error
                }

                console.log("New player added")
            },

        )
        res.send("New Player Added")
        res.redirect('/home')
    }
    catch{
        res.redirect('/studentreg')
    }
})


app.get('/update', isCoach, (req, res) => {
    pool.query(
        'SELECT user_name FROM user_registration WHERE coach_name LIKE $1', [req.user.user_name],
        (error, results) => {
            if (error) {
                throw error
            }
            clearInterval(interval);
            res.render('update', { data: results.rows })

        },

    )
})


app.post('/update', async (req, res) => {
    try {
        console.log(req.body)
        pool.query(
            'UPDATE user_registration SET device_id = $1 WHERE user_name like $2 RETURNING *', [req.body.d_id, req.body.player],
            (error, results) => {
                if (error) {
                    throw error
                }
                console.log("Device updated")
                res.redirect('home')

            },

        )
    }
    catch{
        res.redirect('/update')
    }
})

app.get("/logout", (req, res) => {
    req.logout();
    res.render("logout", { message: "You have logged out successfully" });
    clearInterval(interval)
});

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }

    res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/')
    }
    next()
}

const user = (request, response) => {
    pool.query(
        'SELECT * FROM user_registration',
        // 'SELECT * FROM coach_registration WHERE email_id LIKE $1', ['rahul@gmail.com'],
        (error, results) => {
            if (error) {
                throw error
            }

            response.status(200).json(results.rows)
        },

    )
}

app.get('/user', user)

function isCoach(req, res, next) {
    if (req.user.iscoach === true) {
        console.log("Coach True")
        return next()
    }
    console.log("Coach False")
    res.redirect('/login')
}