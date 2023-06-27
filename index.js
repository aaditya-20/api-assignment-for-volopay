const express = require('express');
// const bodyParser = require("body-parser");
const app = express();
app.use(express.json());
const PORT = 3000;
const apiController = require('./controllers/apicontroller'); 
app.get('/', (req, res)=>{
    res.status(200);
    res.send("Welcome to root URL of Server");
});
app.use('/api', apiController);
// app.use(bodyParser.urlencoded({ extended: true }));
app.listen(PORT, (error) =>{
    if(!error)
        console.log("Server is Successfully Running, and App is listening on port " + PORT)
    else 
        console.log("Error occurred, server can't start", error);
    }
);