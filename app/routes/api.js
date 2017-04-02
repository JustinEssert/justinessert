var bodyParser = require('body-parser');
var User       = require('../models/user');
var jwt        = require('jsonwebtoken');
var config     = require('../../config');

// Key for admin users
var adminKey = config.key;

module.exports = function(app, express) {

	var apiRouter = express.Router();

	// Test route to verify connection
	apiRouter.get('/', function(req, res) {
		res.json({ message: 'API Connection Successful', success: true });
	});

	// Authentication for Admin API
	apiRouter.post('admin/authenticate', function(req, res) {
	  User.findOne({
	    username: req.body.username
	  }).select('name username password').exec(function(err, user) {
	    if (err) throw err;

	    if (!user) {
	      	res.json({
	      		success: false,
	      		message: 'Authentication failed. User not found.'
	    	});
	    } else if (user) {
	    	var validPassword = user.comparePassword(req.body.password);
	    	if (!validPassword) {
	        	res.json({
	        		success: false,
	        		message: 'Authentication failed. Wrong password.'
	      		});
	    	} else {
			// Create a token
	        var token = jwt.sign({
	        	name: user.name,
	        	username: user.username
	        }, adminKey, {
	          expiresIn: '1h'
		  });
	        // Return token
	        res.json({
	          success: true,
	          token: token
	        });
	      }

	    }

	  });
	});

	// Middleware to verify token
	apiRouter.use('admin/', function(req, res, next) {
	  // Check for token
	  var token = req.body.token || req.query.token || req.headers['x-access-token'];

	  if (token) {
	    jwt.verify(token, adminKey, function(err, decoded) {
	      if (err) {
	        res.status(403).send({
	        	success: false,
	        	message: 'Failed to authenticate token.'
	    	});
	      } else {
	        req.decoded = decoded;
	        next();
	      }
	    });
	  } else {
   	 	res.status(403).send({
   	 		success: false,
   	 		message: 'No token provided.'
   	 	});
	  }
	});
	// on routes that end in /users
	// ----------------------------------------------------
	apiRouter.route('admin/users')
		// create a user (api/users)
		.post(function(req, res) {
			var user = new User();
			user.name = req.body.name;
			user.username = req.body.username;
			user.password = req.body.password;
			user.save(function(err) {
				if (err) {
					// duplicate entry
					if (err.code == 11000)
						return res.json({ success: false, message: 'User already exists'});
					else
						return res.send(err);
				}
				res.json({ success: true });
			});
		})

		// get all the users (accessed at GET http://localhost:8080/api/users)
		.get(function(req, res) {

			User.find({}, function(err, users) {
				if (err) res.send(err);

				// return the users
				res.json(users);
			});
		});

	// on routes that end in /users/:user_id
	// ----------------------------------------------------
	apiRouter.route('admin/users/:user_id')

		// Get user
		.get(function(req, res) {
			User.findById(req.params.user_id, function(err, user) {
				if (err) res.send(err);
				res.json(user);
			});
		})

		// Update user
		.put(function(req, res) {
			User.findById(req.params.user_id, function(err, user) {
				if (err) res.send(err);
				// Set new user info
				if (req.body.name) user.name = req.body.name;
				if (req.body.username) user.username = req.body.username;
				if (req.body.password) user.password = req.body.password;
				// Save user
				user.save(function(err) {
					if (err) res.send(err);
					res.json({ succes: true });
				});

			});
		})
		// Delete User
		.delete(function(req, res) {
			User.remove({
				_id: req.params.user_id
			}, function(err, user) {
				if (err) res.send(err);
				res.json({ message: 'Successfully deleted' });
			});
		});
	return apiRouter;
};
