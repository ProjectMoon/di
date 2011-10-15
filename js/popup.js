function createStationHTML(station) {
	var s = $('<div class="station"></div>');
	
	s.append('<div class="stationName">' + station.name + '</div>');
	
	for (var stream in station.streams) {
		var streamDiv = $('<div class="stream">' + stream + '</div>');
		streamDiv.data('stream', station.streams[stream]);
		s.append(streamDiv);
	}
	
	return s;
}

function bindEvents() {
	$('.stream').live('click', function() {
		var pls = $(this).data('stream');
		alert(pls);
	});
}

$(function() {
	DI.exportAPI(function(di) {
		di.getStations(function(stations) {
			$('#stationList').empty();
			stations.forEach(function(station) {
				var html = createStationHTML(station);
				$('#stationList').append(html);
			});
			
			bindEvents();
		});
	});
});
