var crypto = require('crypto');
var http = require('http');

function Docker(host, port, user_id, machine_id, profile_id) {

    if (!host)
        throw new Error('host is null.')
    if (!port)
        throw new Error('port is null.')
    if (!user_id)
        throw new Error('user_id is null.')
    if (!machine_id)
        throw new Error('machine_id is null.')
    if (!profile_id)
        throw new Error('profile_id is null.')

    this.user_id = user_id;
    this.machine_id = machine_id;
    this.profile_id = profile_id;
    this.host = host;
    this.port= port;

    this.id = "";

    var self= this;
    setInterval(function(){
        self.online();
    }, 60000)
}

Docker.prototype.setBody= function (body) {
    this.id= body._id;
    this.ip= body.ip;
}

Docker.prototype.getID= function(){
    return this.id;
}

Docker.prototype.online = function(callback) {
    console.log('docker online')
    var self= this;
    var req = http.request({
        method: "POST",
        host: this.host,
        port: this.port,
        path: '/docker/'+ this.id
    }, function(res) {
        if(!callback)
            return;
        var chunks= [];
        res.on('data', function (chunk) {
            chunks.push(chunk);
        })
        res.on('end', function () {
            var body= Buffer.concat(chunks).toString();
            try{
                body= JSON.parse(body);
            }catch(e){
                callback && callback('parse josn Error');
                return;
            }
            self.setBody(body);
            console.log('docker onlined', JSON.stringify(self));
            callback && callback(null, body);
            return;
        })
    })
    req.on('error', function(){
        callback && callback('req.error');
    })
    req.end();
};

Docker.prototype.offline = function(callback) {
    console.log('docker offline')
    var req = http.request({
        method: "DELETE",
        host: this.host,
        port: this.port,
        path: '/docker/' + this.id
    }, function(res) {
        res.on('end', function(){
            console.log('docker offlined')
            callback && callback();
        })
    })
    req.on('error', function(){
        callback && callback('req.error');
    })
    req.end();
};

module.exports = Docker;