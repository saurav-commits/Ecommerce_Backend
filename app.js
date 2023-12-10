const express = require('express');

const app = express();
const cookieParser = require("cookie-parser");
const errorMiddleware = require('./Middlewares/error');

app.use(express.json());
app.use(cookieParser());

// route imports
const product = require("./routes/productRoutes");
const user = require("./routes/userRoute");
const order = require("./routes/orderRoute");

app.use("/api/v1", product);
app.use("/api/v1", user);
app.use("/api/v1", order);

// Middleware for errors
app.use(errorMiddleware);

module.exports = app;