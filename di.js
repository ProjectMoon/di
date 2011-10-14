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
	$.get('http://www.di.fm', function(dom) {
		if ($(':contains(Welcome to DI Premium)', dom).length > 0) {
			callback(DI.__Premium);
		}
		else {
			callback(DI.__Regular);
		}
	});
};

DI.Core = (function() {
	function Station(name, playing, streams) {
		this.name = name;
		this.playing = playing;
		this.streams = streams;
	}
	
	Station.prototype.play = function() {
		alert('playing ' + this.name);
		//add pls parser call here.
		//add communication to background page here.
	}
	
	return { Station: Station };
})();

DI.__Regular = (function() {
	//non-premium implementation.
	var di = {}; //hold the API.
	var diHome = 'http://www.di.fm';
	var channelImg = 'http://static.di.fm/images/live/radio_channels_edm.gif';
	var spacer = 'http://static.di.fm/images/live/spacer.gif';
	
	/**
	 * Given the span element that holds the text of the currently
	 * playing track, create a Station object.
	 */
	function parseStationFromTrack(span) {
		var trackInfoTR = $(span).closest('tr');
		var stationNameTR = trackInfoTR.prev();
		var streamTR = trackInfoTR.find('table');
		
		var currentlyPlaying = trackInfoTR.find('span.text_trackname').text().trim();
		var stationName = stationNameTR.find('img[src!="' + spacer + '"]').attr('alt');
		
		if (typeof stationName === 'undefined') {
			stationName = stationNameTR.find('h2').html();
			stationName = stationName.replace('<br>', ' ');
		}
		
		var streams = {};
		streamTR.find('a[href^="http://listen.di.fm/"]').each(function(i, stream) {
			var href = $(stream).attr('href');
			
			//public3 = mp3 (96k), public2 = aacPlus (32k), public5 = windows media (40k)
			if (href.indexOf('public3') !== -1) {
				streams['96k'] = $(stream).attr('href');
			}
			else if (href.indexOf('public2') !== -1) {
				streams['32k'] = $(stream).attr('href');
			}
			else if (href.indexOf('public5') !== -1) {
				streams['40k'] = $(stream).attr('href');
			}
		});
		
		return new DI.Core.Station(stationName, currentlyPlaying, streams);
	}
	
	/**
	 * Retrieve a Station by name (non-premium implementation).
	 * 
	 * @param (string) name The name of the station to retrieve.
	 */
	di.getStation = function(name, callback) {
		$.get(diHome, function(dom) {
			var stationImg = $('img[alt="' + name + '"]', dom);
			
			if (stationImg.length > 0) {
				var stationNameTR = stationImg.closest('tr');
				var track = stationNameTR.next().find('span.text_trackname');
				var station = parseStationFromTrack(track);
				callback(station);
			}
			else {
				var table = $('img[src="' + channelImg + '"]', dom).closest('table');
				table.find('span.text_currently_playing').each(function(i, span) {
					var stationNameTR = $(span).closest('tr').prev();
					var stationName = stationNameTR.find('h2').html();
					
					if (stationName != null) {
						stationName = stationName.replace('<br>', ' ');
						if (name == stationName) {
							var station = parseStationFromTrack(span);
							callback(station);
							return false;
						}
					}
				});
			}
		});
	};
	
	/**
	 * Retrieve a list of all available Stations (non-premium implementation).
	 * 
	 */
	di.getStations = function(callback) {
		$.get(diHome, function(dom) {
			var stations = [];
			
			var table = $('img[src="' + channelImg + '"]', dom).closest('table');
			
			table.find('span.text_currently_playing').each(function(i, span) {
				var station = parseStationFromTrack(span);
				stations.push(station);
			});
			
			callback(stations);
		});
	};
	
	return di;
})();

DI.__Premium = (function() {
	var di = {};
	var diHome = 'http://www.di.fm';
	var channelImg = 'images/live/radio_channels_edm.gif';
	var spacer = 'images/live/spacer.gif';
	
	var imgMap = {
		'oldschoolacid.gif': 'Oldschool Acid',
		'di_myfavorite.gif': 'My Favorites',
		'classicvocaltrance.gif': 'Classic Vocal Trance',
		'ukgarage.gif': 'UK Garage'
	};
	
	/**
	 * Given the span element that holds the text of the currently
	 * playing track, create a Station object.
	 */
	function parseStationFromTrack(span) {
		var trackInfoTR = $(span).closest('tr');
		var stationNameTR = trackInfoTR.prev();
		var streamTR = trackInfoTR.find('table');
		
		//it would make more sense to filter out spacer.gif, but for
		//some reason, that doesn't work. luckily all of the spacer.gifs
		//are relative paths while the images we want are absolute.
		var currentlyPlaying = trackInfoTR.find('span.text_trackname').text().trim();
		var stationName = stationNameTR.find('img[src^="http://www.di.fm/"]').attr('src');
		
		if (typeof stationName !== 'undefined') {
			stationName = stationName.match(/\/([^\/]*.gif)/)[1];
			stationName = imgMap[stationName];
		}
		else {
			stationName = stationNameTR.find('.channel_title').html();
			stationName = stationName.replace('<br>', ' ');
		}
		
		var streams = {};
		streamTR.find('a[href^="/listen/"]').each(function(i, stream) {
			var href = $(stream).attr('href');
			
			//public3 = mp3 (96k), public2 = aacPlus (32k), public5 = windows media (40k)
			if (href.indexOf('premium.pls') !== -1) {
				streams['256k'] = href;
			}
			else if (href.indexOf('128k.pls') !== -1) {
				streams['128k'] = href;
			}
			else if (href.indexOf('128k.asx') !== -1) {
				streams['128k-win'] = href;
			}
			else if (href.indexOf('56k.asx') !== -1) {
				streams['64k-win'] = href; //yes, the link is 56k.asx
			}
			else if (href.indexOf('64k.pls') !== -1) {
				streams['64k'] = href;
			}
			else if (href.indexOf('32k.pls') !== -1) {
				streams['32k'] = href;
			}
		});
		
		return new DI.Core.Station(stationName, currentlyPlaying, streams);
	}	
	
	di.getStation = function(name, callback) {
		$.get(diHome, function(dom) {
			var imgName = name.replace(/ /g, '').toLowerCase();
			var stationImg = $('img[src*="' + imgName + '"]', dom);
			
			if (stationImg.length > 0) {
				var stationNameTR = stationImg.closest('tr');
				var track = stationNameTR.next().find('span.text_trackname');
				var station = parseStationFromTrack(track);
				callback(station);
			}
			else {
				var table = $('img[src="' + channelImg + '"]', dom).closest('table');
				table.find('span.text_currently_playing').each(function(i, span) {
					var stationNameTR = $(span).closest('tr').prev();
					var stationName = stationNameTR.find('.channel_title').html();
					
					if (stationName != null) {
						stationName = stationName.replace('<br>', ' ');
						if (name == stationName) {
							var station = parseStationFromTrack(span);
							callback(station);
							return false;
						}
					}
				});
			}
		});
	}
	
	di.getStations = function(callback) {
		$.get(diHome, function(dom) {
			var stations = [];
			
			var table = $('img[src="' + channelImg + '"]', dom).closest('table');
			
			table.find('span.text_currently_playing').each(function(i, span) {
				var station = parseStationFromTrack(span);
				stations.push(station);
			});
			
			callback(stations);
		});
	}
	
	return di;
})();
