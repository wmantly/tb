var express = require('express');
var router = express.Router();
var fs = require('fs');
var probe = require('node-ffprobe');
var ffmpeg = require('fluent-ffmpeg');

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

	list.forEach( function( file ){
		fs.stat( dir+file, function( error, results ){
			if ( error ) return;
			var type = results.isDirectory() ? typeList[ 'folder' ] : getType( file );

			out.push( {
				name: file,
				type: type,
				data: results
			} );

			if( ++i === list.length ){
				callback( { list: out, dir: dir } );
			}
		} );
	} );
};

router.get( '/', function( req, res, next ) {
	res.render( 'dir', { title: "dir" } );
});

router.get( '/api/fileData', function( req, res, next ) {
	if( !req.query.filename ) res.json( {} );

	probe( req.query.filename, function( error, results ){
		res.json( results );
	} );
} );

router.get( '/api/list', function( req, res, next ) {
	var dir = '/stuff/media/' + ( req.query.dir || '/' );

	fileList(dir, function( list ){
		statList( dir, list, function( out ){
			res.json( out );
		} );
	} );
} );
 
router.get('/video/', function( req, res, next ) {
	var format = req.query.format || 'webm';
	res.contentType(format);
	// make sure you set the correct path to your video file storage
	var pathToMovie = req.query.filename;
	var size = req.query.size ? '?x' + req.query.size : '100%';
	console.log( format, size, pathToMovie );
	var proc = ffmpeg(pathToMovie)
		// use the 'flashvideo' preset (located in /lib/presets/flashvideo.js)
		.format(format)
		.size(size)
		.outputOptions([ '-strict -2', '-movflags', '+faststar' ])
		// .videoCodec('libx264')
		// .audioCodec('aac')
		// setup event handlers
		.on( 'start', function(){
			console.log(arguments)
		})
		.on( 'codecData',function(){
			console.log(arguments)
		} )
		/*.on( 'progress',function(){
			console.log( 'progress', arguments )
		} )*/
		.on('end', function() {
		  console.log('file has been converted succesfully');
		})
		.on('error', function( err, stdout, stderr ) {
		  console.log('an error happened: ', err, stdout, stderr );
		})
		// save to stream
		.pipe( res, {end:true} );
});

router.get( '/info/', function( req, res, next ){
	res.render( 'info' );
} );

router.get( '/api/info/', function( req, res, next ){
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


module.exports = router;
