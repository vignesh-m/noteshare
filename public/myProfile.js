function myProfile($scope,$http,$rootScope,$window) {
	// TODO get info from backend and populate user class object

  $scope.user2={user:'Admin'};
  $scope.hoverSearchResult = false;
  $scope.searchResultSpinner = false;
  $scope.semester = "1";
  $scope.year = (new Date()).getFullYear();
  $scope.source = "Internet";

  $scope.smartCollege = "";
  $scope.smartDepartment = "";
  $scope.smartYear = "";
  $scope.smartSemester = "";

  $scope.smartSearchLimit = 12;
  $scope.smartSearchOffset = 0;
  $scope.smartSearchPage = 1;
  $scope.smartSearchResults = [];
  $scope.noMoreSmartSearchResults = false;

 /* $scope.searchLimit1 = 10;
  $scope.searchOffset1 = 0;
  $scope.searchLimit2 = 10;
  $scope.searchOffset2 = 0;
  */
  $scope.searchResults = [];

  $('#notification-li-dropdown.dropdown-menu').click(function(eve) {
    eve.stopPropagation();
  });

  $(document).click(function() {
    $('#search-li-dropdown.dropdown-menu').hide();
  });

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

  $rootScope.truncateString = function(str,length){
    var trunc = str.split('.')[0]; 
    if(str.length > length) 
      trunc = str.substring(0,length) +'..';
    return trunc;
  }

  $scope.redirect = function(link) {
    console.log(link);
    $window.location.href = link;
  }

  $scope.hideSearchResultsDropdown = function() {
    console.log('in hideDropdown');
    if(!$scope.hoverSearchResult) {
      $('#search-li-dropdown').hide();
    }
  }

  /*$rootScope.getSearchResults = function(searchInput) {
    console.log('changed');
    $scope.searchResultSpinner = true;
    if(searchInput!="" && searchInput) {

      $http.get('/search?name=' + searchInput).
      success(function(data, status, headers, config) {
        var searchResults = data;
        $scope.searchResults = [];
        console.log(searchResults);
        $('#search-li-dropdown').show();
        $('#search-li-dropdown').dropdown('toggle');
        searchResults.forEach(function(element, index, array) {
          $scope.searchResults.push({imglink:'/prev-0.jpg',type:'book',text:searchResults[index].name + " Rating : " + searchResults[index].rating + "/5.0", user_id:searchResults[index].userid, link:'./download/view?upload_id=' + searchResults[index].id});
        });

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
}*/

$scope.searchResponse = function(searchResult) {
  if(searchResult.type == "book") {
    $scope.getNotificationModalData(searchResult.link);
  }
  else if(searchResult.type == "user") {
    $scope.redirect(searchResult.link);
  }
}

$rootScope.getSmartSearchResults = function(college, department, year, semester, limit, offset, reset) {
  $scope.smartSearchLimit = limit;
  $scope.smartSearchOffset = offset;
  $scope.smartSearchPage = (offset/limit) + 1;
  $scope.smartSearchResultSpinner = true;

  if(reset) {    
    $scope.smartSearchResults = [];
    $scope.smartSearchLimit = 12;
    $scope.smartSearchOffset = 0;
    $scope.smartSearchPage = 1;
    $scope.noMoreSmartSearchResults = false;
  }

  $http.get('/search?college=' + college + '&department=' + department + '&year=' + year + '&semester=' + semester + '&limit=' + limit + '&offset=' + offset).
  success(function(data, status, headers, config) {
    if(data.length != 0) {
      $scope.noMoreSmartSearchResults = true;
    }
    else {
      $scope.noMoreSmartSearchResults = false;
    }

    for(var i=0;i<data.length;i++) {
      var path;
      element = data[i];
      if($rootScope.imageExists('/views/' + element.id + "/page.png")) {
        path = '/views/' + element.id + "/page.png";
      }
      else {
        path = '/views/' + element.id + "/page-0.png";
      }
      data[i].path = path;
    }

    $scope.smartSearchResults = $scope.smartSearchResults.concat(data);
    console.log($scope.smartSearchResults);
    $scope.getArrGrid($scope.smartSearchResults,4,3);
    $scope.smartSearchResultSpinner = false;
  }).
  error(function(data, status, headers, config) {
    console.log('error');
  }); 

}

$scope.searchUploadLimit = 10;
$scope.searchUploadOffset = 0;
$scope.scrollOffset = 0;

$rootScope.imageExists = function (image_url){

  var http = new XMLHttpRequest();

  http.open('HEAD', image_url, false);
  http.send();

  return http.status != 404;

}

$rootScope.getSearchResults = function(searchInput) {
  console.log('changed');
  $scope.searchResultSpinner = true;

  if(searchInput!="" && searchInput) {
    $http.get('/search/user?name=' + searchInput + "&limit=10" + "&offset=0").
    success(function(data, status, headers, config) {

      $scope.searchResults = [];

      var searchResults = data;
      console.log(searchResults);

      $scope.searchUploadLimit = 10;
      $scope.searchUploadOffset = 0;
      $scope.scrollOffset = 0;

      searchResults.forEach(function(element, index, array) {
        $scope.searchResults.push({imglink:'/avatar.jpg',type:'user',text:searchResults[index].firstname + " " + searchResults[index].lastname, user_id:searchResults[index].id, link:'./profile/view?id=' + searchResults[index].id});
      });
      $http.get('/search?user=' + searchInput + "&limit=" + $scope.searchUploadLimit + "&offset=" + $scope.searchUploadOffset).
      success(function(data, status, headers, config) {
        var searchResults = data;
        console.log(searchResults);
        $('#search-li-dropdown').show();
        $('#search-li-dropdown').dropdown('toggle');
        searchResults.forEach(function(element, index, array) {
          var path;
          if($rootScope.imageExists('/views/' + element.id + "/page.png")) {
            path = '/views/' + element.id + "/page.png";
          }
          else {
            path = '/views/' + element.id + "/page-0.png";
          }
          $scope.searchResults.push({imglink:path,type:'book',text:searchResults[index].name + " Rating : " + searchResults[index].rating + "/5.0", user_id:searchResults[index].userid, link:'./upload/getupload?id=' + searchResults[index].id});
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

$('#search-li-dropdown.dropdown-menu').scroll(function() {
/*
  console.log($('#search-li-dropdown.dropdown-menu'));
  console.log($('#search-li-dropdown.dropdown-menu').scrollTop());
  console.log($('#search-li-dropdown.dropdown-menu').innerHeight());
  console.log($('#search-li-dropdown.dropdown-menu').position());
  console.log($('#search-li-dropdown.dropdown-menu').offset());*/

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
        var path;
        if($rootScope.imageExists('/views/' + element.id + "/page.png")) {
          path = '/views/' + element.id + "/page.png";
        }
        else {
          path = '/views/' + element.id + "/page-0.png";
        }
        $scope.searchResults.push({imglink:path,type:'book',text:searchResults[index].name + " Rating : " + searchResults[index].rating + "/5.0", user_id:searchResults[index].userid, link:'./upload/getupload?id=' + searchResults[index].id});
      });

      if($scope.searchResults.length)
        $scope.searchResultSpinner = false;
    }).
    error(function(data, status, headers, config) {
      console.log('error');
    }); 
  }
});
/*
var scroll = $('#search-li-dropdow.dropdown-menu');
var content = document.getElementById('content');

scroll.onscroll = function(){
  var total = scroll.scrollTop + scroll.clientHeight;

  if(total == content.clientHeight)
    alert('Reached bottom!');
}*/

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
        var str = element.link.split("=");
        var x = str[1];
        if($rootScope.imageExists('/views/' + x + "/page.png")) {
          path = '/views/' + x + "/page.png";
        }
        else {
          path = '/views/' + x + "/page-0.png";
        }
        element.path = path;
        element.unread = true;
        $scope.notificationsUploads.push(element);
      }
      else if(element.purpose == "Download") {
        var str = element.split("=");
        var x = str[1];
        if($rootScope.imageExists('/views/' + x + "/page.png")) {
          path = '/views/' + x + "/page.png";
        }
        else {
          path = '/views/' + x + "/page-0.png";
        }
        element.path = path;
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
  else if(type == 2)
    $scope.gridMyDownloads = gridArray;
  else if(type == 3)
    $scope.gridSmartSearchResults = gridArray;
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
    for(var i=0;i<data.length;i++) {
      var path;
      if($rootScope.imageExists('/views/' + data[i].id + "/page-0.png")) {
        path = '/views/' + data[i].id + "/page-0.png";
      }
      else {
        path = '/views/' + data[i].id + "/page.png";
      }
      data[i].path = path;
    }
    $scope.myUploads = data;
    $scope.myRecentUploads = $scope.myUploads.slice(0,10);
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
    for(var i=0;i<data.downloads.length;i++) {
      var path;
      if($rootScope.imageExists('/views/' + data.downloads[i].file.id + "/page-0.png")) {
        path = '/views/' + data.downloads[i].file.id + "/page-0.png";
      }
      else {
        path = '/views/' + data.downloads[i].file.id + "/page.png";
      }
      data.downloads[i].file.path = path;
    }
    $scope.myRecentDownloads = $scope.myDownloads.downloads.slice(0,10);
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

    fd.append("name", $scope.filename);
    fd.append("department", $scope.department);
    fd.append("semester", $scope.semester);
    fd.append("year", $scope.year);
    //fd.append("tags", '[' + $scope.tags.split(" ") + '');

    
/*
    for(var i=0;i<tags.length;i++) {
      fd.append("tags", tags[i]);
    }*/

    console.log($scope.tags.split(" "));
    
    var xhr = new XMLHttpRequest()
    xhr.upload.addEventListener("progress", $scope.uploadProgress, false)
    xhr.addEventListener("load", $scope.uploadComplete, false)
    xhr.addEventListener("error", $scope.uploadFailed, false)
    xhr.addEventListener("abort", $scope.uploadCanceled, false)
    xhr.open("POST", "/upload");
    xhr.setRequestHeader("x","hello");
    $scope.progressVisible = true
    xhr.send(fd);
  }


  $scope.uploadProgress = function (evt) {
    $scope.$apply(function(){
      if (evt.lengthComputable) {
        $scope.progress = Math.round(evt.loaded * 100 / evt.total)
      } else {
        $scope.progress = 'unable to compute'
      }
    })
  }

  $scope.uploadComplete = function (evt) {
   /* This event is raised when the server send back a response */
   alert(evt.target.responseText);
   var upload_id = JSON.parse(evt.target.responseText).insertId;
   console.log(upload_id);

    var tags = $scope.tags.split(" ");//jQuery.param("[" + $scope.tags.split(" ") + "]");
    console.log(tags);

    for(var i=0;i<tags.length;i++) {

      $http.get('/tag/add?uploadid=' + upload_id + "&tagname=" + tags[i]).
      success(function(data, status, headers, config) {
        console.log(data);
      }).
      error(function(data, status, headers, config) {
        console.log('error');
      }); 
    }

    $scope.visUploadProgress=!$scope.visUploadProgress;
  }

  $scope.uploadFailed = function (evt) {
    alert("There was an error attempting to upload the file.")
  }

  $scope.uploadCanceled = function (evt) {
    $scope.$apply(function(){
      $scope.progressVisible = false
    })
    alert("The upload has been canceled by the user or the browser dropped the connection.")
  }
}