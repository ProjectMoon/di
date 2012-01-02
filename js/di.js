/*
 * di.js - library for parsing the DI.fm website
 * 
 * Provides programmatic access to the di.fm stations,
 * streams, and track information.
 */

var DI = {};

/**
 * Export the regular or premium API, based on the logged-in
 * user's state.
 */
DI.exportAPI = function(callback) {
	callback(DI.__API);
};

/**
 * Contains classes for stuff on DI.fm.
 */
DI.Core = (function() {
	//Station class.
	function Station(name, trackInfo, streams) {
		this.name = name;
		this.trackInfo = trackInfo;
		this.streams = streams;
	}
	
	Station.prototype.play = function() {
		alert('playing ' + this.name);
		//add pls parser call here.
		//add communication to background page here.
	}
	
	//Export everything.
	return { Station: Station };
})();

DI.__API = (function() {
	var di = {};
	
	var diHome = 'http://www.di.fm';
	
	function getTracks(callback) {
		$.ajax({
			url: 'http://api.v2.audioaddict.com/v1/di/track_history.json',
			cache: false,
			dataType: 'json',
			success: function(data) {
				callback(data);
			},
			error: function(xhr, err, status) {
				throw new Error(err);
			}
		});
	}
	
	function parseStation(li, trackData) {
		var id = $(li).attr('data-id');
		var stationName = $(li).find('.channel > a').text().trim();
		var nowPlaying = trackData[id];
		var streams = {};
		
		$(li).find('img[alt^="Icon.tunein"]').each(function(i, img) {
			var alt = $(img).attr('alt');
			var start = 'Icon.tunein.'.length;
			var quality = alt.substring(start, alt.indexOf('.', start));
			var href = $(img).parent().attr('href'); //parent is always the link to the stream
			streams[quality] = href;
		});
		
		return new DI.Core.Station(stationName, nowPlaying, streams);
	}
	
	di.getStation = function(name, callback) {
		$.get(diHome, function(dom) {
			var possibleStations = $(dom).find('p.channel:contains(' + name + ')');
			var base, found;
			
			possibleStations.each(function(i, possibleStation) {
				if ($(possibleStation).text().trim() === name) {
					base = $(possibleStation).closest('li[data-key]');
					found = true;
					return false;
				}
			});
			
			if (!found) {
				throw new Error('Could not find station "' + name + '"');
			}
			
			getTracks(function(trackData) {
				var station = parseStation(base, trackData);
				callback(station);
			});
		});
	}
	
	di.getStations = function(callback) {
		$.get(diHome, function(dom) {
			getTracks(function(trackData) {
				var stations = [];
				$(dom).find('li[data-key]').each(function(i, li) {
					var station = parseStation(li, trackData);
					stations.push(station);
				});
				
				callback(stations);
			});
		});
	}
	
	return di;
})();
