var UI = (function() {
	var ui = {};
	
	ui.createStationHTML = function(station) {
		var s = $('<div class="station"></div>');
		
		s.append('<div class="stationName">' + station.name + '</div>');
		
		for (var stream in station.streams) {
			var streamDiv = $('<div class="stream">' + stream + '</div>');
			
			streamDiv.attr('data-pls', station.streams[stream]);
			streamDiv.attr('data-station', station.name);
			
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
	
	ui.setSelectedID = function(elem) {
		$('.stream').removeClass('selected');
		$(elem).addClass('selected');
		localStorage["UISelectedID"] = '#' + $(elem).attr('id');
	}

	ui.getSelectedID = function() {
		return localStorage["UISelectedID"];
	}
	
	ui.refreshSelectedID = function() {
		ui.setSelectedID(ui.getSelectedID());
	}
	
	ui.setSelectedStation = function(stationName) {
		localStorage['UISelectedStation'] = stationName;
	}
	
	ui.getSelectedStation = function() {
		return localStorage['UISelectedStation']
	}
	
	ui.setInfo = function(station, track) {
		$('#station').text(station);
		var marquee = $('<marquee></marquee>');
		marquee.text(track);
		$('#track').empty().append(marquee);
	}
	
	ui.getInfo = function() {
		return {
			station: $('#station').text(),
			track: $('#track').children('marquee').text()
		};
	}
	
	ui.showPlay = function() {
		$('#pause').hide();
		$('#buffering').hide();
		$('#play').show();
	}
	
	ui.showPause = function() {
		$('#play').hide();
		$('#buffering').hide();
		$('#pause').show();
	}
	
	ui.showBuffering = function() {
		$('#play').hide();
		$('#pause').hide();
		$('#buffering').show();
	}
	
	ui.setPremiumStatus = function(status) {
		$('#premiumStatus').html(status);
	}
	
	return ui;
})();
