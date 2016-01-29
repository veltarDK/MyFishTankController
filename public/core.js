var app = angular.module('FishTank', []);

app.controller("mainController", function ($scope) {



 function post(url)
 {
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
