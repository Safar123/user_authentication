const mongoose = require('mongoose');

const dbConnection = ()=>{

    mongoose.connect(process.env.DATABASE_STRING.replace('<password>', process.env.DATABASE_PASSWORD), {
        useNewUrlParser: true, 
        useUnifiedTopology: true,
    })
    .then(con=>console.log(`Database connected successfully as ${con.connection.host}`))
    .catch(err=>console.log(err))
}

module.exports= dbConnection;