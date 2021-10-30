require('dotenv').config();
const express = require("express");
const {Sequelize} = require("sequelize");
const app = express();
const port = process.env.PORT || 3001;

// middlewaue
app.use(express.json());

const users = require("./routes/api/users");
const shopping = require("./routes/api/shopping")

const db = new Sequelize(
  process.env.DB,
  process.env.USERNAME,
  process.env.PASSWORD,
  {
    host: "localhost",
    dialect: "mysql",
    operatorAliases: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

app.use("/api/users", users)
app.use("/api/shopping", shopping)

db.authenticate().then(() => {
	console.log("Connection has established successfully");
}).catch(err => {
	console.log("Unable to connect to database:", err);
})

app.listen(port, () => {
	console.log(`Listen on port ${port}`);
});
