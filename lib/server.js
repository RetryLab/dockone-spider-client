var http = require('http');
var Docker = require('./docker');
var Queue = require('./queue');
var Mission = require('./mission');
var Crawler = require('./crawler');

function Server(authID, host, port) {
    console.log('Server arguments:', arguments)
    var self = this;
    this.authID = authID;
    this.ERROR = require('./error');
    this.host = host;
    this.port = port;
    this.userID = "";
    this.machineID = "";
    this.profileID = "";

    this.auth(function(error, profile) {
        self.userID = profile.userID;
        self.machineID = profile.machineID;
        self.profileID = profile.profileID;
        self.init();
        self.docker.online(function() {
            self.start();
        });
    });

}

Server.prototype.init = function() {
    this.docker = new Docker(this.host, this.port, this.userID, this.machineID, this.profileID);
    this.mission = new Mission(this.host, this.port);
    this.queue = new Queue();
    this.crawler = new Crawler();
}

Server.prototype.retry = function(callback) {
    var self = this;
    setTimeout(function() {
        self.auth(callback)
    }, 1000)
}

Server.prototype.auth = function(callback) {
    console.log('docker auth start:', this.authID);
    var self = this;
    var req = http.request({
        method: "GET",
        host: this.host,
        port: this.port,
        path: "/docker/" + this.authID,
        headers: {
            "content-type": "application/json"
        }
    }, function(res) {
        console.log('auth statusCode:', res.statusCode);
        if(res.statusCode === 400){
            console.error('auth fail.');
            process.exit();
            return;
        }

        if (res.statusCode !== 200) {
            // console.error('report statusCode error:', res.statusCode);
            self.retry(callback);
            return;
        }
        var chunks = []
        res.on('data', function(chunk) {
            chunks.push(chunk);
        })
        res.on('end', function() {
            var body = Buffer.concat(chunks).toString();
            try {
                body = JSON.parse(body);
            } catch (e) {
                self.retry(callback);
                return;
            }
            callback(null, body);
        })
    })
    req.on('error', function(error) {
        self.retry(callback);
    })
    req.end();
}


Server.prototype.start = function() {
    var self = this;
    this.mission.start(function(error, urls) {
        if (urls) {
            self.queue.putUrls(urls);
            self.run();
        } else {
            setTimeout(function() {
                self.start();
            }, 1000)
        }
    });
}

Server.prototype.run = function() {
    var self = this;
    var url = self.queue.getFirst();
    self.crawler.query(url, function(error, result) {
        if (error === self.crawler.ERROR.NOT_URL) {
            setTimeout(function() {
                self.start();
            }, 1000)
        } else if (result) {
            while (result.links.length) {
                self.mission.links(result.links.splice(0, 500), self.queue.queue.length);
            }
            self.mission.report(result.url, result.content, error);
            self.run();
        } else {
            self.run();
        }
    })
}

exports.createServer = function(host, port, userID, machineID, profileID) {
    return new Server(host, port, userID, machineID, profileID);
}