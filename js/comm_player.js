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
	
	/**
	 * Tells the player to play the specified URL.
	 */
	player.play = function(url) {
		var diPlayer = getPlayer();
		diPlayer.src = url;
		diPlayer.play();
		player.setStatus('playing');
	}
	
	/**
	 * Pauses the player.
	 */
	player.pause = function(callback) {
		var diPlayer = getPlayer();
		diPlayer.pause();
		player.setStatus('paused');
	}
	
	/**
	 * Resumes the player.
	 */
	player.resume = function() {
		var diPlayer = getPlayer();
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
	 * Gets an object holding the current station and track.
	 */
	player.getInfo = function() {
		return localStorage['PlayerInfo'];
	}
	
	return player;	
})();
