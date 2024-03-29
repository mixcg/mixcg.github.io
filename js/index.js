document.addEventListener("DOMContentLoaded", function() {
	demo.init();
	window.addEventListener('resize', demo.resize);
});
var demo = {
	speed: 0.6,
	color: {
		r: '245',
		g: '245',
		b: '245',
		a: '0.5'
	},
	started: false,
	canvas: null,
	ctx: null,
	width: 0,
	height: 0,
	dpr: window.devicePixelRatio || 1,
	drop_time: 0,
	drop_delay: 25,
	wind: 6,
	rain_color: null,
	rain_color_clear: null,
	rain: [],
	rain_pool: [],
	drops: [],
	drop_pool: []
};
demo.init = function() {
	if(!demo.started) {
		demo.started = true;
		demo.canvas = document.getElementById('rain');
		demo.ctx = demo.canvas.getContext('2d');
		var c = demo.color;
		demo.rain_color = 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + c.a + ')';
		demo.rain_color_clear = 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',0)';
		demo.resize();
		Ticker.addListener(demo.step);
		const gui = new dat.GUI();
		gui.add(demo, 'speed', 0.2, 1);
		var instructions = document.getElementById('instructions');
		setTimeout(function() {
			instructions.style.opacity = 0;
			setTimeout(function() {
				instructions.parentNode.removeChild(instructions);
			}, 2000);
		}, 4000);
	}
}
demo.resize = function() {
	var rain = demo.rain;
	var drops = demo.drops;
	for(var i = rain.length - 1; i >= 0; i--) {
		rain.pop().recycle();
	}
	for(var i = drops.length - 1; i >= 0; i--) {
		drops.pop().recycle();
	}
	demo.width = window.innerWidth;
	demo.height = window.innerHeight;
	demo.canvas.width = demo.width * demo.dpr;
	demo.canvas.height = demo.height * demo.dpr;
}
demo.step = function(time, lag) {
	var demo = window.demo;
	var speed = demo.speed;
	var width = demo.width;
	var height = demo.height;
	var wind = demo.wind;
	var rain = demo.rain;
	var rain_pool = demo.rain_pool;
	var drops = demo.drops;
	var drop_pool = demo.drop_pool;
	var multiplier = speed * lag;
	demo.drop_time += time * speed;
	while(demo.drop_time > demo.drop_delay) {
		demo.drop_time -= demo.drop_delay;
		var new_rain = rain_pool.pop() || new Rain();
		new_rain.init();
		var wind_expand = Math.abs(height / new_rain.speed * wind);
		var spawn_x = Math.random() * (width + wind_expand);
		if(wind > 0) spawn_x -= wind_expand;
		new_rain.x = spawn_x;
		rain.push(new_rain);
	}
	for(var i = rain.length - 1; i >= 0; i--) {
		var r = rain[i];
		r.y += r.speed * r.z * multiplier;
		r.x += r.z * wind * multiplier;
		if(r.y > height) {
			r.splash();
		}
		if(r.y > height + Rain.height * r.z || (wind < 0 && r.x < wind) || (wind > 0 && r.x > width + wind)) {
			r.recycle();
			rain.splice(i, 1);
		}
	}
	var drop_max_speed = Drop.max_speed;
	for(var i = drops.length - 1; i >= 0; i--) {
		var d = drops[i];
		d.x += d.speed_x * multiplier;
		d.y += d.speed_y * multiplier;
		d.speed_y += 0.3 * multiplier;
		d.speed_x += wind / 25 * multiplier;
		if(d.speed_x < -drop_max_speed) {
			d.speed_x = -drop_max_speed;
		} else if(d.speed_x > drop_max_speed) {
			d.speed_x = drop_max_speed;
		}
		if(d.y > height + d.radius) {
			d.recycle();
			drops.splice(i, 1);
		}
	}
	demo.draw();
}
demo.draw = function() {
	var demo = window.demo;
	var width = demo.width;
	var height = demo.height;
	var dpr = demo.dpr;
	var rain = demo.rain;
	var drops = demo.drops;
	var ctx = demo.ctx;
	ctx.clearRect(0, 0, width * dpr, height * dpr);
	ctx.beginPath();
	var rain_height = Rain.height * dpr;
	for(var i = rain.length - 1; i >= 0; i--) {
		var r = rain[i];
		var real_x = r.x * dpr;
		var real_y = r.y * dpr;
		ctx.moveTo(real_x, real_y);
		ctx.lineTo(real_x - demo.wind * r.z * dpr * 1.5, real_y - rain_height * r.z);
	}
	ctx.lineWidth = Rain.width * dpr;
	ctx.strokeStyle = demo.rain_color;
	ctx.stroke();
	for(var i = drops.length - 1; i >= 0; i--) {
		var d = drops[i];
		var real_x = d.x * dpr - d.radius;
		var real_y = d.y * dpr - d.radius;
		ctx.drawImage(d.canvas, real_x, real_y);
	}
}

