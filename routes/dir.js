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
	iso: {
		type: 'disk_image'
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

var fileList = async function(dir){
	return await fs.readdir(dir);
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

	fs.watch('/stuffpool/stuff/torrents/', {encoding: 'buffer'}, lodash.debounce(function(filename){
		console.log('new file!');
		app.io.to('incoming').emit('new-file', {'filename': filename});
	}, 500));


	app.get( '/dir/', function( req, res, next ) {
		res.render( 'dir', { title: "dir" } );
	});


	app.get('/api/fileData/:fileName(*+)', function(req, res, next) {
		let fileName = res.locals.basePath + req.params.fileName;

		probe(parseParentPointer(fileName), function(error, results){
			if (error) {
				if(error.includes('Invalid data found when processing input')){
					return res.status(501).json({messag: error});

				}else if(error.includes('Is a directory')){
					return res.status(415).json({message: error});

				}else if(error.includes('No such file or directory')){
					return res.status(404).json({message:error});

				} else{
					return res.status(500).json({message: error});

				}
			}

			return res.json(results);
		});
	});


	app.get('/api/list', function(req, res, next) {
		
		var dir = res.locals.basePath +  parseParentPointer( req.query.dir );

		fileList(dir, function(list){
			statList(dir, list, function(out){
				out.dir = out.dir.replace(new RegExp( `^${res.locals.basePath.replace(/\//g, '\\/').replace(/\./g, '\\.'), 'i' )}`,'')
				res.json(out);
			});
		});
	});
	
	app.get('/video/:fileName(*+)', function( req, res, next ) {
		let format = req.query.format || 'mp4';
		let fileName = res.locals.basePath + req.params.fileName;

		console.log('video', fileName)

		// make sure you set the correct path to your video file storage

		var size = req.query.size ? '?x' + req.query.size : '100%';
		
		res.contentType(format);
		var proc = ffmpeg(fileName)
			.format(format)
			.size(size)
			.outputOptions([ '-threads 8', '-strict -2', '-movflags frag_keyframe+faststart', '-tune zerolatency' ])
			.on('start', function(){
				// console.info('start', arguments);
			})
			.on('codecData',function(){
				// console.info('codecData', arguments);
			})
			.on('progress',function(){
				// console.info('progress', arguments);
			})
			.on('end', function(){
				// console.info('file has been converted successfully');
			})
			.on('error', function(err, stdout, stderr){
				console.error('an error happened:', err, stdout, stderr);
			});
			
			// save to stream
			proc.pipe(res, {end: true});
	});


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



 
