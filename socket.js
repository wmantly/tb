module.exports = function(app) {
	console.log('starting sockets');
	app.io.on('connection', function (socket){
		console.log('socket connected');
		var session = {};

		socket.join('incoming');

		var emitEvent = function(args){
			args.data = args.data || {};
			args.data.username = (session.user && session.user.username )|| 'anon';
			args.data.__date = new Date();

			if(session.user) socket.emit('event-publish', args);
		};

		var emitEventAll = function(args){
			args.data = args.data || {};
			args.data.username = (session.user && session.user.username ) || 'anon';
			args.data.__date = new Date();
			
			socket.broadcast.emit('event-publish', args);
			if(session.user) socket.emit('event-publish', args);
		};

		socket.emitEvent = emitEvent;
		socket.emitEventAll = emitEventAll;

		socket.on('event-publish', function(data){
			console.log('publish!', data.topic);
			data.__socket = socket;
			data.__session = session;
			if(session.user){
				data.jar = session.apiJar;
				data.__username = session.user.username;
			}
			app.publish(data.topic, data);
		});

		socket.on('disconnect', function() {
			console.log('disconect session');
			if(!session || !session.user) return;
			session.user.onLine = false;
			emitUserList();
			console.log('socket '+this.id+' disconnect');
		});

		socket.emit('event-publish', {
			topic: 'spa-connected',
		});

	});
};