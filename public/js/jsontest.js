"use strict";
function showResults() {
	/*--------------------------------------------------
		Uncomment this code and remove the uncommented
		code in this function when the url is ready.
	----------------------------------------------------*/
	
	/*var xmlhttp = new XMLHttpRequest();
	var url = "the required url";
	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState == 4 && xmlhttp.status == 200)
			displayObjects(xmlhttp.responseText);
	}
	xmlhttp.open("GET", url, true);
	xmlhttp.send();
	*/
	var resultString = '{															\
		"success": "true",															\
		"numResults": 2,															\
		"results": [																\
				{																	\
						"user": "adhityaa",											\
						"fhash": "aufyw467riq4rfqui34rtf347",						\
						"fileName": "C++ notes.pdf",								\
						"numberOfDownloads": 193,									\
						"averageRating": 4.7,										\
						"userAverage": 4.2,											\
						"tags": ["c++", "computer-science", "programmming"]			\
				},																	\
				{																	\
						"user": "sachin",											\
						"fhash": "gafwuegrf634yuifg4ifyua4",						\
						"fileName": "Databases.pdf",								\
						"numberOfDownloads": 223,									\
						"averageRating": 4.9,										\
						"userAverage": 3.7,											\
						"tags": ["db", "computer-science", "web"]					\
				}																	\
			]																		\
		}';
	displayObjects(resultString);
}
function displayObjects(resultString) {
	var searchResult = JSON.parse(resultString);
	var successTag = document.getElementById("successTag");
	var resultsCountTag = document.getElementById("resultsCountTag");
	var resultsTable = document.getElementById("resultsTable");
	if (searchResult.success == "true") {
		successTag.innerHTML = "Success";
		resultsCountTag.innerHTML = "No. of results: " + searchResult.numResults;
		
		var results = searchResult.results;
		var resultRow = null, resultData = "";
		for (var i = 0; i < results.length; ++i) {
			resultRow = document.createElement("tr");
			resultsTable.appendChild(resultRow);
			
			resultData = "<td>" + results[i].fileName + "</td>";
			resultRow.innerHTML += resultData;
			resultData = "<td>" + results[i].numberOfDownloads + "</td>";
			resultRow.innerHTML += resultData;
			resultData = "<td>" + results[i].averageRating + "</td>";
			resultRow.innerHTML += resultData;
			resultData = "<td>" + results[i].user + "</td>";
			resultRow.innerHTML += resultData;
			resultData = "<td>" + results[i].userAverage + "</td>";
			resultRow.innerHTML += resultData;
			resultData = "<td>" + results[i].tags + "</td>";
			resultRow.innerHTML += resultData;
			resultData = "<td>" + results[i].fhash + "</td>";
			resultRow.innerHTML += resultData;
		}
	}
	else {
		successTag.innerHTML = "Failure";
	}
}