//var app = angular.module('FishTankApp', [ 'ngRoute', 'ui.bootstrap']);
var app = angular.module('FishTankApp', [ 'highcharts-ng', 'ngRoute', 'ui.bootstrap']);


// var chartjs = require('chart.js');
// configure our routes
app.config(function($routeProvider) {
	$routeProvider

	// route for the home page
		.when('/', {
			templateUrl: 'pages/home.html',
			controller: 'mainController'
		})
		// route for the home page
		.when('/home', {
			templateUrl: 'pages/home.html',
			controller: 'mainController'
		})

	// route for the about page
	.when('/about', {
		templateUrl: 'pages/about.html',
		controller: 'aboutController'
	})

	// route for the setings page
	.when('/setings', {
		templateUrl: 'pages/setings.html',
		controller: 'setingsController'
	})

	// route for the controls page
	.when('/controls', {
		templateUrl: 'pages/controls.html',
		controller: 'controlsController'
	})
	
	// route for the statistics page
	.when('/statistics', {
		templateUrl: 'pages/statistics.html',
		controller: 'statisticsController'
	});
});

// create the controller and inject Angular's $scope
app.controller('mainController', function($scope) {
	// create a message to display in our view
	$scope.message = 'Everyone come and see how good I look!';
	var request = new XMLHttpRequest();

	function post(url) {
		request.open('POST', url, true);
		request.addEventListener("load", transferComplete);
		request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
		// request.timeout=200
		request.send({});
		$scope.errcode = request.status;
		$scope.t1 = request.responseText;

	}

	function transferComplete(event) {
		$scope.t1 = request.responseText;
		$scope.myFieldLabel = request.responseText;

  // var g = new JustGage({
  //   id: "gauge",
  //   value: 67,
  //   min: 0,
  //   max: 100,
  //   title: "Visitors"
  // });
  // 
  
 
  
  // 
  
	}
	$scope.getTemp = function() {
		post("/api/sensor/temp/tank2");

	};
	


  //$scope.labels = ["January", "February", "March", "April", "May", "June", "July"];
  //$scope.series = ['Series A', 'Series B'];
  //$scope.data = [
  //  [65, 59, 80, 81, 56, 55, 40],
  //  [28, 48, 40, 19, 86, 27, 90]
  //];
  //$scope.onClick = function (points, evt) {
  //  console.log(points, evt);
  //};
  

});

app.controller('aboutController', function($scope) {
	$scope.message = 'About! I am an about page.';
});

app.controller('controlsController', function($scope) {
	$scope.message = 'Controls. This is just a demo.';
	// // post
	function post(url) {
		var request = new XMLHttpRequest();
		request.open('POST', url, true);
		request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
		request.send({});
	}

	$scope.lightON = function() {
		post("/api/light/day/on");
	};

	$scope.lightOFF = function() {
		post("/api/light/day/off");
	};

});

app.controller('setingsController', function($scope) {
	$scope.message = 'setings bla bla .just a demo.';
});

