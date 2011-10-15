function createStationHTML(station) {
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

function bindEvents() {
	$('.stream').live('click', function() {
		var plsURL = $(this).data('stream');
		$('.stream').removeClass('selected');
		$(this).addClass('selected');
		
		localStorage["selected"] = $(this).attr('id');
	});
}

function restoreState() {
	$('#' + localStorage["selected"]).addClass('selected');
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
			restoreState();
		});
	});
});
