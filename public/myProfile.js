function myProfile($scope,$http,$rootScope,$window) {
	// TODO get info from backend and populate user class object

  $scope.user2={user:'Admin'};
  $scope.hoverSearchResult = false;
  $scope.searchResultSpinner = false;
  $scope.semester = "1";
  $scope.year = (new Date()).getFullYear();
  $scope.source = "Internet";

  $('#notification-li-dropdown.dropdown-menu').click(function(eve) {
    eve.stopPropagation();
  });

  $scope.notificationMarkAsRead = function(purpose, index) {
    var notification_id;
    if(purpose == 0) {
      notification_id = $scope.notificationsDownloads[index].id;
      console.log(notification_id);
    }
    else if(purpose == 1) {
      notification_id = $scope.notificationsUploads[index].id;      
      console.log(notification_id);
    }
    $http.get('/notifications/set/read?notification_id=' + notification_id).
    success(function(data, status, headers, config) {
      console.log(data);
      if(data.result) {
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

  $scope.viewUserProfile = function(user_id) {
    console.log(user_id);
    $window.location.href = '/profile/view?id=' + user_id;
  }

  $scope.hideSearchResultsDropdown = function() {
    console.log('in hideDropdown');
    if(!$scope.hoverSearchResult) {
      $('#search-li-dropdown').hide();
    }
  }

  $rootScope.getSearchResults = function(searchInput) {
    console.log('changed');
    $scope.searchResultSpinner = true;
    if(searchInput!="" && searchInput) {
      $http.get('/search?user=' + searchInput).
      success(function(data, status, headers, config) {
        var searchResults = data;
        $scope.searchResults = [];
        searchResults.forEach(function(element, index, array) {
          $scope.searchResults.push({text:searchResults[index].firstname + " " + searchResults[index].lastname, user_id:searchResults[index].userid});
        });
        if($scope.searchResults.length)
          $scope.searchResultSpinner = false;
        $('#search-li-dropdown').show();
        $('#search-li-dropdown').dropdown('toggle');
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
  $scope.visMyUploads = false;
  $scope.visMyDownloads = false;

  $scope.notifications=[];
  $scope.notificationsUploads = [];
  $scope.notificationsDownloads = [];
  $scope.visUploadProgress = false;
  $scope.files = [];

  $rootScope.searchingUserId = 4;

  $scope.updateNotifications = function() {
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
      $scope.updateNotificationCounter();
      $scope.notificationCount = $scope.notifications.length;
    }).
    error(function(data, status, headers, config) {
      $scope.notifications.push({"textDescription":"Could not load notifications"});
    });
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

  $scope.reg_socket = function() {
    var socket = io();
    socket.on('update',function(signal) {
      console.log( "Signal received: " + signal );
      if( JSON.parse(signal).user_id == $scope.user.id ) {
        console.log('user matched');
        $scope.getDetails();
      }
    });
  }

  $scope.reg_socket();

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

  $scope.getDetails = function() {
    $http.get('/profile/get').
    success(function(data, status, headers, config) {
      console.log(data);
      $scope.user = data.data;
      $scope.getMyUploads();
      $scope.getMyDownloads();
      $scope.updateNotifications();
      $scope.getFollowStats();
    }).
    error(function(data, status, headers, config) {
      console.log('error');
    }); 
  }

  $scope.getDetails();


	//for(var i=1;i<=$scope.notificationCount;i++) {
	//	$scope.notifications.push({"textHeading":"New notification","textDescription":"Description about the notification"});
	//}

  $scope.fileInputClick = function() {
    $('#fileToUpload').click();
  }

  $scope.uploadNotes = function() {
    console.log('Notes uploaded');
		//Will be called when progress bar reaches 100%
		//TODO : Give a popup saying that your notes has been uploaded.
		$scope.visUploadProgress = false;
	}
	$scope.startUpload = function() {
		console.log('Started uploading');
		$scope.files.push({"fileName":$('.fileinput-filename').text()});
		$('#removeSelectedFile').trigger('click');
	}
	$scope.uploadNotesDetails = function() {
		console.log('Notes details uploaded');
		//TODO : Do some validation here.
		$scope.visUploadProgress = true;
	}
	$scope.displayModalUploadNotes = function() {
		$('#uploadNotes').modal('show');
	}
	$scope.loadImage = function() {
		console.log('Image loaded');
	}
	$scope.browseFiles = function() {
		console.log('Browsing files');
	}
	$scope.updateNotificationCounter = function() {
		console.log('called update function');
		$('#notificationCount').css({opacity:0});

		//TODO : update notifications - user object from backend
		$('#notificationCount').css({top: '-30px'});
		$('#notificationCount').animate({top: '12px', opacity: 1});
	}
	$scope.updateNotification = function() {
		console.log('notifications updated');
	}

  var dropbox = document.getElementById("dropbox")
  $scope.dropText = 'Drag or drop files here...'

    // init event handlers
    function dragEnterLeave(evt) {
      evt.stopPropagation()
      evt.preventDefault()
      $scope.$apply(function(){
        $scope.dropText = 'Drag or drop files here...'
        $scope.dropClass = ''
      })
    }
    dropbox.addEventListener("dragenter", dragEnterLeave, false)
    dropbox.addEventListener("dragleave", dragEnterLeave, false)
    dropbox.addEventListener("dragover", function(evt) {
      evt.stopPropagation()
      evt.preventDefault()
      var clazz = 'not-available'
      var ok = evt.dataTransfer && evt.dataTransfer.types && evt.dataTransfer.types.indexOf('Files') >= 0
      $scope.$apply(function(){
        $scope.dropText = ok ? 'Drop files here...' : 'Only files are allowed!'
        $scope.dropClass = ok ? 'over' : 'not-available'
      })
    }, false)
    dropbox.addEventListener("drop", function(evt) {
      console.log('drop evt:', JSON.parse(JSON.stringify(evt.dataTransfer)))
      evt.stopPropagation()
      evt.preventDefault()
      $scope.$apply(function(){
        $scope.dropText = 'Drop files here...'
        $scope.dropClass = ''
      })
      var files = evt.dataTransfer.files
      if (files.length > 0) {
        $scope.$apply(function(){
          $scope.files = []
          for (var i = 0; i < files.length; i++) {
            $scope.files.push(files[i])
          }
        })
      }
    }, false)

    $scope.setFiles = function(element) {
      $scope.$apply(function($scope) {
        console.log('files:', element.files);
      // Turn the FileList object into an Array
      $scope.files = []
      for (var i = 0; i < element.files.length; i++) {
        $scope.files.push(element.files[i])
      }
      $scope.progressVisible = false
    });
    };

    $scope.prevUpload = function() {
     $('#prevUploadHidden').click();
   }

   $scope.nextUpload = function() {
     $('#nextUploadHidden').click();
   }

   $scope.uploadFile = function() {
    var fd = new FormData()
    for (var i in $scope.files) {
      fd.append("uploadedFile", $scope.files[i])
    }
    var xhr = new XMLHttpRequest()
    xhr.upload.addEventListener("progress", uploadProgress, false)
    xhr.addEventListener("load", uploadComplete, false)
    xhr.addEventListener("error", uploadFailed, false)
    xhr.addEventListener("abort", uploadCanceled, false)
    xhr.open("POST", "/upload")
    xhr.setRequestHeader("x","hello");
    $scope.progressVisible = true
    xhr.send(fd)
  }
}

function uploadProgress(evt) {
  $scope.$apply(function(){
    if (evt.lengthComputable) {
      $scope.progress = Math.round(evt.loaded * 100 / evt.total)
    } else {
      $scope.progress = 'unable to compute'
    }
  })
}

function uploadComplete(evt) {
 /* This event is raised when the server send back a response */
 alert(evt.target.responseText)
}

function uploadFailed(evt) {
  alert("There was an error attempting to upload the file.")
}

function uploadCanceled(evt) {
  $scope.$apply(function(){
    $scope.progressVisible = false
  })
  alert("The upload has been canceled by the user or the browser dropped the connection.")
}
