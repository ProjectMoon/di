function createStationHTML(station) {
	var s = $('<div class="station"></div>');
	
	s.append('<div class="stationName">' + station.name + '</div>');
	
	for (var stream in station.streams) {
		s.append('<div class="stream">' + stream + '</div>');
	}
	
	return s;
}

$(function() {
	DI.exportAPI(function(di) {
		di.getStations(function(stations) {
			$('#stationList').empty();
			stations.forEach(function(station) {
				var html = createStationHTML(station);
				$('#stationList').append(html);
			});
		});
	});
});
