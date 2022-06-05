const app = require('./app');
const dotenv = require('dotenv');

dotenv.config({path:'config/config.env'});

//requiring database modules
const dbConnection = require('./config/databaseCon');
dbConnection();

const port = process.env.PORT || 3000;

app.listen(port, ()=>{
    console.log(`App running on port ${port} in ${process.env.DEV_MODE} mode`)
})