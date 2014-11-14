var pomelo = require('pomelo');
var routeUtil = require('./app/util/routeUtil');
/**
 * Init app for client.
 */
var app = pomelo.createApp();
app.set('name', 'chatofpomelo-websocket');

// app configuration
app.configure('production|development', 'connector', function(){
	app.set('connectorConfig',
		{
			connector : pomelo.connectors.hybridconnector,
			heartbeat : 3,
			useDict : true,
			useProtobuf : true
		});
});

app.configure('production|development', 'gate', function(){
	app.set('connectorConfig',
		{
			connector : pomelo.connectors.hybridconnector,
			useProtobuf : true,
			useDict:true
		});
});

// app configure
app.configure('production|development', function() {
	// route configures
	app.route('chat', routeUtil.chat);
	var router = function(routeParam, msg, context, cb) {
		var timeServers = app.getServersByType('time');
		console.log(timeServers.length)
		var id = timeServers[routeParam % timeServers.length].id;
		cb(null, id);
	}

	app.route('time', router);

	// filter configures
	app.filter(pomelo.timeout());
});

var abuseFilter = require('./app/servers/chat/filter/abuseFilter');
app.configure('production|development', 'chat', function() {
	app.filter(abuseFilter());
})


// start app
app.start();

process.on('uncaughtException', function(err) {
	console.error(' Caught exception: ' + err.stack);
});