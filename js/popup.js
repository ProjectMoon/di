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
			UI.setInfo(station.name, station.playing);
		});
	}
	
	/**
	 * Binds the events for the extension popup. This is where
	 * all the magic is put together.
	 */
	function bindEvents() {
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
			var info = UI.getInfo(); 
			chrome.browserAction.setTitle({
				title: 'DI.fm :: ' + info.station
			});
			
			var plsURL = $(this).attr('data-pls');
			var stationName = $(this).attr('data-station');
			UI.setSelectedID(this);
			UI.setSelectedStation(stationName);
			updateTrack(stationName);
			
			UI.showBuffering();
			
			Player.play('http://72.26.204.32:80/trance_hi?79de7d9c99d2de1');
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
			chrome.browserAction.setTitle({
				title: 'Paused'
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

	//Entry point.
	$(function() {
		DI.exportAPI(function(api) {
			di = api; //so it can be used elsewhere.
			
			di.getStations(function(stations) {
				UI.createDOM(stations);
				restoreState();
				bindEvents();
			});
		});
	});
})();
