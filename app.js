var express = require('express'),
	path = require('path'),
	config = require('./config'),
	async = require('async'),
	gpio = require('pi-gpio'),
	app = express();

app.set('port', process.env.PORT || 3000);

app.use('/', express.static(__dirname + '/public'));

app.get("/api/ping", function(req, res)
{
	res.json("pong");
}
);


//gpio.setup(config.DAY_LIGHT_PIN, gpio.DIR_OUT, WriteP1);

//turnONp1
function OpenP1(callback)
                        {
                                // open PIN
                                gpio.open(config.DAY_LIGHT_PIN, "output", WriteP1);
                                console.log('pin opened. On');
                        }

function WriteP1(callback)
                        {
//gpio.setup(config.DAY_LIGHT_PIN, gpio.DIR_OUT);
                                console.log('came to 2');
                                gpio.write(config.DAY_LIGHT_PIN, config.RELAY_ON);
                                console.log('Written to pin. On');
                        }




//turnOFFp1
function OpenP2(callback)
                        {
                                // open PIN
                                gpio.open(config.DAY_LIGHT_PIN, "output", WriteP2);
                                console.log('pin opened. Off');
                        }

function WriteP2(callback)
                        {
                                gpio.write(config.DAY_LIGHT_PIN, config.RELAY_OFF);
                                console.log('Written to pin. Off');
                        }



function CloseP1(callback)
                        {
                                gpio.close(config.DAY_LIGHT_PIN,  function(){
				           console.log('pin closed.On');
});
                        }







app.post("/api/light/day/on", function(req, res)
{
	async.series(
		[
		 OpenP1
		], function (err, results) {
			console.log(err + " All functions finished.");
			}
		);
});


app.post("/api/light/day/off", function(req, res) 
{ 
        async.series(
                [
                 OpenP2
                ], function (err, results) {
                        console.log(err + " All functions finished.");
                        }
                );

});



app.listen(app.get('port'));
