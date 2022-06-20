const app = require("./app");
const dotenv = require("dotenv");


process.on('uncaughtException', err=>{
  console.log('Uncaught exception error');
  console.log(err.name, err.message);
  process.exit(1);
})

dotenv.config({ path: "config/config.env" });

//requiring database modules
const dbConnection = require("./config/databaseCon");
dbConnection();

const port = process.env.PORT || 3000;

const server=app.listen(port, () => {
  console.log(`App running on port ${port} in ${process.env.DEV_MODE} mode`);
});

process.on('unhandledRejection', err=>{
  console.log('UNHANDLED REJECTION , Shutting down');
  console.log(err.name, err.message);
  server.close(()=>{
    process.exit(1);
  })
});

