/*
 * comm_player.js
 * 
 * communicate with the background page that handles audio playback.
 */
 
var Player = (function() {
	var player = {};
	
	/**
	 * Tells the player to play the specified URL. Callback
	 * fired on success or error.
	player.play = function(url, callback) {
		
	}
	
	/**
	 * Pauses the player. callback fired on success
	 * or error.
	 */
	player.pause = function(callback) {
		
	}
	
	/**
	 * Gets the current status: playing, paused, etc.
	 */
	player.getStatus = function() {
		return localStorage["PlayerStatus"];
	}
	
	/**
	 * Gets an object holding the current station and track.
	 */
	player.getInfo = function() {
		return localStorage["PlayerInfo"];
	}
	
	return player;	
})();
