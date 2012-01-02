/*
 * popup.js -- main code for the extension popup
 * 
 * This file contains the code that does most of "the stuff"
 * that the extension requires. It is basically the entry
 * point for the extension.
 */
(function() {
	//the exported DI API, so it can be used in more than one place.
	var di = null;
	
	/**
	 * Given a station name, query di.fm and update the station/track
	 * info on the extension popup.
	 */
	function updateTrack(stationName) {
		di.getStation(stationName, function(station) {
			UI.setInfo(station.name, station.trackInfo.artist + ' - ' + station.trackInfo.title);
		});
	}
	
	/**
	 * Binds the events for the extension popup. This is where
	 * all the magic is put together.
	 */
	function bindEvents() {
		//Error handling.
		Player.onError = function(errorCode) {
			if (errorCode === 1) {
				alert('Stream loading aborted');
			}
			else if (errorCode === 2) {
				alert('Network error');
			}
			else if (errorCode === 3) {
				alert('Stream decoding error');
			}
			else if (errorCode === 4) {
				alert('Stream format not supported');
			}
			else {
				alert('Unknown error (error code = ' + errorCode + ')');
			}
		}
		
		$.ajaxSetup({
			error: function(xhr, status, errorThrown) {
				alert(status + ' - ' + errorThrown);
			}
		});
		
		//Refresh button.
		$('#refresh').click(function() {
			delete localStorage['PopupPremiumStatus'];
			delete localStorage['PopupStationList'];
			UI.clearStations();
			main();
		});
				
		//It goes play -> buffering -> pause.
		//This is called automatically after the stream actually begins.
		Player.onPlay = function() {
			UI.showPause();
		}
		
		Player.onPause = function() {
			UI.showPlay();
		}
		
		//Click on a stream to start playing it.
		$('.stream').click(function() {
			var fileURL = $(this).attr('data-file');
			var stationName = $(this).attr('data-station');
			
			chrome.browserAction.setTitle({
				title: 'Digitally Imported :: ' + stationName
			});
			
			UI.setSelectedID(this);
			UI.setSelectedStation(stationName);
			UI.showBuffering();
			updateTrack(stationName);
			
			//some station URLs are relative.
			if (fileURL.indexOf('http://listen.di.fm') === -1) {
				fileURL = 'http://listen.di.fm' + fileURL;
			}
			
			$.get(fileURL, function(fileContents) {
				if (fileURL.indexOf('.pls') !== -1) {
					var pls = Parser.parse('pls', fileContents);
					var stream = pls.records[0].file;
				}
				else if (fileURL.indexOf('.asx') !== -1) {
					var asx = Parser.parse('asx', fileContents);
					var stream = asx.records[0].file;
				}
				else {
					alert('Not sure how to parse file ' + fileUrl);
					return;
				}
				
				Player.play(stream);
			}, 'html');
		});
		
		//Resume after pausing.
		$('#play').click(function() {
			var info = UI.getInfo(); 
			chrome.browserAction.setTitle({
				title: 'DI.fm :: ' + info.station
			});
			
			UI.showBuffering();
			Player.resume();
			updateTrack(UI.getSelectedStation());
		});
		
		//Pause the stream.
		$('#pause').click(function() {
			var info = UI.getInfo(); 
			chrome.browserAction.setTitle({
				title: 'DI.fm :: ' + info.station + ' (Paused)'
			});
			
			Player.pause();
		});
	}

	/**
	 * Called when opening the extension up. Restores the interface
	 * to what it was. Would be nice if Chrome just kept the page alive
	 * while it's closed.
	 */
	function restoreState() {
		UI.refreshSelectedID();
			
		if (Player.getStatus() == 'playing') {
			UI.showPause();
		}
		else {
			UI.showPlay();
		}
		
		//set currently playing info.
		updateTrack(UI.getSelectedStation());
	}
	
	function getStations(callback) {
		var stations = localStorage['PopupStationList'];
		
		if (typeof stations !== 'undefined') {
			stations = JSON.parse(stations);
			setTimeout(function() {
				callback(stations);
			}, 0);
		}
		else {
			di.getStations(function(stations) {
				localStorage['PopupStationList'] = JSON.stringify(stations);
				callback(stations);
			});
		}
	}
	
	function exportAPI(callback) {
		var status = localStorage['PopupPremiumStatus'];
		
		if (typeof status !== 'undefined') {
			var opts = {
				checkLogin: false,
				premiumStatus: (status === 'premium') ? true : false
			};
			
			DI.exportAPI(opts, function(api) {				
				callback(api);				
			});
		}
		else {
			DI.exportAPI(function(api) {
				if (api.isPremium) {
					localStorage['PopupPremiumStatus'] = 'premium';
				}
				else {
					localStorage['PopupPremiumStatus'] = 'regular';
				}
				
				callback(api);
			});
		}
	}
	
	function main() {
		exportAPI(function(api) {
			di = api; //so it can be used elsewhere.
			
			if (di.isPremium) {
				UI.setPremiumStatus('Active');
			}
			else {
				UI.setPremiumStatus('<a target="_blank" href="http://www.di.fm/premium/">Go Premium!</a>');
			}
			
			getStations(function(stations) {
				UI.createDOM(stations);
				restoreState();
				bindEvents();
			});
		});
	}

	//Entry point.
	$(function() {
		main();
	});
})();
