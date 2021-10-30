/** 
 * 
 * Middleware untuk mengecek apakah user telah authentikasi atau belum.
 * Dengan mengecek dan memfalidasi header yang berisi token
 * 
 * */

require("dotenv").config();
const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
	// get auth token headers
	const authHeader = req.headers.authorization;

	// check if token is exist
	if (!authHeader)
		return res.status(401).json({ msg: "No token, authorization denied!" });

	const token = authHeader.split(' ')[1];

	// verify token
	jwt.verify(token, process.env.AUTHSECRETKEY, (err, decode) => {
		// check if token valid
		if (err) return res.status(401).json({ msg: "Token is not valid" });

		// set decode to the request
		req.user = decode;

		next();
	});
};

module.exports = auth;
