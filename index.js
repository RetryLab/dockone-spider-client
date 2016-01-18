
//host, userID, machineID, profileID
// process.env['hostname']= '127.0.0.1:3000';
// process.env['auth_id']= "xe2rRYbxsa--XRjlyZVOxIkuqX4YBA8KxkM4z6aMEfg";
var server = require('./lib/server').createServer(process.env['auth_id'], process.env['hostname']);

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