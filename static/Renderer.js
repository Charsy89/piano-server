var Rect = function(x, y, w, h) {
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
	this.x2 = x + w;
	this.y2 = y + h;
};
Rect.prototype.contains = function(x, y) {
	return (x >= this.x && x <= this.x2 && y >= this.y && y <= this.y2);
};



var Renderer = function() {
};

Renderer.prototype.init = function(piano) {
	this.piano = piano;
	this.resize();
	return this;
};

Renderer.prototype.resize = function(width, height) {
	if(typeof width == "undefined") width = $(this.piano.rootElement).width();
	if(typeof height == "undefined") height = Math.floor(width * 0.1435);
	$(this.piano.rootElement).css({"height": height + "px", marginTop: Math.floor($(window).height() / 2 - height / 2) + "px"});
	this.width = width * window.devicePixelRatio;
	this.height = height * window.devicePixelRatio;
};

Renderer.prototype.visualize = function(key, color) {
};



var CanvasRenderer = function() {
	Renderer.call(this);
};

CanvasRenderer.prototype = new Renderer();

CanvasRenderer.prototype.init = function(piano) {
	this.canvas = document.createElement("canvas");
	this.ctx = this.canvas.getContext("2d");
	piano.rootElement.appendChild(this.canvas);

	Renderer.prototype.init.call(this, piano); // calls resize()

	// create render loop
	var self = this;
	var render = function() {
		self.redraw();
		requestAnimationFrame(render);
	};
	requestAnimationFrame(render);

	// add event listeners
	var mouse_down = false;
	var last_key = null;
	$(piano.rootElement).mousedown(function(event) {
		mouse_down = true;
		//event.stopPropagation();
		event.preventDefault();

		var pos = CanvasRenderer.translateMouseEvent(event);
		var hit = self.getHit(pos.x, pos.y);
		if(hit) {
			MPP.press(hit.key.note,hit.v);
			last_key = hit.key;
		}
	});
	piano.rootElement.addEventListener("touchstart", function(event) {
		mouse_down = true;
		//event.stopPropagation();
		event.preventDefault();
		for(var i in event.changedTouches) {
			var pos = CanvasRenderer.translateMouseEvent(event.changedTouches[i]);
			var hit = self.getHit(pos.x, pos.y);
			if(hit) {
				MPP.press(hit.key.note, hit.v);
				last_key = hit.key;
			}
		}
	}, false);
	$(window).mouseup(function(event) {
		if(last_key) {
			MPP.release(last_key.note);
		}
		mouse_down = false;
		last_key = null;
	});

	return this;
};

