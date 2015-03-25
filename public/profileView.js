function profileView($scope,$http,$rootScope,$window) {
	// TODO get info from backend and populate user class object
  $scope.user2={user:'Admin'};

  $rootScope.truncateString = function(str,length){
    var trunc = str.split('.')[0]; 
    if(str.length > length) 
      trunc = str.substring(0,length) +'..';
    return trunc;
  }

  console.log('started');
  $scope.visDashboard = true;
  $scope.visMyUploads = true;
  $scope.visMyDownloads = false;

  $scope.notifications=[];
  $scope.visUploadProgress = false;
  $scope.files = [];

  var temp = $window.location.search.substr(4);
  console.log(temp);
  $rootScope.searchingUserId = parseInt(temp);

  $scope.isFollowingOtherUser = false;


  $scope.updateNotifications = function() {
    $http.get('/notifications/get').
    success(function(data, status, headers, config) {
      console.log(data);
      $scope.notifications = data.notificationsRead;
      $scope.notificationCount = $scope.notifications.length;
    }).
    error(function(data, status, headers, config) {
      $scope.notifications.push({"textDescription":"Could not load notifications"});
    });
  }

  $scope.redirectToDashboard = function() {
    $window.location='/profile';
  }

  $scope.getArrGrid = function (list, rowElementCount, type) {
    var gridArray = [], i, k;

    for (i = 0, k = -1; i < list.length; i++) {
      if (i % rowElementCount === 0) {
        k++;
        gridArray[k] = [];
      }

      gridArray[k].push(list[i]);
    }
    if(type == 1)
      $scope.gridMyUploads = gridArray;
    else 
      $scope.gridMyDownloads = gridArray;
  }

  $scope.getMyUploads = function() {
    $http.get('/upload/get').
    success(function(data, status, headers, config) {
      console.log(data);
      $scope.myUploads = data;
      $scope.myUploadsCount = data.length;
    }).
    error(function(data, status, headers, config) {
      console.log('error');
    });  
  }

  $scope.getOtherUploads = function() {
    $http.get('/upload/get?id=' + $scope.otherUser.id).
    success(function(data, status, headers, config) {
      console.log(data);
      console.log('getting other uploads');
      $scope.otherUploads = data;
      $scope.otherUploadsCount = data.length;
      $scope.getArrGrid($scope.otherUploads,4,1);
    }).
    error(function(data, status, headers, config) {
      console.log('error');
    });  
  }

  $scope.getMyDownloads = function() {
    $http.get('/download/get').
    success(function(data, status, headers, config) {
      console.log(data);
      $scope.myDownloads = data;
      console.log('getting downloads');
      $scope.myDownloadsCount = data.downloads.length;
    }).
    error(function(data, status, headers, config) {
      console.log('error');
    });  
  }

  $scope.getFollowStats = function() {
    $http.get('/follow/get').
    success(function(data, status, headers, config) {
      console.log(data);
      $scope.following = data.arrFollowing;
      $scope.followers = data.arrFollowers;
      $scope.followingCount=($scope.following).length;
      $scope.followersCount=($scope.followers).length;

    }).
    error(function(data, status, headers, config) {
      console.log('error');
    });  
  }

  $scope.getOtherFollowStats = function() {
    $http.get('/follow/get?id=' + $scope.otherUser.id).
    success(function(data, status, headers, config) {
      console.log(data);
      $scope.followingOther = data.arrFollowing;
      $scope.followersOther = data.arrFollowers;
      $scope.followingCountOther = ($scope.followingOther).length;
      $scope.followersCountOther = ($scope.followersOther).length;

      $scope.isFollowingOtherUser = false;

      for(var i=0;i<$scope.followersOther.length;i++) {
        if($scope.followersOther[i].userid == $scope.user.id) {
          $scope.isFollowingOtherUser = true;
          console.log('is already following');
        }
      }

    }).
    error(function(data, status, headers, config) {
      console.log('error');
    });  
  }

  $scope.followOtherUser = function() {
    $http.get('/follow/add?follows=' + $scope.otherUser.id).
    success(function(data, status, headers, config) {
      console.log(data);
      $scope.getOtherFollowStats();
    }).
    error(function(data, status, headers, config) {
      console.log('error');
    }); 
  }

  $scope.dontFollowOtherUser = function() {
    $http.get('/follow/remove?follows=' + $scope.otherUser.id).
    success(function(data, status, headers, config) {
      console.log(data);
      $scope.getOtherFollowStats();
    }).
    error(function(data, status, headers, config) {
      console.log('error');
    }); 
  }

  $scope.getDetails = function() {

    $scope.getMyUploads();
    $scope.getMyDownloads();
    $scope.updateNotifications();
    $scope.getFollowStats();

    //Other user
    $http.get('/profile/get?id=' + $rootScope.searchingUserId).
    success(function(data, status, headers, config) {
      console.log(data);
      $scope.otherUser = data.data;
      $scope.getOtherUploads();
      $scope.getOtherFollowStats();
    }).
    error(function(data, status, headers, config) {
      console.log('error');
    });  
  }

  $scope.getDetails();


  $scope.updateNotificationCounter = function() {
    console.log('called update function');
    $('#notificationCount').css({opacity:0});

		//TODO : update notifications - user object from backend
		$scope.notificationCount = $scope.notificationCount;	
		$('#notificationCount').css({top: '-30px'});
		$('#notificationCount').animate({top: '12px', opacity: 1});
	}
	$scope.updateNotification = function() {
		console.log('notifications updated');
	}

}