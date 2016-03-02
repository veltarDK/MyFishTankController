var express = require('express');
var app = express(); // express
var mongoose = require('mongoose'); // mongoose for mongodb
var morgan = require('morgan'); // log requests to the console (express4)
var bodyParser = require('body-parser'); // pull information from HTML POST (express4)
var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)
var async = require('async');
//var gpio = require('pi-gpio');
var config = require('./config');
var sensor = require('ds18x20'); // temperature sensor library
var schedule = require('node-schedule'); // cron scheduller
var moment = require('moment');
var winston = require('winston');
//
/////////////////////////////////////
//
//      Logger
//
/////////////////////////////////////
var logger = new(winston.Logger)({
    transports: [
        new(winston.transports.Console)({
            colorize: true,
            handleExceptions: true,
            json: false,
            timestamp: function() {
                return moment().format("MM-DD-YYYY HH:mm:ss");
            },
            formatter: function(options) {
                // Return string will be passed to logger.
                return '{' + options.timestamp() + '} [' + options.level.toUpperCase() + '] ' + (undefined !== options.message ? options.message : '') +
                    (options.meta && Object.keys(options.meta).length ? '\n\t' + JSON.stringify(options.meta) : '');
            }
        }),
        new(winston.transports.File)({
            filename: 'serverLog.log',
            handleExceptions: true,
            json: true,
            maxsize: 5242880, //5MB
            maxFiles: 5,
            colorize: false,
            timestamp: function() {
                return moment().format("MM-DD-YYYY HH:mm:ss");
            },
            formatter: function(options) {
                // Return string will be passed to logger.
                return '{' + options.timestamp() + '} [' + options.level.toUpperCase() + '] ' + (undefined !== options.message ? options.message : '') +
                    (options.meta && Object.keys(options.meta).length ? '\n\t' + JSON.stringify(options.meta) : '');
            }

        })
    ]
});
logger.stream = {
    write: function(message, encoding) {
        logger.info(message);
    }
};
//
////////////////////////////////////////////////////////////////////////////////
//
// configuration
//
////////////////////////////////////////////////////////////////////////////////


app.use(express.static(__dirname + '/public')); // set the static files location /public/img will be /img for users

app.use(require("morgan")("combined", {
    "stream": logger.stream
}));
app.use(bodyParser.urlencoded({
    'extended': 'true'
})); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
// app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(methodOverride());

// listen (start app with node server.js) ======================================


//
app.listen(process.env.PORT, process.env.IP, function() {
    logger.info('Example server listening on port ' + process.env.PORT + ' IP ' + process.env.IP);
    Initialize();
});


function Initialize() {
    moment().format("HH:mm");

    //
    //get current time
    //
    logger.info("current hour is " + moment().format("HH"));

    var c_hour = moment().format("HH");

    if (c_hour > config.SUNRISE_HOUR && c_hour < config.SUNSET_HOUR) {
        //
        logger.info("determine day. " + moment().format("HH:mm"));
        // OpenP1();
    }
    else {
        logger.info("determine night. " + moment().format("HH:mm"));
        // OpenP2();
    }
    //
    //enqueue timers
    //
    // morning rule
    var morning_rule = new schedule.RecurrenceRule();
    morning_rule.dayOfWeek = [0, new schedule.Range(1, 6)];
    morning_rule.hour = config.SUNRISE_HOUR;
    morning_rule.minute = config.SUNRISE_MINUTES;
    schedule.scheduleJob(morning_rule, function() {
        OpenP1();
        logger.info('Sunrise! ;)');
    });

    //
    //evening rule
    var evening_rule = new schedule.RecurrenceRule();
    evening_rule.dayOfWeek = [0, new schedule.Range(1, 6)];
    evening_rule.hour = config.SUNRISE_HOUR;
    evening_rule.minute = config.SUNRISE_MINUTES;
    schedule.scheduleJob(evening_rule, function() {
        OpenP2();
        logger.info('Sunset! ;)');
    });


    //
    //15minutes temp rule
    var temp_15_rule = new schedule.RecurrenceRule();
    // temp_15_rule.dayOfWeek = [0, new schedule.Range(1, 6)];
    temp_15_rule.minute = new schedule.Range(0, 59, 15);
    schedule.scheduleJob(temp_15_rule, function() {
        ReadTemp_dump2();
        ReadTemp_dump();
        logger.debug('15 minutes rule fired!');
        logger.info('getSave temp! ;)');
    });
    //
    //
    //check modules
    //
    //
    var isLoaded = sensor.isDriverLoaded();
    logger.info("Temperature sensor library loaded: " + isLoaded);

    if (isLoaded) {
        var listOfDeviceIds = sensor.list();
        logger.info("Temp sensors: " + listOfDeviceIds);
        sensor.getAll(function(err, tempObj) {
            logger.info(err, tempObj);
        });
        //28-000002f793b9': 24.6, '28-000002f79457': 21.3
        //
        //
    }

    // Retrieve
    // var MongoClient = require('mongodb').MongoClient;
    mongoose.connect('mongodb://'+process.env.IP);


    var db = mongoose.connection;
    db.on('connecting', function() {
        logger.info("trying to establish a connection to mongo");
    });

    db.on('connected', function() {
        logger.info("connection to mongo established successfully");
    });

    db.on('error', function(err) {
        logger.error('connection to mongo failed ' + err);
    });

    db.on('disconnected', function() {
        logger.info('mongo db connection closed');
    })

    logger.info("Initialization - Done.")




}

