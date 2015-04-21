var index = function($scope, $rootScope, $http, $window) {

	var link = location.origin + "/common/get/all";
	$scope.searchResultSpinner = false;
	$scope.searchUploadLimit  = 12;
	$scope.searchUploadOffset = 0;
	$scope.searchResults = [];

	$scope.redirectIfLoggedIn = function() {
		console.log('in redirectIfLoggedIn');
		if(localStorage.isLoggedIn == "true") {
			$scope.redirect('/profile');
		}
	}

	$rootScope.getSearchResults = function(searchInput) {
		console.log('changed');
		$scope.searchResultSpinner = true;
		$scope.searchResults = [];

		if((searchInput!="" && searchInput)||true) {
			$http.get('/search?name=' + searchInput + "&limit=" + $scope.searchUploadLimit + "&offset=" + $scope.searchUploadOffset).
			success(function(data, status, headers, config) {
				var searchResults = data;
				console.log(searchResults);
				searchResults.forEach(function(element, index, array) {
					var path;
					if($rootScope.imageExists('/views/' + element.id + "/page.png")) {
						path = '/views/' + element.id + "/page.png";
					}
					else {
						path = '/views/' + element.id + "/page-0.png";
					}
					element.path = path;
					$scope.searchResults.push(element);
				});
				$scope.getArrGrid($scope.searchResults, 6, 1);
				console.log($scope.gridSearchResults);

				if($scope.searchResults.length)
					$scope.searchResultSpinner = false;
			}).
			error(function(data, status, headers, config) {
				console.log('error');
			});
		}
		else {
			$('#search-li-dropdown').hide();
			console.log('hide');
		}
	}

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
		$scope.getArrGrid(data.topDownloads, 6, 0);
		console.log(data);
		$scope.stats = data;
	}).
	error(function(data, status, headers, config) {
		console.log(data);
		console.log(status);
		console.log(headers);
		console.log(config);
		console.log('error');
	}); 

	$scope.getArrGrid = function (list, rowElementCount, type) {
		var gridArray = [], i, k;

		for (i = 0, k = -1; i < list.length; i++) {
			if (i % rowElementCount === 0) {
				k++;
				gridArray[k] = [];
			}

			gridArray[k].push(list[i]);
		}
		if(type==0) {
			$scope.gridTopDownloads = gridArray;
		}
		else if(type==1) {
			$scope.gridSearchResults = gridArray;
		}
	}
}
