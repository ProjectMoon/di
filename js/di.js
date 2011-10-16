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

/**
 * Contains classes for stuff on DI.fm.
 */
DI.Core = (function() {
	//Station class.
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
	
	//Export everything.
	return { Station: Station };
})();

/**
 * Implementation of API for the regular (non-premium) site.
 * Obtained by using DI.exportAPI function.
 */
DI.__Regular = (function() {
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
			
			//public3 = mp3 (96k)
			//public2 = aacPlus (32k)
			//public5 = windows media (40k)
			if (href.indexOf('public3') !== -1) {
				streams['96k'] = href;
			}
			else if (href.indexOf('public2') !== -1) {
				streams['32k'] = href;
			}
			else if (href.indexOf('public5') !== -1) {
				streams['40k'] = href
			}
		});
		
		return new DI.Core.Station(stationName, currentlyPlaying, streams);
	}
	
	//API definition.
	var di = {};
	
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
	
	//Export API
	return di;
})();

/**
 * Implementation of API for premium version of the website. Obtained from
 * DI.exportAPI function.
 */
DI.__Premium = (function() {
	var diHome = 'http://www.di.fm';
	var channelImg = 'images/live/radio_channels_edm.gif';
	var spacer = 'images/live/spacer.gif';
	var imgPrefix = 'http://www.di.fm/images/live/';
	var imgSuffix = '.gif';
	
	var imgMap = {
		'oldschoolacid.gif': 'Oldschool Acid',
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
		var stationNameEl = stationNameTR.find('.channel_title');//'img[src^="http://www.di.fm/"]').attr('src');
		
		if (stationNameEl.children('img').length > 0) {
			var stationName = stationNameEl.find('img[src^="http://www.di.fm/"]').attr('src');
			if (typeof stationName !== 'undefined') {
				stationName = stationName.match(/\/([^\/]*.gif)/)[1];
				stationName = imgMap[stationName];
			}
			else {
				//try My Favorites. it's a special case.
				var stationName = stationNameEl.children('img[alt="My Favorites"]');
				if (stationName.length > 0) {
					stationName = 'My Favorites';
				}
				else {
					stationName = 'Unknown';
				}
			}
		}
		else {
			//it's a text station name.
			stationName = stationNameEl.html();
			stationName = stationName.replace('<br>', ' ');
		}
		
		var streams = {};
		streamTR.find('a[href^="/listen"]').each(function(i, stream) {
			var href = $(stream).attr('href');
			
			if (href.indexOf('premium.pls') !== -1) {
				streams['256k'] = href;
			}
			else if (href.indexOf('128k.pls') !== -1) {
				streams['128k'] = href;
			}
			else if (href.indexOf('128k.asx') !== -1) {
				streams['128w'] = href;
			}
			else if (href.indexOf('56k.asx') !== -1) {
				streams['64w'] = href; //yes, the link is 56k.asx
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
	
	//API definition.
	var di = {};
	di.getStation = function(name, callback) {
		$.get(diHome, function(dom) {
			//my favorites is special case.
			if (name == 'My Favorites') {
				var stationImg = $('img[alt="My Favorites"]', dom);
				var track = stationImg.closest('tr').next().find('span.text_currently_playing');
				var station = parseStationFromTrack(track);
				callback(station);
				return;
			}
			
			//then we go on to try images or text names.
			var imgName = name.replace(/ /g, '').toLowerCase();
			var stationImg = $('img[src="' + imgPrefix + imgName + imgSuffix + '"]', dom);
			
			if (stationImg.length > 0) {
				var stationNameTR = stationImg.closest('tr');
				var track = stationNameTR.next().find('span.text_trackname');
				var station = parseStationFromTrack(track);
				callback(station);
			}
			else {
				//everything else.
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
	
	//Export API.
	return di;
})();