var Schema = mongoose.Schema;

var Temp = new Schema({
    value: Number,
    time: Date
});



//turnONp1
function OpenP1(callback) {
    // open PIN
    gpio.open(config.DAY_LIGHT_PIN, "output", WriteP1);
    logger.info('pin ' + config.DAY_LIGHT_PIN + ' opened. On');
}

function WriteP1(callback) {
    //gpio.setup(config.DAY_LIGHT_PIN, gpio.DIR_OUT);
    logger.info('came to 2');
    gpio.write(config.DAY_LIGHT_PIN, config.RELAY_ON);
    logger.info('Written to pin. On');
}




//turnOFFp1
function OpenP2(callback) {
    // open PIN
    gpio.open(config.DAY_LIGHT_PIN, "output", WriteP2);
    logger.info('pin opened. Off');
}

function WriteP2(callback) {
    gpio.write(config.DAY_LIGHT_PIN, config.RELAY_OFF);
    logger.info('Written to pin. Off');
}



function CloseP1(callback) {
    gpio.close(config.DAY_LIGHT_PIN, function() {
        logger.info('pin closed.On');
    });
}



app.get("/api/light/day/on", function(req, res){
    logger.info("GET /api/light/day/on");
});



app.post("/api/light/day/on", function(req, res) {
    logger.info("POST /api/light/day/on");
    async.series(
        [
            // OpenP1
        ],
        function(err, results) {
            logger.info(err + " All functions finished.");
        }
    );
});


app.post("/api/light/day/off", function(req, res) {
    logger.info("/api/light/day/off");
    async.series(
        [
            // OpenP2
        ],
        function(err, results) {
            logger.info(err + " All functions finished.");
        }
    );

});


//
//
// Temp section
//
function ReadT2(res, callback) {
    var temp = 666;
    logger.info("Requested temp value is:" + temp);
    res.send(temp);
    // res = temp;
}

app.get("api/sensor/temps", function(req, res) {
    var t1 = 23;
    var t2 = 25;
    logger.info("Get temps.");
    res.status = 405;
    res.send({t1, t2});
    
})

app.post("/api/sensor/temp/tank2", function(req, res) {
    var temp = 666;
    var t_probe = 1;
    logger.info("Requested temp value is:" + temp);
    res.status = 405;
    //                res.
    res.send(t_probe + ' ' + temp);

    // async.series(
    //         [
    //          ReadT2()
    //         ], function (err, results) {
    //                 console.log(err + " All functions finished.");
    //                 }
    //         );
});

function ReadTemp_dump() {

    var tempModel = mongoose.model('Temp1', Temp);

    var temp1 = new tempModel();
    var mes_temp;
    sensor.get('28-000002f793b9', function(err, mes_temp) {
        logger.info('temp sensor 1 returned: ' + mes_temp);

        temp1.value = mes_temp;
        temp1.time = moment().format();
        temp1.save(function(err) {
            if (err) throw err;

            logger.info('Temp saved successfully!');
        });

        //
        //
        //
        // get all the users
        // tempModel.find({}, function(err, temps) {
        //     if (err) throw err;

        //     // object of all the users
        //     logger.info(temps);
        // });
    });
}


function ReadTemp_dump2() {

    var tempModel = mongoose.model('Temp2', Temp);

    var temp1 = new tempModel();
    var mes_temp;
    sensor.get('28-000002f79457', function(err, mes_temp) {
        logger.info('temp sensor 1 returned: ' + mes_temp);

        temp1.value = mes_temp;
        temp1.time = moment().format();
        temp1.save(function(err) {
            if (err) throw err;

            logger.info('Temp 2 saved successfully!');
        });

        //
        //
        //
        // get all the users
        // tempModel.find({}, function(err, temps) {
        //     if (err) throw err;

        //     // object of all the users
        //     logger.info(temps);
        // });
    });
}


