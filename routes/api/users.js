require("dotenv").config();
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { Op } = require("sequelize");

// middleware
const auth = require("../../middleware/auth")

// model
const User = require("../../models").User;

/**
 * @route 	POST /api/users/signup
 * @access 	Public
 * @desc 	User signup
 *  */
router.post("/signup", (req, res) => {
	// get request body
	const { user } = req.body;

	// check if fields are filled
	if (!user.username || !user.email || !user.encrypted_password || !user.phone || !user.address || !user.city || !user.country || !user.name || !user.postcode)
		return res.status(400).json({ msg: "Please enter all fields!" });

	// Check if email are exist
	User.findOne({
		where: {
			email: user.email,
		},
		attributes: {
			exclude: ["password"],
		},
	})
		.then((isExist) => {
			// if email exist
			if (isExist)
				return res.status(409).json({
					msg: "Email has already taken. Please enter a new email!",
				});

			// generate salt
			bcrypt.genSalt(10, (err, salt) => {
				// check if there is an error
				if (err) return res.status(500).json({ error_salt: err });

				// encrypt the password
				bcrypt.hash(user.encrypted_password, salt, (err, hash) => {
					// check if there is an error
					if (err) return res.status(500).json({ error_hash: err });

					// Save User to database
					User.create({
						username: user.username,
						email: user.email,
						password: hash,
						phone: user.phone,
						address: user.address,
						city: user.city,
						country: user.country,
						name: user.name,
						postcode: user.postcode
					})
						.then((usr) => {

							jwt.sign(
								{ email: usr.email},
								process.env.AUTHSECRETKEY,
								{ expiresIn: "10h" },
								(err, token) => {
									// check if error
									if (err) return res.status(500).json({ error_token: err });

									res.status(201).json({
										email: usr.email,
										token: token,
										username: usr.username
									});
								}
							);
	
						})
						.catch((err) => {
							res.status(500).json({ error_save: err });
						});
				});
			});
		})
		.catch((err) => {
			res.status(500).json({ error_find: err });
		});
});

/**
 *
 * @route	POST /api/users/signin
 * @access 	Public
 * @desc 	Signin for user
 *
 * */
router.post("/signin", (req, res) => {
	// get request body
	const { email, password } = req.body;

	// check if fields are filled
	if (!email || !password)
		return res.status(400).json({ msg: "Please enter all fields!" });

	User.findOne({
		where: {
			email: email,
		},
	})
		.then((user) => {
			// check if email not exist
			if (!user)
				return res
					.status(400)
					.json({ msg: "Your email or password is wrong!" });

			// compare req.body.password and hash from database
			bcrypt.compare(password, user.password, (err, isMatch) => {
				// if there is an error
				if (err) return res.status(500).json({ error: err });

				// check if password is not match
				if (!isMatch)
					return res
						.status(400)
						.json({ msg: "Your email or password is wrong!" });

				// Generate token (payload, secretkey, expired, callback)
				jwt.sign(
					{
						email: user.email
					},
					process.env.AUTHSECRETKEY,
					{ expiresIn: "10h" },
					(err, token) => {
						// check if error
						if (err) return res.status(500).json({ error: err });

						res.status(200).json({
							email: user.email,
							token: token,
							username: user.username
						});
					}
				);
			});
		})
		.catch((err) => {
			res.status(500).json({ error: err });
		});
});

/**
 *
 * @route	POST /api/users/signin
 * @access 	Private
 * @desc 	Get all user
 *
 * */
router.get("/", auth, (req, res) => {
	User.findAll().then(users => {
		res.status(200).json(users);
	}).catch(err => {
		res.status(500).json({error: err})
	})
})

module.exports = router;
