var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var url = 'mongodb://10.0.3.12:27017/test';
var db;

MongoClient.connect(url, function(err, result) {
	if(err){
		console.error('data  failed', err);
	}
	console.log('connected');
	db = result;

});

module.exports = {
	insert: function(collection, doc, callback) {
		db.collection(collection).insertOne( doc, function(err, result) {
			assert.equal(err, null);

			callback(err, result);
		});
	},
	find: function(collection, arg, callback){
		var cursor = db.collection(collection).find(arg);
		callback(cursor);
	},
	update: function(collection, id, updates, callback) {
		db.collection(collection).updateOne(id, updates, function(err, results){
			callback(err, results);
		});
	},
};
