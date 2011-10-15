(function() {
	//the exported DI API.
	var di = null;
	
	function updateTrack(stationName) {
		di.getStation(stationName, function(station) {
			UI.setInfo(station.name, station.playing);
		});
	}
	
	function bindEvents() {
		Player.onPlay = function() {
			UI.showPause();
		}
		
		$('.stream').click(function() {
			var plsURL = $(this).attr('data-pls');
			var stationName = $(this).attr('data-station');
			UI.setSelectedID(this);
			UI.setSelectedStation(stationName);
			updateTrack(stationName);
			
			UI.showBuffering();
			
			Player.play('http://72.26.204.32:80/trance_hi?79de7d9c99d2de1');
		});
		
		$('#play').click(function() {
			UI.showBuffering();
			Player.resume();
			updateTrack(UI.getSelectedStation());
		});
		
		$('#pause').click(function() {
			UI.showPlay();
			Player.pause();
		});
	}

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
