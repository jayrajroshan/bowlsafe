const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = process.env.PORT || 3000;
const path = require('path')
var ws = require('ws')

const { Pool, Client } = require('pg')
const { Console } = require('console')


const pool = new Pool({
    user: 'pgbowl',
    host: '180.151.15.18',
    database: 'bowling',
    password: 'pgsql@321#',
    port: 5432,
})

app.set('view engine', 'ejs');
app.use('/public', express.static(path.join(__dirname, 'public')));


app.use(bodyParser.json())
app.use(
    bodyParser.urlencoded({
        extended: true,
    }),
)

app.get('/', (request, response) => {
    response.json({ info: 'Node.js, Express, and Postgres API' })
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
    pool.query(
        'SELECT * FROM sensordata31 ORDER BY serial_no DESC LIMIT 10',
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
        'SELECT * FROM sensordata11 ORDER BY serial_no DESC LIMIT 10',
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



app.get('/home', (req, res) =>
    res.render('speedo'),
)

var sensorQuery1 = null;
var sensorQuery2 = null;
var sensorQuery3 = null;



function queryFunction() {

    pool.query('SELECT * FROM sensordata11 ORDER BY serial_no DESC LIMIT 10', (err, res1) => {
        if (err) throw err
        sensorQuery1 = res1;

        pool.query('SELECT * FROM sensordata21 ORDER BY serial_no DESC LIMIT 10', (err, res2) => {
            if (err) throw err
            sensorQuery2 = res2;

            pool.query('SELECT * FROM sensordata31 ORDER BY serial_no DESC LIMIT 10', (err, res3) => {
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
    sensor3 = sensorQuery3.rows;

    for (var i in sensor2) roll2.push((sensor2[i].imu2_roll) + 9.19)
    for (var i in sensor3) roll3.push((sensor3[i].imu3_roll) - 2.1)
    for (var i in sensor3) x.push((roll3[i]) - (roll2[i]))

    for (var i in sensor3) pitch3.push((sensor3[i].imu3_pitch) - 78.5)
    for (var i in sensor2) pitch2.push((sensor2[i].imu2_pitch) - 72.18)
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


    console.log("Sensor 2:" + sensor2[0].serial_no)
    console.log("Sensor 3:" + sensor3[0].serial_no)

}
setInterval(queryFunction, 1000);
