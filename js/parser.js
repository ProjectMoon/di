var Parser = (function() {
	/**
	 * Parses a PLS file and returns an object representing the file's
	 * structure and values.
	 */
	function parsePLS(contents) {
		var lines = contents.split(/\n/);
		var plsInfo = {};
		var recordList = [];	
		
		//the fun way to get objects from the array.
		function records(index) {
			if (typeof recordList[index] === 'undefined') {
				recordList[index] = {};
			}
			return recordList[index];
		}
		
		for (var c = 0; c < lines.length; c++) {
			var line = lines[c];
			var match = line.match(/^.*(\d)=/);
			if (match != null) var num = match[1]; //not always used.
			
			var value = line.split('=')[1];
			
			if (line.indexOf('File') == 0) {
				records(num).file = value;
			}
			else if (line.indexOf('Title') == 0) {
				records(num).title = value;
			}
			else if (line.indexOf('Length') == 0) {
				records(num).length = parseInt(value);
			}
			else if (line.indexOf('Version') == 0) {
				plsInfo.version = parseInt(value);
			}
			else if (line.indexOf('NumberOfEntries') == 0) {
				plsInfo.length = parseInt(value);
			}
		}
		
		plsInfo.records = recordList;
		
		return plsInfo;
	}
	
	/**
	 * Parses an ASX file and returns an object representing the file's
	 * structures and values.
	 */
	function parseASX(contents) {
		//use jquery since this is on a webpage.
		var xml = $(contents);
		
		var asxInfo = {};
		asxInfo.version = xml.attr('version');
		asxInfo.title = xml.children('title').text();
		asxInfo.author = xml.children('author').text();
		asxInfo.copyright = xml.children('copyright').text();
		
		var records = [];		
		xml.children('entry').each(function(i, entry) {
			var record = {
				title: $(entry).children('title').text(),
				file: $(entry).children('ref').attr('href'),
				author: $(entry).children('author').text()
			};
			
			records.push(record);
		});
		
		asxInfo.records = records;
		return asxInfo;
	}
	
	//API export.
	var parser = {};
	
	/**
	 * Parses a file that stores media info. Currently supports PLS
	 * and ASX.
	 */
	parser.parse = function(extension, contents) {
		if (extension == 'pls') {
			return parsePLS(contents);
		}
		else if (extension == 'asx') {
			return parseASX(contents);
		}
		else {
			throw 'Unrecognized file extension ' + extension;
		}
	}
	
	return parser;
})();
