var index = function($scope, $rootScope, $http, $window) {

	var link = location.origin + "/common/get/all";

	$rootScope.imageExists = function (image_url){

		var http = new XMLHttpRequest();

		http.open('HEAD', image_url, false);
		http.send();

		return http.status != 404;
	}

	$scope.redirect = function(link) {
		console.log(link);
		$window.location.href = link;
	}

	$scope.Fusername = "";
	$scope.Femail = "";
	$scope.alertMessageResetPassword = "";
	$scope.responseModal = {};

	$scope.submitResetPasswordForm = function (username, email) {
		$http.get("/pass/forgot?username=" + username + "&email=" + email).
		success(function(data, status, headers, config) {
			if(data.result) {
				$scope.responseModal.text = "A reset link has been sent to the Email ID provided. Follow the instructions given in the mail to reset your password";
				$('#modalResponse').modal('toggle');
			}
			else {
				$scope.alertMessageResetPassword = "Invalid credentials";
			}
		}).
		error(function(data, status, headers, config) {
			console.log('error');
		}); 
	}
	
	$rootScope.truncateString = function(str,length){
		var trunc = str.split('.')[0]; 
		if(str.length > length) 
			trunc = str.substring(0,length) +'..';
		return trunc;
	}

	$http.get(link).
	success(function(data, status, headers, config) {
		for(var i=0;i<data.topDownloads.length;i++) {
			var path;
			if($rootScope.imageExists('/views/' + data.topDownloads[i].id + "/page-0.png")) {
				path = '/views/' + data.topDownloads[i].id + "/page-0.png";
			}
			else {
				path = '/views/' + data.topDownloads[i].id + "/page.png";
			}
			data.topDownloads[i].path = path;
		}
		$scope.getArrGrid(data.topDownloads, 6);
		console.log(data);
		$scope.stats = data;
	}).
	error(function(data, status, headers, config) {
		console.log('error');
	}); 

	$scope.getArrGrid = function (list, rowElementCount) {
		var gridArray = [], i, k;

		for (i = 0, k = -1; i < list.length; i++) {
			if (i % rowElementCount === 0) {
				k++;
				gridArray[k] = [];
			}

			gridArray[k].push(list[i]);
		}
		$scope.gridTopDownloads = gridArray;
		console.log(gridArray);
	}
}