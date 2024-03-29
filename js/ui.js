var UI = (function() {
	var ui = {};
	
	function isSupported(quality) {
		if (ui.getPremiumStatus() === 'Active') {
			return quality === '256k';
		}
		else {
			return quality === '96k';
		}
	}
	
	ui.createStationHTML = function(station) {
		var s = $('<div class="station"></div>');
		
		s.append('<div class="stationName">' + station.name + '</div>');
		
		for (var quality in station.streams) {
			station.streams[quality].forEach(function(link) {
				if (link.indexOf('.pls') !== - 1 && isSupported(quality)) {
					var streamDiv = $('<div class="stream">' + quality + '</div>');
					
					streamDiv.attr('data-file', link);
					streamDiv.attr('data-station', station.name);
					
					var id = station.name.replace(/ /g, '') + quality;
					streamDiv.attr('id', id);
					
					s.append(streamDiv);
				}
			});
		}
		
		return s;
	}
	
	ui.clearStations = function() {
		$('#stationList').html('Loading...');
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
		$('#station').text('');
		var marquee = $('<marquee></marquee>');
		marquee.text(station + ' :: '  + track);
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
	
	ui.getPremiumStatus = function() {
		return $('#premiumStatus').html();
	}
	
	return ui;
})();
