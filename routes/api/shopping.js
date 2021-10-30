require("dotenv").config();
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { Op } = require("sequelize");

// middleware
const auth = require("../../middleware/auth");

// model
const Shopping = require("../../models").Shopping;


router.post("/", auth, (req, res) => {
	const { shopping } = req.body;

	if (!shopping.name || !shopping.createddate)
		return res.status(400).json({ error: "Please enter all fields!" });

	Shopping.create({
		name: shopping.name,
		createddate: shopping.createddate,
	})
		.then((shopping) => {
			res.status(201).json({ data: shopping });
		})
		.catch((err) => {
			res.status(500).json({ error: err });
		});
});

router.get("/", auth, (req, res) => {
	Shopping.findAll()
		.then((shopping) => {
			res.status(200).json(shopping);
		})
		.catch((err) => {
			res.status(500).json({ error: err });
		});
});

router.get("/:id", auth, (req, res) => {
	Shopping.findByPk(req.params.id)
		.then((shopping) => {
			res.status(200).json(shopping);
		})
		.catch((err) => {
			res.status(500).json({ error: err });
		});
});

router.patch("/:id", auth, (req, res) => {
	const id = req.params.id;

	const { shopping } = req.body;

	Shopping.update(
		{ createddate: shopping.createddate, name: shopping.name },
		{ where: { id: id } }
	).then(() => {
		res.status(200).json({msg: "Shopping updated successfully!"})
	}).catch(err => {
		res.status(500).json({error: err})
	});
});

router.delete("/:id", auth, (req, res) => {
	Shopping.destroy({where: {id: id}}).then(() => {
		res.status(200).json({msg: `Shopping with id ${id} has successfully deleted!`})
	}).catch(err => {
		res.status(500).json({error: err})
	})
})

module.exports = router;
