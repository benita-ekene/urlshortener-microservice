// require('dotenv').config();
// const express = require('express');
// const mongoose = require('mongoose');
// const dns = require('dns');
// const { MongoClient } = require('mongodb')
// const validUrl = require('valid-url');
// const shortid = require('shortid');
// const urlParser = require('url');
// const BodyParser = require('body-parser');


// const app = express();

// var cors = require('cors');
// const { url } = require('inspector');
// app.use(cors({optionsSuccessStatus: 200}));

// const client = new MongoClient.connect(process.env.MONGODB_URL)
// .then(() => {console.log("Database connection established")})
// .catch(() => {console.log("Error")});
// const db = client.db('urlshortener')
// const urls = db.collection('urls')

// const port = process.env.PORT || 3000;
// // mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })


// app.use(BodyParser.json());
// app.use(BodyParser.urlencoded({ extended: true }));

// app.get('/', function(req, res) {
//   res.sendFile(process.cwd() + '/views/index.html');
// });

// app.use('/public', express.static(`${process.cwd()}/public`));
// app.get("/style", (req, res) => {
//   res.sendFile(process.cwd() + 'public/style.css')
// })

// // Your first API endpoint
// app.post('/api/shorturl', function(req, res) {
//   const url = req.body.url
//   const dnsLookUp = dns.lookup(urlParser.parse(url).hostname, async(err, address) => {
//     if(!address) {
//       res.json({Error: "Invalid url"})
//     }else{
//       const urlCount = await urls.countDocuments({})
//       const urlDoc = {
//         url,
//         shorturl: urlCount
//       }
//       const result = await urls.insertOne(urlDoc)
//       console.log(result)
//       res.json({original_url:url, shorturl: urlCount})
//     }
//   })
// });


// app.listen(port, function() {
//   console.log(`Listening on port ${port}`);
// });

/////////////
//LIBRARIES///////////////////////////////////////////////////////////////
/////////////

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const vu = require("valid-url");
const mongo = require("mongodb");
const mongoose = require("mongoose");
const bp = require("body-parser");
const sid = require("shortid");
app.use(bp.urlencoded({ extended: false }));
app.use(bp.json());
app.use(cors());
app.use('/public', express.static(`${process.cwd()}/public`));

/////////////
//VARIABLES///////////////////////////////////////////////////////////////
/////////////

mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true });
  const db = mongoose.connection;
  db.on('error', console.error.bind(console, 'connection error:'));
  db.once('open', function() {
    console.log("Connected to database.");
  });

const Schema = mongoose.Schema;
const urlSchema = new Schema({
  original_url: String,
  short_url: String
});
const ShortUrl = mongoose.model("ShortURL", urlSchema);

/////////////
//SECTION 1///////////////////////////////////////////////////////////////
/////////////

//Starting view 
app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

//This is the get function that allows us to redirect to links
app.get('/api/shorturl/:short', function(req, res) {
  ShortUrl.find({short_url: req.params.short}).then(function (docs) {
    res.redirect(docs[0].original_url);
  });
});

//This is the post function that allows us to receive links
app.post("/api/shorturl/new", function (req, res) {
  const url = vu.isWebUri(req.body.url);
  if (url != undefined) {
    let id = sid.generate();

    let newUrl = new ShortUrl({
      original_url: url,
      short_url: id,
    });
    newUrl.save(function (err, doc) {
      if(err) return console.error(err);
      res.json({
        original_url: newUrl.original_url,
        short_url: newUrl.short_url
      });
    });
  }
  else {
    res.json({"error":"invalid URL"});
  }
});

//Set the server port to whatever port is defined and make sure to be using cross-origin for testing
app.listen(3000, function() {console.log(`Listening on port 3000`)});

// require('dotenv').config();
// const express = require('express');
// const { MongoClient } = require('mongodb');
// const dns = require('dns');
// const urlParser = require('url');
// const bodyParser = require('body-parser');

// const app = express();
// const cors = require('cors');
// app.use(cors({ optionsSuccessStatus: 200 }));

// const mongoClient = new MongoClient(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true });

// mongoClient.connect()
//   .then(() => {
//     console.log("Database connection established");
//   })
//   .catch((err) => {
//     console.error("Error connecting to the database", err);
//   });

// const db = mongoClient.db('urlshortener');
// const urls = db.collection('urls');

// const port = process.env.PORT || 3000;

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

// app.get('/', function (req, res) {
//   res.sendFile(process.cwd() + '/views/index.html');
// });

// app.use('/public', express.static(`${process.cwd()}/public`));

// app.get("/style", (req, res) => {
//   res.sendFile(process.cwd() + '/public/style.css');
// });

// app.post('/api/shorturl', function (req, res) {
//   const url = req.body.url;

//   // Validate URL
//   try {
//     new URL(url);
//   } catch (error) {
//     return res.json({ error: 'Invalid url' });
//   }

//   const dnsLookUp = dns.lookup(urlParser.parse(url).hostname, async (err, address) => {
//     if (!address) {
//       res.json({ error: "Invalid url" });
//     } else {
//       const urlCount = await urls.countDocuments({});
//       const urlDoc = {
//         url,
//         shorturl: urlCount
//       };
//       const result = await urls.insertOne(urlDoc);
//       console.log(result);
//       res.json({ original_url: url, shorturl: urlCount });
//     }
//   });
// });

// app.listen(port, function () {
//   console.log(`Listening on port ${port}`);
// });
