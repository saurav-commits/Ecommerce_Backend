const app = require('./app');
const dotenv = require('dotenv');
const connectDB = require('./config/database');

// Uncaught Exception
process.on("uncaughtException", (err) => {
    console.log(`Error: ${err.message}`);
    console.log(`Shutting down the server due to uncaught exception`);
    process.exit(1);
})

// Config
dotenv.config({path:'./config/config.env'})

// connecting to database
connectDB();

const server = app.listen(process.env.PORT, ()=> {
    console.log(`Server is running on port ${process.env.PORT}`);
})


// uncaught exception
// console.log(yo);


//Unhandled promise rejection

process.on("unhandledRejection", (err)=> {
    console.log(`Error: ${err.message}`);
    console.log(`Shutting down the server due to unhandled promise rejection`);

    server.close(()=>{
        process.exit(1);
    });
});

