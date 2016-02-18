var app = angular.module('FishTankApp', ['ngRoute', 'ui.bootstrap','angularCharts']);



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
	$scope.labels = ["January", "February", "March", "April", "May", "June", "July"];
  $scope.series = ['Series A', 'Series B'];
  $scope.data = [
    [65, 59, 80, 81, 56, 55, 40],
    [28, 48, 40, 19, 86, 27, 90]
  ];
  $scope.onClick = function (points, evt) {
    console.log(points, evt);
  };
});
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
