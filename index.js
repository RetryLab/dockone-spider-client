
//host, userID, machineID, profileID
// process.env['host']= '127.0.0.1';
// process.env['port']= 80;
// process.env['auth_id']= "xe2rRYbxsa--XRjlyZVOxIkuqX4YBA8KxkM4z6aMEfg";

var server = require('./lib/server').createServer(process.env['auth_id'], process.env['host'], process.env['port']);

process.on('exit', function() {
    console.log('docker exit');
    server.docker.offline(function() {
    	console.log('docker can exit');
    })
    setTimeout(function(){
    	console.log('process can exit');
        process.exit();
    }, 1000)
})