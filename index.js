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
const validUrl = require("valid-url"); // Rename vu to a more descriptive name
const mongoose = require("mongoose");
const bodyParser = require("body-parser"); // Rename bp to a more descriptive name
const shortid = require("shortid"); // Rename sid to a more descriptive name

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
app.use('/public', express.static(`${process.cwd()}/public`));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection error:'));
db.once('open', function () {
  console.log("Connected to database.");
});

// Define the Mongoose schema and model
const Schema = mongoose.Schema;
const urlSchema = new Schema({
  original_url: String,
  short_url: String
});
const ShortUrl = mongoose.model("ShortURL", urlSchema);

// Starting view
app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Redirect to original URL using short URL
app.get('/api/shorturl/:short', function (req, res) {
  ShortUrl.findOne({ short_url: req.params.short })
    .then(function (doc) {
      if (doc) {
        res.redirect(doc.original_url);
      } else {
        res.json({ error: "Short URL not found" });
      }
    })
    .catch(function (err) {
      console.error(err);
      res.json({ error: "Internal server error" });
    });
});

// Create a new short URL
app.post("/api/shorturl/new", function (req, res) {
  const url = validUrl.isWebUri(req.body.url);

  if (url) {
    const id = shortid.generate();

    const newUrl = new ShortUrl({
      original_url: url,
      short_url: id,
    });

    newUrl.save()
      .then(function (doc) {
        res.json({
          original_url: doc.original_url,
          short_url: doc.short_url
        });
      })
      .catch(function (err) {
        console.error(err);
        res.json({ error: "Error saving to database" });
      });
  } else {
    res.json({ error: "Invalid URL" });
  }
});

const PORT = process.env.PORT || 3000; // Use the provided port or default to 3000
app.listen(PORT, function () {
  console.log(`Listening on port ${PORT}`);
});


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
