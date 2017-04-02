// REQUIRED PACKAGES -----------------------------------------------------------
var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
var bcrypt 		 = require('bcrypt-nodejs');

// DEFINE SCHEMA ---------------------------------------------------------------
var UserSchema   = new Schema({
	name: String,
	username: { type: String, required: true, index: { unique: true }},
	password: { type: String, required: true, select: false }
});
// Saving Passwords ------------------------------------------------------------
UserSchema.pre('save', function(next) {
	var user = this;
	// Don't hash if not modified
	if (!user.isModified('password')) return next();
	// Generate hash
	bcrypt.hash(user.password, null, null, function(err, hash) {
		if (err) return next(err);
		user.password = hash;
		next();
	});
});
// Verifying Passwords ---------------------------------------------------------
UserSchema.methods.comparePassword = function(password) {
	var user = this;

	return bcrypt.compareSync(password, user.password);
};
module.exports = mongoose.model('User', UserSchema);
