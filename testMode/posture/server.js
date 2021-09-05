//server of the images
//Robotic Intuition Operator
//Debashish Buragohain
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', false); //no cookies needed
    next(); //pass to the next layer of middleware
});
app.use(bodyParser.json())
app.use('/file', express.static(path.join(__dirname)));
app.listen(5614, console.log("Backend server running at http://127.0.0.1:5614"))