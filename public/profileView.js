function profileView($scope,$http,$rootScope,$window) {
	// TODO get info from backend and populate user class object
  $scope.user2={user:'Admin'};

  $rootScope.truncateString = function(str,length){
    var trunc = str.split('.')[0]; 
    if(str.length > length) 
      trunc = str.substring(0,length) +'..';
    return trunc;
  }


  $('#notification-li-dropdown.dropdown-menu').click(function(eve) {
    eve.stopPropagation();
  });

  $(document).click(function() {
    $('#search-li-dropdown.dropdown-menu').hide();
  });

  $scope.searchUploadLimit = 10;
  $scope.searchUploadOffset = 0;
  $scope.scrollOffset = 0;

  $('#search-li-dropdown.dropdown-menu').scroll(function() {

    if($('#search-li-dropdown.dropdown-menu').scrollTop() - $scope.scrollOffset >= $('#search-li-dropdown.dropdown-menu').innerHeight() + $('#search-li-dropdown.dropdown-menu').offset().top){
      $scope.scrollOffset = $('#search-li-dropdown.dropdown-menu').scrollTop();
      $scope.searchUploadOffset += $scope.searchUploadLimit;
      $http.get('/search?user=' + $scope.searchInput + "&limit=" + $scope.searchUploadLimit + "&offset=" + $scope.searchUploadOffset).
      success(function(data, status, headers, config) {
        var searchResults = data;
        console.log(searchResults);
        $('#search-li-dropdown').show();
        $('#search-li-dropdown').dropdown('toggle');
        searchResults.forEach(function(element, index, array) {
          $scope.searchResults.push({imglink:'/prev-0.jpg',type:'book',text:searchResults[index].name + " Rating : " + searchResults[index].rating + "/5.0", user_id:searchResults[index].userid, link:'./upload/getupload?id=' + searchResults[index].id});
        });

        if($scope.searchResults.length)
          $scope.searchResultSpinner = false;
      }).
      error(function(data, status, headers, config) {
        console.log('error');
      }); 
    }
  });

$rootScope.getSearchResults = function(searchInput) {
  console.log('changed');
  $scope.searchResultSpinner = true;
  if(searchInput!="" && searchInput) {
    $http.get('/search/user?name=' + searchInput + "&limit=10" + "&offset=0").
    success(function(data, status, headers, config) {
      $scope.searchResults = [];
      var searchResults = data;

      $scope.searchUploadLimit = 10;
      $scope.searchUploadOffset = 0;
      $scope.scrollOffset = 0;

      searchResults.forEach(function(element, index, array) {
        $scope.searchResults.push({imglink:'../avatar.jpg',type:'user',text:searchResults[index].firstname + " " + searchResults[index].lastname, user_id:searchResults[index].id, link:'../profile/view?id=' + searchResults[index].id});
      });
      $http.get('/search?user=' + searchInput  + "&limit=" + $scope.searchUploadLimit + "&offset=" + $scope.searchUploadOffset).
      success(function(data, status, headers, config) {
        var searchResults = data;
        console.log(searchResults);
        $('#search-li-dropdown').show();
        $('#search-li-dropdown').dropdown('toggle');
        searchResults.forEach(function(element, index, array) {
          $scope.searchResults.push({imglink:'../prev-0.jpg',type:'book',text:searchResults[index].name + " Rating : " + searchResults[index].rating + "/5.0", user_id:searchResults[index].userid, link:'../upload/getupload?id=' + searchResults[index].id});
        });

        if($scope.searchResults.length)
          $scope.searchResultSpinner = false;
      }).
      error(function(data, status, headers, config) {
        console.log('error');
      }); 

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


$scope.getTimeInFormat = function(dateStr) {
    //10/21/2013 3:29 PM
    var date = new Date(dateStr);
    var str = date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + ' ';
    var ampm = "";
    if(date.getHours()>12) {
      str = str + (date.getHours() - 12);
      ampm = "PM";
    }
    else {
      str = str + date.getHours();
      ampm = "AM";
    }

    str = str + ':' + date.getMinutes() + ' ' + ampm;
    console.log(str);
    return str;
  }

  $scope.getNotificationModalData = function(link) {
    $http.get(link).
    success(function(data, status, headers, config) {
      $scope.notificationModalData = data;
      console.log(data);
      $('#uploadNotificationModal').modal('toggle');
    }).
    error(function(data, status, headers, config) {
      console.log('error');
    }); 
  }

  $scope.getArray = function(num) {
    return new Array(num);
  }

  $scope.notificationMarkAsRead = function(purpose, index, link) {
    var notification_id;
    $scope.getNotificationModalData(link);
    if(purpose == "Download") {
      notification_id = $scope.notificationsDownloads[index].id;
      $scope.notificationsDownloads[index].unread = false;
      console.log(notification_id);
    }
    else if(purpose == "Upload") {
      notification_id = $scope.notificationsUploads[index].id;   
      $scope.notificationsUploads[index].unread = false;   
      console.log(notification_id);
    }
    $http.get('/notifications/set/read?notification_id=' + notification_id).
    success(function(data, status, headers, config) {
      console.log(data);
     /* if(data.result) {
        $http.get('/notifications/get').
        success(function(data, status, headers, config) {
          console.log(data);
          $scope.notifications = data.notificationsUnread;
          $scope.notificationsUploads = [];
          $scope.notificationsDownloads = [];
          $scope.notifications.forEach(function(element, index, array) {
            if(element.purpose == "Upload") {
              $scope.notificationsUploads.push(element);
            }
            else if(element.purpose == "Download") {
              $scope.notificationsDownloads.push(element);
            }
          });
          $scope.notificationCount = $scope.notifications.length;
        }).
        error(function(data, status, headers, config) {
          console.log('error');
        });
  }*/
}).
    error(function(data, status, headers, config) {
      console.log('error');
    });
  }

  $scope.updateNotifications = function() {
    $http.get('/notifications/get').
    success(function(data, status, headers, config) {
      console.log(data);
      $scope.notifications = data.notificationsUnread;
      $scope.notificationsUploads = [];
      $scope.notificationsDownloads = [];
      $scope.notifications.forEach(function(element, index, array) {
        if(element.purpose == "Upload") {
          element.unread = true;
          $scope.notificationsUploads.push(element);
        }
        else if(element.purpose == "Download") {
         element.unread = true;
         $scope.notificationsDownloads.push(element);
       }
     });
      $scope.updateNotificationCounter();
      $scope.notificationCount = $scope.notifications.length;
    }).
    error(function(data, status, headers, config) {
      $scope.notifications.push({"textDescription":"Could not load notifications"});
    });
  }

  $scope.redirectToDashboard = function() {
    $window.location='/profile';
  }


  $scope.searchResponse = function(searchResult) {
    if(searchResult.type == "book") {
      $scope.getNotificationModalData(searchResult.link);
    }
    else if(searchResult.type == "user") {
      $scope.redirect(searchResult.link);
    }
  }


  $scope.redirect = function(link) {
    console.log(link);
    $window.location.href = link;
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