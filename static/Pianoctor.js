var PianoKey = function(note, octave) {
	this.note = note + octave;
	this.baseNote = note;
	this.octave = octave;
	this.sharp = note.indexOf("s") != -1;
	this.loaded = false;
	this.timeLoaded = 0;
	this.domElement = null;
	this.timePlayed = 0;
	this.blips = [];
};

var Piano = function(rootElement) {
	
	var piano = this;
	piano.rootElement = rootElement;
	piano.keys = {};
		
	var white_spatial = 0;
	var black_spatial = 0;
	var black_it = 0;
	var black_lut = [2, 1, 2, 1, 1];
	var addKey = function(note, octave) {
		var key = new PianoKey(note, octave);
		piano.keys[key.note] = key;
		if(key.sharp) {
			key.spatial = black_spatial;
			black_spatial += black_lut[black_it % 5];
			++black_it;
		} else {
			key.spatial = white_spatial;
			++white_spatial;
		}
	}
	if(test_mode) {
		addKey("c", 2);
	} else {
		addKey("a", -1);
		addKey("as", -1);
		addKey("b", -1);
		var notes = "c cs d ds e f fs g gs a as b".split(" ");
		for(var oct = 0; oct < 7; oct++) {
			for(var i in notes) {
				addKey(notes[i], oct);
			}
		}
		addKey("c", 7);
	}


	this.renderer = new CanvasRenderer().init(this);
		
	window.addEventListener("resize", function() {
		piano.renderer.resize();
	});


	window.AudioContext = window.AudioContext || window.webkitAudioContext || undefined;
	var audio_engine = AudioEngineWeb;
	this.audio = new audio_engine().init();
};

Piano.prototype.play = function(note, vol, participant, delay_ms) {
	if(!this.keys.hasOwnProperty(note)) return;
	var key = this.keys[note];
	if(key.loaded) this.audio.play(key.note, vol, delay_ms, participant.id);
	var self = this;
	var jq_namediv = $(typeof participant == "undefined" ? null : participant.nameDiv);
	if(jq_namediv) {
		setTimeout(function() {
			self.renderer.visualize(key, typeof participant == "undefined" ? "yellow" : (participant.color || "#777"));
			jq_namediv.addClass("play");
			setTimeout(function() {
				jq_namediv.removeClass("play");
			}, 30);
		}, delay_ms);
	}
};

Piano.prototype.stop = function(note, participant, delay_ms) {
	if(!this.keys.hasOwnProperty(note)) return;
	var key = this.keys[note];
	if(key.loaded) this.audio.stop(key.note, delay_ms, participant.id);
	if(typeof gMidiOutTest === "function") gMidiOutTest(key.note, 0, delay_ms);
};