CanvasRenderer.prototype.resize = function(width, height) {
	Renderer.prototype.resize.call(this, width, height);
	if(this.width < 52 * 2) this.width = 52 * 2;
	if(this.height < this.width * 0.2) this.height = Math.floor(this.width * 0.2);
	this.canvas.width = this.width;
	this.canvas.height = this.height;
	this.canvas.style.width = this.width / window.devicePixelRatio + "px";
	this.canvas.style.height = this.height / window.devicePixelRatio + "px";
		
	// calculate key sizes
	this.whiteKeyWidth = Math.floor(this.width / 51.5);
	this.whiteKeyHeight = Math.floor(this.height * 0.7);
	this.whiteKeyX = Math.floor((this.width - this.whiteKeyWidth) / 2);
	this.whiteKeyY = Math.floor(this.height - this.whiteKeyHeight * 1.2);
	this.blackKeyWidth = Math.floor(this.whiteKeyWidth * 0.75);
	this.blackKeyHeight = Math.floor(this.height * 0.4);
	this.blackKeyY = Math.floor(this.height - this.blackKeyHeight * 1.2);
	this.blackKeyX = Math.floor((this.width - this.blackKeyWidth) / 2);

	this.blackKeyOffset = Math.floor(this.whiteKeyWidth - (this.blackKeyWidth / 2));
	this.keyMovement = Math.floor(this.whiteKeyHeight * 0.015);

	this.whiteBlipWidth = Math.floor(this.whiteKeyWidth * 0.7);
	this.whiteBlipHeight = Math.floor(this.whiteBlipWidth * 0.8);
	this.whiteBlipX = Math.floor((this.whiteKeyWidth - this.whiteBlipWidth) / 2);
	this.whiteBlipY = Math.floor(this.whiteKeyHeight - this.whiteBlipHeight * 1.2);
	this.blackBlipWidth = Math.floor(this.blackKeyWidth * 0.7);
	this.blackBlipHeight = Math.floor(this.blackBlipWidth * 0.8);
	this.blackBlipY = Math.floor(this.blackKeyHeight - this.blackBlipHeight * 1.2);
	this.blackBlipX = Math.floor((this.blackKeyWidth - this.blackBlipWidth) / 2);
		
	// prerender white key
	this.whiteKeyRender = document.createElement("canvas");
	this.whiteKeyRender.width = this.whiteKeyWidth;
	this.whiteKeyRender.height = this.height + 10;
	var ctx = this.whiteKeyRender.getContext("2d");
	if(ctx.createLinearGradient) {
		var gradient = ctx.createLinearGradient(0, 0, 0, this.whiteKeyHeight);
		gradient.addColorStop(0, "#999");
		gradient.addColorStop(0.75, "#aaa");
		gradient.addColorStop(1, "#858080");
		ctx.fillStyle = gradient;
	} else {
		ctx.fillStyle = "#fff";
	}
	ctx.strokeStyle = "#000";
	ctx.lineJoin = "round";
	ctx.lineCap = "round";
	ctx.lineWidth = 5;
	ctx.strokeRect(ctx.lineWidth / 2, ctx.lineWidth / 2, this.whiteKeyWidth - ctx.lineWidth, this.whiteKeyHeight - ctx.lineWidth);
	ctx.lineWidth = 2;
	ctx.fillRect(ctx.lineWidth / 2, ctx.lineWidth / 2, this.whiteKeyWidth - ctx.lineWidth, this.whiteKeyHeight - ctx.lineWidth);
		
	// prerender black key
	this.blackKeyRender = document.createElement("canvas");
	this.blackKeyRender.width = this.blackKeyWidth + 10;
	this.blackKeyRender.height = this.blackKeyHeight + 10;
	var ctx = this.blackKeyRender.getContext("2d");
	if(ctx.createLinearGradient) {
		var gradient = ctx.createLinearGradient(0, 0, 0, this.blackKeyHeight);
		gradient.addColorStop(0, "#000");
		gradient.addColorStop(1, "#222");
		ctx.fillStyle = gradient;
	} else {
		ctx.fillStyle = "#000";
	}
	ctx.strokeStyle = "#222";
	ctx.lineJoin = "round";
	ctx.lineCap = "round";
	ctx.lineWidth = 4;
	ctx.strokeRect(ctx.lineWidth / 2, ctx.lineWidth / 2, this.blackKeyWidth - ctx.lineWidth, this.blackKeyHeight - ctx.lineWidth);
	ctx.lineWidth = 2;
	ctx.fillRect(ctx.lineWidth / 2, ctx.lineWidth / 2, this.blackKeyWidth - ctx.lineWidth, this.blackKeyHeight - ctx.lineWidth);

	// prerender shadows
	this.shadowRender = [];
	var y = -this.canvas.height * 2;
	for(var j = 0; j < 2; j++) {
		var canvas = document.createElement("canvas");
		this.shadowRender[j] = canvas;
		canvas.width = this.canvas.width;
		canvas.height = this.canvas.height;
		var ctx = canvas.getContext("2d");
		var sharp = j ? true : false;
		ctx.lineJoin = "round";
		ctx.lineCap = "round";
		ctx.lineWidth = 1;
		ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
		ctx.shadowBlur = this.keyMovement * 3;
		ctx.shadowOffsetY = -y + this.keyMovement;
		if(sharp) {
			ctx.shadowOffsetX = this.keyMovement;
		} else {
			ctx.shadowOffsetX = 0;
			ctx.shadowOffsetY = -y + this.keyMovement;
		}
		for(var i in this.piano.keys) {
			if(!this.piano.keys.hasOwnProperty(i)) continue;
			var key = this.piano.keys[i];
			if(key.sharp != sharp) continue;

			if(key.sharp) {
				ctx.fillRect(this.blackKeyOffset + this.whiteKeyWidth * key.spatial + ctx.lineWidth / 2,
					y + ctx.lineWidth / 2,
					this.blackKeyWidth - ctx.lineWidth, this.blackKeyHeight - ctx.lineWidth);
			} else {
				ctx.fillRect(this.whiteKeyWidth * key.spatial + ctx.lineWidth / 2,
					y + ctx.lineWidth / 2,
					this.whiteKeyWidth - ctx.lineWidth, this.whiteKeyHeight - ctx.lineWidth);
			}
		}
	}

	// update key rects
	for(var i in this.piano.keys) {
		if(!this.piano.keys.hasOwnProperty(i)) continue;
		var key = this.piano.keys[i];
		if(key.sharp) {
			key.rect = new Rect(this.blackKeyOffset + this.whiteKeyWidth * key.spatial, 0,
				this.blackKeyWidth, this.blackKeyHeight);
		} else {
			key.rect = new Rect(this.whiteKeyWidth * key.spatial, 0,
				this.whiteKeyWidth, this.whiteKeyHeight);
		}
	}
};

CanvasRenderer.prototype.visualize = function(key, color) {
	key.timePlayed = Date.now();
	key.blips.push({"time": key.timePlayed, "color": color});
};

