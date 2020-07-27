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
//app.use(express.static('./public'));
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
// wsServer.on('connection', socket => {
//     var data = JSON.stringify({ "first": avg1, "second": avg2, "third": avg3 });
//     setInterval(function () {
//         socket.send(data)
//         console.log(data)
//     }, 2000);

// });


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



app.get('/s3', gets3)
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
var roll3 = [];
var pitch3 = [];
var pitch1 = [];
var avg1 = null;
var avg2 = null;
var avg21 = null;
var avg3 = null;
var avg31 = null;

function myFun() {
    sensor1 = sensorQuery1.rows;
    sensor3 = sensorQuery3.rows;

    for (var i in sensor1) roll1.push((sensor1[i].imu1_roll) + 3.87)
    for (var i in sensor1) roll3.push((sensor3[i].imu3_roll) - 2.1)
    for (var i in sensor3) x.push((roll3[i]) - (roll1[i]))

    for (var i in sensor3) pitch3.push((sensor3[i].imu3_pitch) - 78.5)
    for (var i in sensor1) pitch1.push((sensor1[i].imu1_pitch) - 69.5)
    for (var i in sensor1) y.push((pitch1[i]) - (pitch3[i]))


    //console.log(y)
    console.log(x)

    // sensor3 = sensorQuery3.rows;
    // for (var i in sensor3) y.push((sensor3[i].imu3_roll))

    //console.log(pitch3)



    // diff = y.map(function (num, idx) {
    //     return num - x[idx];
    // });
    //console.log(diff)

    // pitchChange = pitch3.map(function (num, idx) {
    //     return num - pitch1[idx];
    // });

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
    // wss.clients is an array of all connected clients
    wsServer.clients.forEach(function each(client) {
        client.send(data);
        console.log('Sent: ' + data);
    });



    roll1.length = 0
    roll3.length = 0
    x.length = 0
    pitch3.length = 0
    pitch1.length = 0
    y.length = 0


    console.log("Sensor 1:" + sensor1[0].serial_no)
    console.log("Sensor 3:" + sensor3[0].serial_no)

}
setInterval(queryFunction, 1000);
//setInterval(broadcast, 1000);
//queryFunction()

// app.post('/home', function (req, res) {
//     myFun()
//     console.log(avg1)
//     console.log(avg2)
//     console.log(avg3)

//      var data = JSON.stringify({ "first": avg1, "second": avg2, "third": avg3 });
//      res.send(data);

// })

// setInterval(function () {
//     myFun()
//     console.log('Sensor 1: ' + sensorQuery1.rows[0].serial_no)
//     console.log('Sensor 2: ' + sensorQuery3.rows[0].serial_no)
//     console.log(avg1)
//     console.log(avg21)
//     console.log(avg31)
//     console.log(sensorQuery3.rows)
// }, 1000);