// var Temp_timeseries = new Schema({
//     timestamp_month: Date,
//     type: "Temperature measurements",
//         values: {
//             0: {
//                 0: Number, 1: Number, 2: Number, 3: Number, 4: Number, 5: Number,
//                 6: Number, 7: Number, 8: Number, 9: Number, 10: Number, 11: Number,
//                 12: Number, 13: Number, 14: Number, 15: Number, 16: Number,
//                 17: Number, 18: Number, 19: Number, 20: Number, 21: Number,
//                 22: Number, 23: Number
//             },
//             1: {
//                 0: Number, 1: Number, 2: Number, 3: Number, 4: Number, 5: Number,
//                 6: Number, 7: Number, 8: Number, 9: Number, 10: Number, 11: Number,
//                 12: Number, 13: Number, 14: Number, 15: Number, 16: Number,
//                 17: Number, 18: Number, 19: Number, 20: Number, 21: Number,
//                 22: Number, 23: Number
//             },
//             2: {
//                 0: Number, 1: Number, 2: Number, 3: Number, 4: Number, 5: Number,
//                 6: Number, 7: Number, 8: Number, 9: Number, 10: Number, 11: Number,
//                 12: Number, 13: Number, 14: Number, 15: Number, 16: Number,
//                 17: Number, 18: Number, 19: Number, 20: Number, 21: Number,
//                 22: Number, 23: Number
//             },
//             3:  {
//                 0: Number, 1: Number, 2: Number, 3: Number, 4: Number, 5: Number,
//                 6: Number, 7: Number, 8: Number, 9: Number, 10: Number, 11: Number,
//                 12: Number, 13: Number, 14: Number, 15: Number, 16: Number,
//                 17: Number, 18: Number, 19: Number, 20: Number, 21: Number,
//                 22: Number, 23: Number
//             },
//             4: {
//                 0: Number, 1: Number, 2: Number, 3: Number, 4: Number, 5: Number,
//                 6: Number, 7: Number, 8: Number, 9: Number, 10: Number, 11: Number,
//                 12: Number, 13: Number, 14: Number, 15: Number, 16: Number,
//                 17: Number, 18: Number, 19: Number, 20: Number, 21: Number,
//                 22: Number, 23: Number
//             },
//             5: {
//                 0: Number, 1: Number, 2: Number, 3: Number, 4: Number, 5: Number,
//                 6: Number, 7: Number, 8: Number, 9: Number, 10: Number, 11: Number,
//                 12: Number, 13: Number, 14: Number, 15: Number, 16: Number,
//                 17: Number, 18: Number, 19: Number, 20: Number, 21: Number,
//                 22: Number, 23: Number
//             },
//             6:  {
//                 0: Number, 1: Number, 2: Number, 3: Number, 4: Number, 5: Number,
//                 6: Number, 7: Number, 8: Number, 9: Number, 10: Number, 11: Number,
//                 12: Number, 13: Number, 14: Number, 15: Number, 16: Number,
//                 17: Number, 18: Number, 19: Number, 20: Number, 21: Number,
//                 22: Number, 23: Number
//             },
//             7:  {
//                 0: Number, 1: Number, 2: Number, 3: Number, 4: Number, 5: Number,
//                 6: Number, 7: Number, 8: Number, 9: Number, 10: Number, 11: Number,
//                 12: Number, 13: Number, 14: Number, 15: Number, 16: Number,
//                 17: Number, 18: Number, 19: Number, 20: Number, 21: Number,
//                 22: Number, 23: Number
//             },
//             8: {
//                 0: Number, 1: Number, 2: Number, 3: Number, 4: Number, 5: Number,
//                 6: Number, 7: Number, 8: Number, 9: Number, 10: Number, 11: Number,
//                 12: Number, 13: Number, 14: Number, 15: Number, 16: Number,
//                 17: Number, 18: Number, 19: Number, 20: Number, 21: Number,
//                 22: Number, 23: Number
//             },
//             9: {
//                 0: Number, 1: Number, 2: Number, 3: Number, 4: Number, 5: Number,
//                 6: Number, 7: Number, 8: Number, 9: Number, 10: Number, 11: Number,
//                 12: Number, 13: Number, 14: Number, 15: Number, 16: Number,
//                 17: Number, 18: Number, 19: Number, 20: Number, 21: Number,
//                 22: Number, 23: Number
//             },
//             10: {
//                 0: Number, 1: Number, 2: Number, 3: Number, 4: Number, 5: Number,
//                 6: Number, 7: Number, 8: Number, 9: Number, 10: Number, 11: Number,
//                 12: Number, 13: Number, 14: Number, 15: Number, 16: Number,
//                 17: Number, 18: Number, 19: Number, 20: Number, 21: Number,
//                 22: Number, 23: Number
//             },
//             11: {
//                 0: Number, 1: Number, 2: Number, 3: Number, 4: Number, 5: Number,
//                 6: Number, 7: Number, 8: Number, 9: Number, 10: Number, 11: Number,
//                 12: Number, 13: Number, 14: Number, 15: Number, 16: Number,
//                 17: Number, 18: Number, 19: Number, 20: Number, 21: Number,
//                 22: Number, 23: Number
//             },
//             12: {
//                 0: Number, 1: Number, 2: Number, 3: Number, 4: Number, 5: Number,
//                 6: Number, 7: Number, 8: Number, 9: Number, 10: Number, 11: Number,
//                 12: Number, 13: Number, 14: Number, 15: Number, 16: Number,
//                 17: Number, 18: Number, 19: Number, 20: Number, 21: Number,
//                 22: Number, 23: Number
//             },
//             13: {
//                 0: Number, 1: Number, 2: Number, 3: Number, 4: Number, 5: Number,
//                 6: Number, 7: Number, 8: Number, 9: Number, 10: Number, 11: Number,
//                 12: Number, 13: Number, 14: Number, 15: Number, 16: Number,
//                 17: Number, 18: Number, 19: Number, 20: Number, 21: Number,
//                 22: Number, 23: Number
//             },
//             14: {
//                 0: Number, 1: Number, 2: Number, 3: Number, 4: Number, 5: Number,
//                 6: Number, 7: Number, 8: Number, 9: Number, 10: Number, 11: Number,
//                 12: Number, 13: Number, 14: Number, 15: Number, 16: Number,
//                 17: Number, 18: Number, 19: Number, 20: Number, 21: Number,
//                 22: Number, 23: Number
//             },
//             15: {
//                 0: Number, 1: Number, 2: Number, 3: Number, 4: Number, 5: Number,
//                 6: Number, 7: Number, 8: Number, 9: Number, 10: Number, 11: Number,
//                 12: Number, 13: Number, 14: Number, 15: Number, 16: Number,
//                 17: Number, 18: Number, 19: Number, 20: Number, 21: Number,
//                 22: Number, 23: Number
//             },
//             16: {
//                 0: Number, 1: Number, 2: Number, 3: Number, 4: Number, 5: Number,
//                 6: Number, 7: Number, 8: Number, 9: Number, 10: Number, 11: Number,
//                 12: Number, 13: Number, 14: Number, 15: Number, 16: Number,
//                 17: Number, 18: Number, 19: Number, 20: Number, 21: Number,
//                 22: Number, 23: Number
//             },
//             17: {
//                 0: Number, 1: Number, 2: Number, 3: Number, 4: Number, 5: Number,
//                 6: Number, 7: Number, 8: Number, 9: Number, 10: Number, 11: Number,
//                 12: Number, 13: Number, 14: Number, 15: Number, 16: Number,
//                 17: Number, 18: Number, 19: Number, 20: Number, 21: Number,
//                 22: Number, 23: Number
//             },
//             18: {
//                 0: Number, 1: Number, 2: Number, 3: Number, 4: Number, 5: Number,
//                 6: Number, 7: Number, 8: Number, 9: Number, 10: Number, 11: Number,
//                 12: Number, 13: Number, 14: Number, 15: Number, 16: Number,
//                 17: Number, 18: Number, 19: Number, 20: Number, 21: Number,
//                 22: Number, 23: Number
//             },
//             19: {
//                 0: Number, 1: Number, 2: Number, 3: Number, 4: Number, 5: Number,
//                 6: Number, 7: Number, 8: Number, 9: Number, 10: Number, 11: Number,
//                 12: Number, 13: Number, 14: Number, 15: Number, 16: Number,
//                 17: Number, 18: Number, 19: Number, 20: Number, 21: Number,
//                 22: Number, 23: Number
//             },
//             20: {
//                 0: Number, 1: Number, 2: Number, 3: Number, 4: Number, 5: Number,
//                 6: Number, 7: Number, 8: Number, 9: Number, 10: Number, 11: Number,
//                 12: Number, 13: Number, 14: Number, 15: Number, 16: Number,
//                 17: Number, 18: Number, 19: Number, 20: Number, 21: Number,
//                 22: Number, 23: Number
//             },
//             21: {
//                 0: Number, 1: Number, 2: Number, 3: Number, 4: Number, 5: Number,
//                 6: Number, 7: Number, 8: Number, 9: Number, 10: Number, 11: Number,
//                 12: Number, 13: Number, 14: Number, 15: Number, 16: Number,
//                 17: Number, 18: Number, 19: Number, 20: Number, 21: Number,
//                 22: Number, 23: Number
//             },
//             22: {
//                 0: Number, 1: Number, 2: Number, 3: Number, 4: Number, 5: Number,
//                 6: Number, 7: Number, 8: Number, 9: Number, 10: Number, 11: Number,
//                 12: Number, 13: Number, 14: Number, 15: Number, 16: Number,
//                 17: Number, 18: Number, 19: Number, 20: Number, 21: Number,
//                 22: Number, 23: Number
//             },
//             23: {
//                 0: Number, 1: Number, 2: Number, 3: Number, 4: Number, 5: Number,
//                 6: Number, 7: Number, 8: Number, 9: Number, 10: Number, 11: Number,
//                 12: Number, 13: Number, 14: Number, 15: Number, 16: Number,
//                 17: Number, 18: Number, 19: Number, 20: Number, 21: Number,
//                 22: Number, 23: Number
//             },
//             24: {
//                 0: Number, 1: Number, 2: Number, 3: Number, 4: Number, 5: Number,
//                 6: Number, 7: Number, 8: Number, 9: Number, 10: Number, 11: Number,
//                 12: Number, 13: Number, 14: Number, 15: Number, 16: Number,
//                 17: Number, 18: Number, 19: Number, 20: Number, 21: Number,
//                 22: Number, 23: Number
//             },
//             25: {
//                 0: Number, 1: Number, 2: Number, 3: Number, 4: Number, 5: Number,
//                 6: Number, 7: Number, 8: Number, 9: Number, 10: Number, 11: Number,
//                 12: Number, 13: Number, 14: Number, 15: Number, 16: Number,
//                 17: Number, 18: Number, 19: Number, 20: Number, 21: Number,
//                 22: Number, 23: Number
//             },
//             26: {
//                 0: Number, 1: Number, 2: Number, 3: Number, 4: Number, 5: Number,
//                 6: Number, 7: Number, 8: Number, 9: Number, 10: Number, 11: Number,
//                 12: Number, 13: Number, 14: Number, 15: Number, 16: Number,
//                 17: Number, 18: Number, 19: Number, 20: Number, 21: Number,
//                 22: Number, 23: Number
//             },
//             27: {
//                 0: Number, 1: Number, 2: Number, 3: Number, 4: Number, 5: Number,
//                 6: Number, 7: Number, 8: Number, 9: Number, 10: Number, 11: Number,
//                 12: Number, 13: Number, 14: Number, 15: Number, 16: Number,
//                 17: Number, 18: Number, 19: Number, 20: Number, 21: Number,
//                 22: Number, 23: Number
//             },
//             28: {
//                 0: Number, 1: Number, 2: Number, 3: Number, 4: Number, 5: Number,
//                 6: Number, 7: Number, 8: Number, 9: Number, 10: Number, 11: Number,
//                 12: Number, 13: Number, 14: Number, 15: Number, 16: Number,
//                 17: Number, 18: Number, 19: Number, 20: Number, 21: Number,
//                 22: Number, 23: Number
//             },
//             29: {
//                 0: Number, 1: Number, 2: Number, 3: Number, 4: Number, 5: Number,
//                 6: Number, 7: Number, 8: Number, 9: Number, 10: Number, 11: Number,
//                 12: Number, 13: Number, 14: Number, 15: Number, 16: Number,
//                 17: Number, 18: Number, 19: Number, 20: Number, 21: Number,
//                 22: Number, 23: Number
//             },
//             30: {
//                 0: Number, 1: Number, 2: Number, 3: Number, 4: Number, 5: Number,
//                 6: Number, 7: Number, 8: Number, 9: Number, 10: Number, 11: Number,
//                 12: Number, 13: Number, 14: Number, 15: Number, 16: Number,
//                 17: Number, 18: Number, 19: Number, 20: Number, 21: Number,
//                 22: Number, 23: Number
//             }
            
        
//     }
// });

function dumpTemp(id, tempValue) {
  switch (id){
      case 0:
          //dump temp1
          var tempModel = mongoose.model('Temp1_ts_'+moment().format('MM'), Temp_timeseries);

          var temp1_ts =  mongoose.
          temp1_ts.
          break;
      case 1:
          //dump temp2
          break;
  }   
}