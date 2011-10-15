/*
 * background.js -- do stuff when the background page loads
 */
$(function() {
	//restore stream from previous session so play button
	//works. always paused when starting up.
	//can't use comm_player.js because of circular dependency.
	$('#audioPlayer').attr('src', localStorage['PlayerURL']);
	localStorage['PlayerStatus'] = 'paused';
});
