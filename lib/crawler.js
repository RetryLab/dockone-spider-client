var EventEmitter = require('events').EventEmitter;
var http= require('http');
var urltool= require('url');
var queue = require('./queue');


function Crawler () {
	this.regexp_links= /http:\/\/[^"|'|)|<|>|\s]+/g;
	this.regexp_filter_links= /\.(css|js|png|jpg|gif|svg|flv|mp3|mp4)($|\?)/im;
	this.regexp_chinese= /[\u4e00-\u9fa5]+/g;
	this.ERROR= require('./error');
}

Crawler.prototype = new EventEmitter();

Crawler.prototype.query = function(url, callback) {
	var self= this;
	if(!url){
		return callback && callback(self.ERROR.NOT_URL);
	}
	// var linksRegexp= /href="([^"]*)"/g;
	var starttime= Date.now();
	var linksRegexp= this.regexp_links;
	var notNormalLinksRegexp= this.regexp_filter_links;
	var regexp_chinese= this.regexp_chinese;
	var urlArr = urltool.parse(url);
	var req= http.request({
		hostname: urlArr.hostname,
		path: urlArr.path
	}, function (res) {

		// console.log('headers:', res.headers)

		if(res.headers['content-type'] !== 'text/html'){
			return callback && callback(self.ERROR.NOT_PAGE);
		}

		var chunks= [];
		res.on('data', function (chunk){
			chunks.push(chunk);
		})
		res.on('end', function(){
			var body= Buffer.concat(chunks).toString();
			// console.log(body);
			// var links= linksRegexp.exec(body);
			var content= body.match(regexp_chinese);
			var links= body.match(linksRegexp);
			var normalLinks= [];
			// console.time('start regexp.');
			links && links.forEach(function (link){
				if(notNormalLinksRegexp.test(link))
					return;
				else
					normalLinks.push(link)		
			})
			// console.log(links)
			// console.log(normalLinks, links.length, normalLinks.length)
			// console.timeEnd('start regexp.');
			console.log('crawler:', url, Date.now()- starttime);
			callback && callback(null, {
				url: url,
				content: content && content.join('|'),
				links: normalLinks
			})
		})
	})
	req.setTimeout(2500, function(){
		req.abort();
	})
	req.on('error', function(){
		callback && callback(self.ERROR.REQ_ERROR);
	})

	req.end();
};


module.exports= Crawler;