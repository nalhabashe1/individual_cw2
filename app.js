const express = require('express')
var path = require('path');
const cors = require("cors");
var fs = require('fs');
var bodyParser = require('body-parser')

const app = express();
app.use(cors());
app.set('port', 3000) 
app.use(bodyParser.json());
// app.use(express.json());

app.use((req,res, next) =>{
    console.log("In comes a request from " + req.method + " to " + req.url + " at " + new Date())
    next();
} )

app.get("/", (req, res, next) => {
    return res.sendFile(__dirname + "/static/index.html");
});

const MongoClient = require('mongodb').MongoClient;
app.use((req, res, next) => {
    //connecting to your db monogodb access
    MongoClient.connect(
      "mongodb+srv://nalhabashe:LOL1234567@cluster0.8j2zj.mongodb.net/test"
    )
      .then((client) => {
        db = client.db('activities');
        req.lessonsCollection = db.collection("lessons");
        req.ordersCollection = db.collection("orders");
        console.log("Connected to database successfully!");
        next();
      })
      .catch((err) => {
        console.log("Unable to connect to the database!");
      });
  });

app.get("/lessons", (req, res, next) => {
    req.lessonsCollection.find().toArray().then((results) => {
    res.status(200).send(JSON.stringify(results));
    }).catch((err) => {
        console.log(err);
    });
  });
  
  app.get("/orders", (req, res, next) => {
    req.ordersCollection.find().toArray().then((orders) => {
        res.send(orders);
    }).catch((err) => {
        console.log(err);
    });
  });

  app.post("/orders", (req, res, next) => {
    const order = req.body;
    console.log(order);
    req.ordersCollection.insertOne(order).then( () => {
        res.status(200).send({ status: true, message: "Order submitted successfully!"});
      }).catch((err) => {
        console.log(err);
        res.status(404).send({ status: false, message: "Unable to submit the order!",
        });
      });
  });


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

const port = process.env.PORT || 3000
app.listen(port)