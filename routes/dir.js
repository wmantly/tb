var fs = require('fs');
var probe = require('node-ffprobe');
var ffmpeg = require('fluent-ffmpeg');
var lodash = require('lodash');

var parseParentPointer = function(path){
	while(path.match(/^\/*\.\.\//)) path = path.replace(/^\/*\.\.\//, '');

	return path
};

/* The list of types should be moved to database and be more be detailed*/
var typeList = {
	folder: {
		type: 'folder'
	},
	mp4: {
		type: 'video'
	},
	avi: {
		type: 'video'
	},
	mkv: {
		type: 'video'
	},
	m4v: {
		type: 'video'
	},
	wmv: {
	    type: 'video'
	},
	srt: {
		type: 'subs'
	},
	mp3: {
		type: 'music'
	},
	OTHER: {
		type: 'other'
	}
};

var parseEXT = function( fileName ){
	var ext = fileName.split( '.' );

	return ext[ ext.length - 1 ].toLowerCase();
};

var getType = function( fileName ){
	var ext = parseEXT( fileName );
	var type = ( ext in typeList ) ? typeList[ ext ] : typeList[ 'OTHER' ];

	return type;
};

var fileList = function( dir, callback ){
	fs.readdir( dir, function ( error, list ) {
		if ( error ) return error;
		callback( list );
	} );
};

var statList = function( dir, list, callback ){
	var out = [],
		i = 0;

	var callbackCheck = function(msg){
		if( ++i === list.length ){
			callback( {
				list: out,
				dir: dir
			} );
		}
	};

	list.forEach( function( file ){
		fs.stat( dir+file, function( error, results ){
			if ( error ) return;
			var type = results.isDirectory() ? typeList[ 'folder' ] : getType( file );

			if( type['type'] === 'video' ){
				probe( dir+file, function( error, probeRes ){
					
					if(error) console.log(dir+file, error);

					out.push( {
						name: file,
						type: type,
						data: results,
						probe: probeRes
					} );

					callbackCheck('video check');

				} );
			}else{
				out.push( {
					name: file,
					type: type,
					data: results,
				} );

				callbackCheck('not video check');
			}
		} );
	} );
};

module.exports = function(app){

	console.log('here')

	// fs.watch('/stuffpool/incoming/', {encoding: 'buffer'}, lodash.debounce(function(filename){
	// 	console.log('new file!');
	// 	app.io.to('incoming').emit('new-file', {'filename': filename});
	// }, 500));

	app.get( '/dir/', function( req, res, next ) {
		res.render( 'dir', { title: "dir" } );
	});

	app.get( '/api/fileData', function( req, res, next ) {
		if( !req.query.filename ) res.json({});

		probe( parseParentPointer(req.query.filename), function(error, results){
			return res.json( results );
		} );
	} );

	app.get('/api/list', function(req, res, next) {
		
		var dir = '/stuff/' + parseParentPointer( req.query.dir );

		fileList(dir, function(list){
			statList(dir, list, function(out){
				res.json(out);
			});
		});
	});
	
	app.get('/video/', function( req, res, next ) {
		var format = req.query.format || 'mp4';
		res.contentType(format);
		// make sure you set the correct path to your video file storage
		var pathToMovie = req.query.filename;
		var size = req.query.size ? '?x' + req.query.size : '100%';
		console.log( format, size, pathToMovie );

		var proc = ffmpeg(pathToMovie)
			.format(format)
			.size(size)
			.outputOptions([ '-threads 8', '-strict -2', '-movflags frag_keyframe+faststart', '-tune zerolatency' ])
			.on('start', function(){
				console.info('start', arguments);
			})
			.on('codecData',function(){
				console.info('codecData', arguments);
			})
			.on('progress',function(){
				console.info('progress', arguments);
			})
			.on('end', function(){
				console.info('file has been converted successfully');
			})
			.on('error', function(err, stdout, stderr){
				console.error('an error happened:', err, stdout, stderr);
			})
			// save to stream
			.pipe(res, {end: true});
	});

	// 
	app.get( '/dir/info/', function( req, res, next ){
		res.render( 'info' );
	} );

	// ffmpeg info
	app.get( '/api/info/', function( req, res, next ){
		var out = {};
		ffmpeg.getAvailableFilters( function( error, filters ){
			out.filters = filters;
			ffmpeg.getAvailableCodecs( function( error, codecs ){
				out.codecs = codecs;
				formats: ffmpeg.getAvailableFormats( function( error, formats ){
					out.formats = formats;
					res.json( out );
				} );
			} );
		} );
	} );
};



 
