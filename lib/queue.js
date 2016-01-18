var EventEmitter = require('events').EventEmitter;
var mission= require('./mission');
var crawler= require('./crawler');

function Queue () {

	this.queue= [];
}

Queue.prototype = new EventEmitter();

Queue.prototype.putUrls= function(urls){
	if(Array.isArray(urls))
		this.queue= this.queue.concat(urls);
	// this.emit('data');
}

Queue.prototype.getFirst = function() {
	var url= this.queue.shift();
	// if(!url){
	// 	this.emit('end');
	// }
	return url;
};

module.exports= Queue;