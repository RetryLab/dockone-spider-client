
//host, userID, machineID, profileID
var server = require('./lib/server').createServer(process.env['auth_id'] || 'xe2rRYbxsa--XRjlyZVOxIkuqX4YBA8KxkM4z6aMEfg', process.env['hostname'] || '127.0.0.1:3000');

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