CanvasRenderer.prototype.redraw = function() {
	var now = Date.now();
	var timeLoadedEnd = now - 1000;
	var timePlayedEnd = now - 100;
	var timeBlipEnd = now - 1000;

	this.ctx.save();
	this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	// draw all keys
	for(var j = 0; j < 2; j++) {
		this.ctx.globalAlpha = 1.0;
		this.ctx.drawImage(this.shadowRender[j], 0, 0);
		var sharp = j ? true : false;
		for(var i in this.piano.keys) {
			if(!this.piano.keys.hasOwnProperty(i)) continue;
			var key = this.piano.keys[i];
			if(key.sharp != sharp) continue;

			if(!key.loaded) {
				this.ctx.globalAlpha = 0.2;
			} else if(key.timeLoaded > timeLoadedEnd) {
				this.ctx.globalAlpha = ((now - key.timeLoaded) / 1000) * 0.8 + 0.2;
			} else {
				this.ctx.globalAlpha = 1.0;
			}
			var y = 0;
			if(key.timePlayed > timePlayedEnd) {
				y = Math.floor(this.keyMovement - (((now - key.timePlayed) / 100) * this.keyMovement));
			}
			var x = Math.floor(key.sharp ? this.blackKeyOffset + this.whiteKeyWidth * key.spatial
				: this.whiteKeyWidth * key.spatial);
			var image = key.sharp ? this.blackKeyRender : this.whiteKeyRender;
			this.ctx.drawImage(image, x, y);

			function roundRect(ctx,x,y,width,height,radius,fill,stroke,strokecolor,strokealpha,bloop){
				if(typeof stroke == "undefined") stroke = true;
				if(typeof radius === "undefined") radius = 5;
				ctx.beginPath();
				ctx.lineTo(x+width-radius,y);
				ctx.quadraticCurveTo(x+width,y,x+width,y+radius);
				ctx.lineTo(x+width,y+height-radius);
				ctx.quadraticCurveTo(x+width,y+height,x+width-radius,y+height);
				ctx.lineTo(x+radius,y+height);
				ctx.quadraticCurveTo(x,y+height,x,y+height-radius);
				ctx.lineTo(x,y+radius);
				ctx.quadraticCurveTo(x,y,x+radius,y);
				ctx.closePath();
				if(stroke){ctx.globalAlpha = strokealpha-((now-bloop.time)/1000); ctx.strokeStyle = strokecolor; ctx.stroke();}
				if(fill){ctx.globalAlpha = strokealpha-((now-bloop.time)/1000); ctx.fillStyle = bloop.color; ctx.fill();}
			}

			// render blips
			if(key.blips.length) {
				var alpha = this.ctx.globalAlpha;
				var w, h;
				if(key.sharp) {
					x += this.blackBlipX;
					y = this.blackBlipY;
					w = this.blackBlipWidth;
					h = this.blackBlipHeight;
				} else {
					x += this.whiteBlipX;
					y = this.whiteBlipY;
					w = this.whiteBlipWidth;
					h = this.whiteBlipHeight;
				}
				for(var b = 0; b < key.blips.length; b++) {
					var blip = key.blips[b];
					var color = new Color(blip.color);
					color.add(-0x40,-0x40,-0x40);
					color = color.toHexa;
					if(blip.time > timeBlipEnd) {
						roundRect(this.ctx,x,y,w,h,5,true,true,color,alpha,blip);
						//this.ctx.fillStyle = blip.color;
						//this.ctx.globalAlpha = alpha - ((now - blip.time) / 1000);
						//this.ctx.fillRect(x, y, w, h);
					} else {
						key.blips.splice(b, 1);
						--b;
					}
					y -= Math.floor(h * 1.1);
				}
			}
		}
	}
	this.ctx.restore();
};

CanvasRenderer.prototype.getHit = function(x, y) {
	for(var j = 0; j < 2; j++) {
		var sharp = j ? false : true; // black keys first
		for(var i in this.piano.keys) {
			if(!this.piano.keys.hasOwnProperty(i)) continue;
			var key = this.piano.keys[i];
			if(key.sharp != sharp) continue;
			if(key.rect.contains(x, y)) {
				var v = y / (key.sharp ? this.blackKeyHeight : this.whiteKeyHeight);
				v += 0.25;
				v *= DEFAULT_VELOCITY;
				if(v > 1.0) v = 1.0;
				return {"key": key, "v": v};
			}
		}
	}
	return null;
};


CanvasRenderer.isSupported = function() {
	var canvas = document.createElement("canvas");
	return !!(canvas.getContext && canvas.getContext("2d"));
};

CanvasRenderer.translateMouseEvent = function(evt) {
	var element = evt.target;
	var offx = 0;
	var offy = 0;
	do {
		if(!element) break; // wtf, wtf?
		offx += element.offsetLeft;
		offy += element.offsetTop;
	} while(element = element.offsetParent);
	return {
		x: (evt.pageX - offx) * window.devicePixelRatio,
		y: (evt.pageY - offy) * window.devicePixelRatio
	}
};
