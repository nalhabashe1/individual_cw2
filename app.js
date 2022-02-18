const express = require('express')
var path = require('path');
const cors = require("cors");
var fs = require('fs');
var bodyParser = require('body-parser')

const app = express();
app.use(cors());
app.set('port', 3000) 
app.use(bodyParser.json());
app.use(express.json());

app.use((req,res, next) =>{
    console.log("In comes a request from " + req.method + " to " + req.url + " at " + new Date())
    next();
} )

app.get("/", (req, res, next) => {
    return res.sendFile(__dirname + "/static/index.html");
});

const MongoClient = require('mongodb').MongoClient;
let db;
//connecting to your db monogodb access
MongoClient.connect('mongodb+srv://nalhabashe:LOL1234567@cluster0.8j2zj.mongodb.net/test', (err, client) => {
    db = client.db('activities')
    })

// get the collection name
app.param('collectionName', (req, res, next, collectionName) => {
    req.collection = db.collection(collectionName)
    return next()
})
//GET
// retrieves all the objects from an collection
app.get('/collection/:collectionName', (req, res, next) => {
    req.collection.find({}).toArray((e, results) => {
        if (e) return next(e)
        res.send(JSON.stringify(results))
    })
})

//POST 
//adds data into the collection 
app.post('/collection/:collectionName', (req, res, next) => {
    req.collection.insert(req.body, (e, results) => {  
    if (e) return next(e)    
    res.status(200).send(results.ops)   
    })   
})

app.use((req, res, next) =>{
    var imagePath = path.join(__dirname, "static", req.url);
    fs.stat(imagePath, (err, fileInfo) => {
        if(err){
            next();
            return
        }
        if(fileInfo.isFile()){
            res.sendFile(imagePath);
        } else{
            next();
        }
    })
});

app.use((req, res) => {
    res.status(404).send("404 File not Found!");
});

app.listen(3000)