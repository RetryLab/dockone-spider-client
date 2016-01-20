var querystring = require('querystring');
var EventEmitter = require('events').EventEmitter;
var crypto = require('crypto');
var http = require('http');
var queue = require('./queue');


function Mission(host, port, user_id, machine_id, profile_id) {
    if (!host)
        throw new Error('host is null.')
    if (!port)
        throw new Error('port is null.')

    this.host = host;
    this.port = port;
    this.id = "";
    this.user_id = user_id || ""
    this.machine_id = machine_id || "";
    this.profile_id = profile_id || "";
    this.ERROR = require('./error');
}

Mission.prototype = new EventEmitter();

Mission.prototype.setId = function(id) {
    this.id = id;
}

Mission.prototype.setMachineId = function(id) {
    this.machine_id = id;
}
Mission.prototype.setUserId = function(id) {
    this.user_id = id;
}
Mission.prototype.setProfileId = function(id) {
    this.profile_id = id;
}

Mission.prototype.getMissionID = function() {
    return this.id;
    var date = new Date();
    var str = date.getTime().toString() + date.getTimezoneOffset().toString() + Math.random().toString();
    var missionID = crypto.createHash('md5').update(str).digest('hex');
    return missionID;
}

Mission.prototype.start = function(callback) {
    // console.log('mission start')
    var self = this;
    // var missionID = this.mission_id = this.getMissionID();
    var path = "/mission/" + this.id //+ "?" + querystring.stringify({user_id: this.user_id, machine_id: this.machine_id, profile_id: this.profile_id})
    var req = http.request({
        method: "GET",
        path: path,
        host: this.host,
        port: this.port
    }, function(res) {
        if (res.statusCode !== 200) {
            // console.error('report statusCode error:', res.statusCode);
            callback && callback(self.ERROR.STATUSCODE)
            return;
        }
        var chunks = [];
        res.on('data', function(chunk) {
            chunks.push(chunk);
        })
        res.on('end', function() {
            var body = Buffer.concat(chunks).toString();
            try {
                body = JSON.parse(body);
            } catch (e) {
                // console.error('report parse josn in response data error:', e.toString());
                callback && callback(self.ERROR.PARSE_JSON)
                return;
            }
            callback && callback(null, body && body.urls);
        })
    })
    req.on('error', function() {
        callback && callback(self.ERROR.REQ_ERROR);
    })
    req.end();
}

// 汇报任务结果
Mission.prototype.report = function(url, content, errorinfo, callback) {
    // console.log('mission report')
    var self = this;
    // var missionID = this.mission_id;
    var path = "/mission/" + this.id //+ "?" + querystring.stringify({user_id: this.user_id, machine_id: this.machine_id, profile_id: this.profile_id})
    // console.log('report path:', path);
    var req = http.request({
        method: "POST",
        path: path,
        host: this.host,
        port: this.port,
        headers: {
            "content-type": "application/json"
        }
    }, function(res) {
        if (res.statusCode !== 200) {
            // console.error('report statusCode error:', res.statusCode);
            callback && callback(self.ERROR.STATUSCODE)
            return;
        }
    })
    req.on('error', function() {
        callback && callback(self.ERROR.REQ_ERROR);
    })
    req.write(JSON.stringify({
        url: url,
        content: content,
        error: errorinfo,
        // links: links,
        // queue: queuenum,
    }));
    req.end();
}


// 添加urls
Mission.prototype.links = function(links, queuenum, callback) {
    // console.log('mission links')
    var self = this;
    // var missionID = this.mission_id;
    var path = "/mission/" + this.id //+ "?" + querystring.stringify({user_id: this.user_id, machine_id: this.machine_id, profile_id: this.profile_id})
    var req = http.request({
        method: "PUT",
        path: path,
        host: this.host,
        port: this.port,
        headers: {
            "content-type": "application/json"
        }
    }, function(res) {
        if (res.statusCode !== 200) {
            // console.error('report statusCode error:', res.statusCode);
            callback && callback(self.ERROR.STATUSCODE)
            return;
        }
    })
    req.on('error', function() {
        callback && callback(self.ERROR.REQ_ERROR);
    })
    req.write(JSON.stringify({
        links: links,
        queue: queuenum,
    }));
    req.end();
}



module.exports = Mission;