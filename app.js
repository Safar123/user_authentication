const express = require("express");
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean')
const rateLimiter = require('express-rate-limit');
const GlobalError = require('./utils/globalError');

const app = express();
app.use(helmet());
app.use(express.json()); //! body parse to parse user input into Json

const limiter = rateLimiter({
    max:100,
    windowMs:60*60*1000,
    message:'Too many request from this IP address. Please try again in one hour interval'
})

app.use('/api', limiter);
app.use(mongoSanitize());
app.use(xss());
//!middelware 
const errorHandler = require('./controller/errorController');

//!requiring routes
const userRoutes = require("./routes/userRoutes");

//!using routes middelware
app.use("/api/v1/users", userRoutes);



app.all('*', (req,res,next)=>{
    return next(new GlobalError (`${req.originalUrl} not defined in system. Page not found`, 404))
})


app.use(errorHandler);
module.exports = app;
