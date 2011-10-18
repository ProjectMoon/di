/*
 * comm_player.js
 * 
 * communicate with the background page that handles audio playback.
 */
 
var Player = (function() {
	//reference to the audio player background page.
	var bpDocument = chrome.extension.getBackgroundPage().document;
	
	//hold this API.
	var player = {};
	
	//Events. Fired automatically by play and pause.
	player.onPlay = null;
	player.onPause = null;
	
	//get the player on the background page.
	function getPlayer() {
		return bpDocument.getElementById('audioPlayer');
	}
	
	//bind some audio player events.
	getPlayer().addEventListener('playing', function(e) {
		if (player.onPlay != null && typeof player.onPlay === 'function') {
			player.onPlay(e);
		}
	});
	
	getPlayer().addEventListener('pause', function(e) {
		if (player.onPause != null && typeof player.onPause === 'function') {
			player.onPause(e);
		}
	});
	
	getPlayer().addEventListener('error', function(e) {
		if (player.onError != null && typeof player.onError === 'function') {
			player.onError(getPlayer().error.code);
		}
	});
	
	/**
	 * Tells the player to play the specified URL.
	 */
	player.play = function(url) {
		var diPlayer = getPlayer();
		diPlayer.src = url;
		diPlayer.play();
		player.setURL(url);
		player.setStatus('playing');
	}
	
	/**
	 * Pauses the player.
	 */
	player.pause = function() {
		var diPlayer = getPlayer();
		diPlayer.pause();
		player.setStatus('paused');
	}
	
	/**
	 * Resumes the player.
	 */
	player.resume = function() {
		var diPlayer = getPlayer();
		diPlayer.src = ''; //clear source so we catch up.
		diPlayer.src = player.getURL();
		diPlayer.play();
		player.setStatus('playing');
	}
	
	/**
	 * Set the player status.
	 */
	player.setStatus = function(status) {
		localStorage['PlayerStatus'] = status;
	}
	
	/**
	 * Gets the current status: playing, paused, etc.
	 */
	player.getStatus = function() {
		return localStorage['PlayerStatus'];
	}
		
	/**
	 * Set the current URL to play.
	 */
	player.setURL = function(url) {
		localStorage['PlayerURL'] = url;
	}
	
	/**
	 * Retrieve the URL that is playing or was last played.
	 */
	player.getURL = function() {
		return localStorage['PlayerURL'];
	}
	
	return player;	
})();
