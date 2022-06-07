const express = require("express");

const app = express();
app.use(express.json()); //! body parse to parse user input into Json

//!middelware 
const errorHandler = require('./controller/errorController');

//!requiring routes
const userRoutes = require("./routes/userRoutes");

//!using routes middelware
app.use("/api/v1/users", userRoutes);
app.use(errorHandler)

module.exports = app;
