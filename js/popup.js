(function() {
	function bindEvents() {
		$('.stream').live('click', function() {
			var plsURL = $(this).data('stream');
			UI.setSelectedStation(this);
		});
	}

	function restoreState() {
		UI.refreshSelectedStation();
		
		/*
		var state = Player.getStatus();
		
		if (state == 'playing') {
			UI.setIcon('pause.png');
		}
		else {
			UI.setIcon('play.png');
		}
		*/
	}

	$(function() {
		DI.exportAPI(function(di) {
			di.getStations(function(stations) {
				UI.createDOM(stations);
				restoreState();
				bindEvents();
			});
		});
	});
})();
