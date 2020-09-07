if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}
const express = require('express')
const app = express()
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');


var dateTime = require('node-datetime');

const { Pool, Client } = require('pg')

const pool = new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DB,
    password: process.env.PG_PW,
    port: process.env.PG_PORT,
})


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






app.get('/s3', gets3)

const server = app.listen(port, () => {
    console.log(`App running on port ${port}.`)
})




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
var Lastid = null
var LastSpeed = null
var BowlCount = 0



function myFun() {


    now = Date.now()
    console.log(now)
    var dt = dateTime.create(now);
    var formattedDate = dt.format('Y-m-d H:M:S.N');
    console.log("Current Time")
    console.log(formattedDate)


    console.log(Lastid)
    sensor3 = sensorQuery3.rows[0];
    console.log(sensor3.speed);
    var id = sensor3.serial_no;
    var sensor_id = sensor3.id;
    var speed = sensor3.speed;

    sensor2 = sensorQuery2.rows;
    //console.log(sensorQuery2.rows[0].id)
    //console.log(sensorQuery2.rows[0].serial_no)
    sensor3 = sensorQuery3.rows;
    //console.log(sensorQuery3.rows[0].id)



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


    if (id > Lastid) {
        DelSpeed = LastSpeed - speed;
        if (DelSpeed > 6) {
            BowlCount += 1;

            console.log(BowlCount)
            pool.query(
                'INSERT INTO bowl_result (id,rotation,hyper_extension,posteriorly_rotated,feed_time,speed) VALUES ($1,$2,$3,$4,$5,$6)', [sensor_id, avg1, avg2, avg3, formattedDate, LastSpeed],
                (error, results) => {
                    if (error) {
                        throw error
                    }

                    console.log("New bowl added")

                },

            );
        }
    }

    Lastid = null
    LastSpeed = null
    Lastid = id
    LastSpeed = speed
    console.log(Lastid)


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
setInterval(queryFunction, 1000, 3);

// setInterval(queryFunction, 1000);


const getres = (request, response) => {



    const id = 3
    pool.query(
        'SELECT * FROM bowl_result',
        (error, results) => {
            if (error) {
                throw error
            }

            response.status(200).json(results.rows)

        },

    )
}






app.get('/rep', getres)