function Rain() {
	this.x = 0;
	this.y = 0;
	this.z = 0;
	this.speed = 25;
	this.splashed = false;
}
Rain.width = 2;
Rain.height = 40;
Rain.prototype.init = function() {
	this.y = Math.random() * -100;
	this.z = Math.random() * 0.5 + 0.5;
	this.splashed = false;
}
Rain.prototype.recycle = function() {
	demo.rain_pool.push(this);
}
Rain.prototype.splash = function() {
	if(!this.splashed) {
		this.splashed = true;
		var drops = demo.drops;
		var drop_pool = demo.drop_pool;
		for(var i = 0; i < 16; i++) {
			var drop = drop_pool.pop() || new Drop();
			drops.push(drop);
			drop.init(this.x);
		}
	}
}

function Drop() {
	this.x = 0;
	this.y = 0;
	this.radius = Math.round(Math.random() * 2 + 1) * demo.dpr;
	this.speed_x = 0;
	this.speed_y = 0;
	this.canvas = document.createElement('canvas');
	this.ctx = this.canvas.getContext('2d');
	var diameter = this.radius * 2;
	this.canvas.width = diameter;
	this.canvas.height = diameter;
	var grd = this.ctx.createRadialGradient(this.radius, this.radius, 1, this.radius, this.radius, this.radius);
	grd.addColorStop(0, demo.rain_color);
	grd.addColorStop(1, demo.rain_color_clear);
	this.ctx.fillStyle = grd;
	this.ctx.fillRect(0, 0, diameter, diameter);
}
Drop.max_speed = 5;
Drop.prototype.init = function(x) {
	this.x = x;
	this.y = demo.height;
	var angle = Math.random() * Math.PI - (Math.PI * 0.5);
	var speed = Math.random() * Drop.max_speed;
	this.speed_x = Math.sin(angle) * speed;
	this.speed_y = -Math.cos(angle) * speed;
}
Drop.prototype.recycle = function() {
	demo.drop_pool.push(this);
}
demo.mouseHandler = function(evt) {
	demo.updateCursor(evt.clientX, evt.clientY);
}
demo.touchHandler = function(evt) {
	evt.preventDefault();
	var touch = evt.touches[0];
	demo.updateCursor(touch.clientX, touch.clientY);
}
demo.updateCursor = function(x, y) {
	x /= demo.width;
	y /= demo.height;
	var y_inverse = (1 - y);
	demo.drop_delay = y_inverse * y_inverse * y_inverse * 100 + 2;
	demo.wind = (x - 0.5) * 50;
}
document.addEventListener('mousemove', demo.mouseHandler);
document.addEventListener('touchstart', demo.touchHandler);
document.addEventListener('touchmove', demo.touchHandler);
var Ticker = (function() {
	var PUBLIC_API = {};
	PUBLIC_API.addListener = function addListener(fn) {
		if(typeof fn !== 'function') throw('Ticker.addListener() requires a function reference passed in.');
		listeners.push(fn);
		if(!started) {
			started = true;
			queueFrame();
		}
	};
	var started = false;
	var last_timestamp = 0;
	var listeners = [];

	function queueFrame() {
		if(window.requestAnimationFrame) {
			requestAnimationFrame(frameHandler);
		} else {
			webkitRequestAnimationFrame(frameHandler);
		}
	}

	function frameHandler(timestamp) {
		var frame_time = timestamp - last_timestamp;
		last_timestamp = timestamp;
		if(frame_time < 0) {
			frame_time = 17;
		} else if(frame_time > 68) {
			frame_time = 68;
		}
		for(var i = 0, len = listeners.length; i < len; i++) {
			listeners[i].call(window, frame_time, frame_time / 16.67);
		}
		queueFrame();
	}
	return PUBLIC_API;
}());