app.controller('statisticsController', function($scope) {
	$scope.message = 'Statistics!.';
	
	//
 //$scope.addPoints = function () {
 //       var seriesArray = $scope.chartConfig.series
 //       var rndIdx = Math.floor(Math.random() * seriesArray.length);
 //       seriesArray[rndIdx].data = seriesArray[rndIdx].data.concat([1, 10, 20])
 //   };

 //   $scope.addSeries = function () {
 //       var rnd = []
 //       for (var i = 0; i < 10; i++) {
 //           rnd.push(Math.floor(Math.random() * 20) + 1)
 //       }
 //       $scope.chartConfig.series.push({
 //           data: rnd
 //       })
 //   }

 //   $scope.removeRandomSeries = function () {
 //       var seriesArray = $scope.chartConfig.series
 //       var rndIdx = Math.floor(Math.random() * seriesArray.length);
 //       seriesArray.splice(rndIdx, 1)
 //   }

 //   $scope.swapChartType = function () {
 //       if (this.chartConfig.options.chart.type === 'line') {
 //           this.chartConfig.options.chart.type = 'bar'
 //       } else {
 //           this.chartConfig.options.chart.type = 'line'
 //           this.chartConfig.options.chart.zoomType = 'x'
 //       }
 //   }

 //   $scope.toggleLoading = function () {
 //       this.chartConfig.loading = !this.chartConfig.loading
 //   }

    $scope.chartConfig = {
        options: {
            chart: {
                type: 'line'
            }
        },
        series: [{
            data: [22, 22, 21, 19, 17, 16, 20, 23,24,25,23]
        },
        		{
            data: [21, 22, 20, 20, 20, 19, 20, 23,24,25,26]
        }],
        title: {
            text: 'Aquaruim temperature'
        },

        loading: false
    }
    
    $scope.chart_gauge_1 = function () {
        if (!chart_gauge_1.renderer.forExport) {
            setInterval(function () {
                var point = chart_gauge_1.series[0].points[0],
                    newVal,
                    inc = Math.round((Math.random() - 0.5) * 20);

                newVal = point.y + inc;
                if (newVal < 0 || newVal > 200) {
                    newVal = point.y - inc;
                }

                point.update(newVal);

            }, 3000);
        }
    };
    
     $scope.chartConfig_solid = {
        options: {
            chart: {
                type: 'gauge'
            },
            pane: {
                center: ['50%', '85%'],
                size: '140%',
                startAngle: -90,
                endAngle: 90,
                background: {
                    backgroundColor:'#EEE',
                    innerRadius: '60%',
                    outerRadius: '100%',
                    shape: 'arc'
                }
            },
            solidgauge: {
                dataLabels: {
                    y: -30,
                    borderWidth: 0,
                    useHTML: true
                }
            }
        },
        series: [{
            data: [16],
            dataLabels: {
	        	format: '<div style="text-align:center"><span style="font-size:25px;color:black">{y}</span><br/>' + 
                   	'<span style="font-size:12px;color:silver">km/h</span></div>'
	        }
        }],
        title: {
            text: 'Solid Gauge',
            y: 50
        },
        yAxis: {
            currentMin: 0,
            currentMax: 40,
            title: {
                y: 140
            },  
        //     plotBands: [
        //     	{
        //         from: 0,
        //         to: 18,
        //         color: '#DF5353' // red
        //     }, {
        //         from: 18,
        //         to: 20,
        //         color: '#DDDF0D' // yellow
                
        //     }, {
        //         from: 20,
        //         to: 25,
        //         color: '#55BF3B' // green
        //     }, {
        //         from: 25,
        //         to: 40,
        //         color: '#DF5353' // red
        //     }]
        // },
			stops: [
                [0.1, '#DF5353'], // red
	        	[0.5, '#DDDF0D'], // yellow
	        	[0.9, '#55BF3B'] // green
			],
			lineWidth: 0,
            tickInterval: 20,
            tickPixelInterval: 400,
            tickWidth: 0,
            labels: {
                y: 15
            }   
        },
        loading: false
    }
     $scope.chartConfig_gauge = {
     	options: {
                  chart: {
            type: 'gauge',
            plotBackgroundColor: null,
            plotBackgroundImage: null,
            plotBorderWidth: 0,
            plotShadow: false
        },

        title: {
            text: 'Speedometer'
        },

        pane: {
            startAngle: -150,
            endAngle: 150,
            background: [{
                backgroundColor: {
                    linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                    stops: [
                        [0, '#FFF'],
                        [1, '#333']
                    ]
                },
                borderWidth: 0,
                outerRadius: '109%'
            }, {
                backgroundColor: {
                    linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                    stops: [
                        [0, '#333'],
                        [1, '#FFF']
                    ]
                },
                borderWidth: 1,
                outerRadius: '107%'
            }, {
                // default background
            }, {
                backgroundColor: '#DDD',
                borderWidth: 0,
                outerRadius: '105%',
                innerRadius: '103%'
            }]
        },

        // the value axis
        yAxis: {
            min: 0,
            max: 40,

            minorTickInterval: 'auto',
            minorTickWidth: 1,
            minorTickLength: 10,
            minorTickPosition: 'inside',
            minorTickColor: '#666',

            tickPixelInterval: 30,
            tickWidth: 2,
            tickPosition: 'inside',
            tickLength: 10,
            tickColor: '#666',
            labels: {
                step: 2,
                rotation: 'auto'
            },
            title: {
                text: 'km/h'
            },
            plotBands: [
            	{
                from: 0,
                to: 18,
                color: '#DF5353' // red
            }, {
                from: 18,
                to: 20,
                color: '#55BF3B' // green
            }, {
                from: 20,
                to: 25,
                color: '#DDDF0D' // yellow
            }, {
                from: 25,
                to: 40,
                color: '#DF5353' // red
            }]
        },

        series: [{
            name: 'Speed',
            data: [80],
            tooltip: {
                valueSuffix: ' km/h'
            }
        }]

     	}}
});
//
///
////
/////

/////
////
//
// app.controller("mainController", function ($scope) {

// // Tabs

//     $scope.tabs = [{
//         title: 'Dynamic Title 1',
//         content: 'Dynamic content 1'
//     }, {
//         title: 'Dynamic Title 2',
//         content: 'Dynamic content 2',
//         disabled: true
//     }];

//     $scope.alertMe = function () {
//         setTimeout(function () {
//             $window.alert('You\'ve selected the alert tab!');
//         });
//     };

//     $scope.thirdTabCallback = function () {
//         $scope.test = 'I\'m the third tab callback';

//         $scope.clickme = function () {
//             $window.alert('third tab only function');
//         };
//     };



// // post
//function post(url)
//{
//	var request = new XMLHttpRequest();
//	request.open('POST', url, true);
//	request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
//	request.send({});
//}

// $scope.lightON = function() {
// post("/api/light/day/on");
// };

// $scope.lightOFF = function() {
// post("/api/light/day/off");
// };

// });
