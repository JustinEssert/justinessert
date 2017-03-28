// REQUIRED PACKAGES -----------------------------------------------------------
var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

// DEFINE SCHEMA ---------------------------------------------------------------
var ItemSchema   = new Schema({
	Title: String,
	SubItem: [{
		subtitle: String,
		description: [String]
	}]
});
