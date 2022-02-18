const express = require('express')
var path = require('path');
const cors = require("cors");
var fs = require('fs');

const app = express();
app.use(cors());
app.set('port', 3000) 
app.use(express.json());

app.use((req,res, next) =>{
    console.log("In comes a request from " + req.method + " to " + req.url + " at " + new Date())
    next();
} )

app.get("/", (req, res, next) => {
    return res.sendFile(__dirname + "/static/index.html");
});

const MongoClient = require('mongodb').MongoClient;
const _id = require("mongodb")._id;

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
// lessons route get
app.get("/lessons", (req, res, next) => {
    req.lessonsCollection.find().toArray().then((results) => {
    res.status(200).send(JSON.stringify(results));
    }).catch((err) => {
        console.log(err);
    });
  });
// orders route get
  app.get("/orders", (req, res, next) => {
    req.ordersCollection.find().toArray().then((orders) => {
    res.status(200).send(JSON.stringify(orders));
    }).catch((err) => {
        console.log(err);
    });
  });
// add new order
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
  
// updated lesson space
  app.put("/lessons", (req, res, next) => {
    const lessons = req.body.lessons;
    let updatedCount = 0;
    lessons.forEach((lesson) => { 
      req.lessonsCollection.findOne({ _id: new _id(lesson._id),
        }).then((existingLesson) => { existingLesson.spaces -= lesson.spaces;
          return existingLesson;
        }).then((existingLesson) => {
        //   console.log('check updated spaces: ' + existingLesson.spaces);
          return req.lessonsCollection.updateOne(
            { _id: new _id(lesson._id)},
            { $set: { spaces: existingLesson.spaces },
            }
          );
        }).then((updated) => { 
            updatedCount++;
          if (updatedCount == lessons.length) {
            res.send({message: `${ updatedCount } updated successfully!`, status: true });
          }
        }).catch((err) => {
          console.error(err);
        });
    });
  });

//search bar
app.post('/lessons', async (req, res) => {
    let payload = req.body.payload.trim();
    console.log(payload)
    let search =  await lessonsCollection.find({ subject: {$regex: new RegExp('^'+ payload + '.*','i')}}).exec();
    res.send({payload: search});
})

app.use((req, res, next) =>{
    var filePath = path.join(__dirname, "static", req.url);
    fs.stat(filePath, (err, fileInfo) => {
        if(err){
            next();
            return
        }
        if(fileInfo.isFile()){
            res.sendFile(filePath);
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