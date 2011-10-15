var UI = (function() {
	var ui = {};
	
	ui.createStationHTML = function(station) {
		var s = $('<div class="station"></div>');
		
		s.append('<div class="stationName">' + station.name + '</div>');
		
		for (var stream in station.streams) {
			var streamDiv = $('<div class="stream">' + stream + '</div>');
			streamDiv.data('stream', station.streams[stream]);
			
			var id = station.name.replace(/ /g, '') + stream;
			streamDiv.attr('id', id);
			s.append(streamDiv);
		}
		
		return s;
	}
	
	ui.createDOM = function(stations) {
		$('#stationList').empty();
				
		stations.forEach(function(station) {
			var html = ui.createStationHTML(station);
			$('#stationList').append(html);
		});
	}
	
	ui.setIcon = function(img) {
		$('#controls').empty();
		$('#controls').append('<img src="' + img + '" />');
	}

	ui.setSelectedStation = function(elem) {
		$('.stream').removeClass('selected');
		$(elem).addClass('selected');
		localStorage["UISelectedStation"] = '#' + $(elem).attr('id');
	}

	ui.getSelectedStation = function() {
		return localStorage["UISelectedStation"];
	}
	
	ui.refreshSelectedStation = function() {
		ui.setSelectedStation(ui.getSelectedStation());
	}
	
	return ui;
})();
