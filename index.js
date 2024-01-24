// /////////////
// //LIBRARIES///////////////////////////////////////////////////////////////
// /////////////

// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const app = express();
// const validUrl = require("valid-url"); // Rename vu to a more descriptive name
// const mongoose = require("mongoose");
// const bodyParser = require("body-parser"); // Rename bp to a more descriptive name
// const shortid = require("shortid"); // Rename sid to a more descriptive name

// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());
// app.use(cors());
// app.use('/public', express.static(`${process.cwd()}/public`));
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(express.json());

// // Connect to MongoDB
// mongoose.connect(process.env.MONGODB_URL, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// })
// .then(() => {
//   console.log('Connected to MongoDB');
// })
// .catch((error) => {
//   console.error('Error connecting to MongoDB:', error);
// });

// // Define the Mongoose schema and model
// const Schema = mongoose.Schema;
// const urlSchema = new Schema({
//   original_url: String,
//   short_url: String
// });
// const ShortUrl = mongoose.model("ShortURL", urlSchema);

// // Starting view
// app.get('/', function (req, res) {
//   res.sendFile(process.cwd() + '/views/index.html');
// });

// // Redirect to original URL using short URL
// app.get('/api/shorturl/:short', function (req, res) {
//   ShortUrl.findOne({ short_url: req.params.short })
//     .then(function (doc) {
//       if (doc) {
//         res.redirect(doc.original_url);
//       } else {
//         res.json({ error: "Short URL not found" });
//       }
//     })
//     .catch(function (err) {
//       console.error(err);
//       res.json({ error: "Internal server error" });
//     });
// });

// // Create a new short URL
// app.post("/api/shorturl", function (req, res) {
//   const url = validUrl.isWebUri(req.body.url);

//   if (url) {
//     const id = shortid.generate();

//     const newUrl = new ShortUrl({
//       original_url: url,
//       short_url: id,
//     });

//     newUrl.save()
//       .then(function (doc) {
//         res.json({
//           original_url: doc.original_url,
//           short_url: doc.short_url
//         });
//       })
//       .catch(function (err) {
//         console.error(err);
//         res.json({ error: "Error saving to database" });
//       });
//   } else {
//     res.json({ error: "Invalid URL" });
//   }
// });

// const PORT = process.env.PORT || 3000; // Use the provided port or default to 3000
// app.listen(PORT, function () {
//   console.log(`Listening on port ${PORT}`);
// });

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const validUrl = require("valid-url");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const shortid = require("shortid");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
app.use('/public', express.static(`${process.cwd()}/public`));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
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


// Create a new short URL
app.post("/api/shorturl", function (req, res) {
  const url = validUrl.isWebUri(req.body.url);

  if (url) {
    const id = shortid.generate();

    const newUrl = new ShortUrl({
      original_url: url,
      short_url: id,
    });

    newUrl.save()
      .then(function (doc) {
        console.log('Document saved successfully:', doc);
        res.json({
          original_url: doc.original_url,
          short_url: doc.short_url
        });
      })
      .catch(function (err) {
        console.error('Error saving document:', err);
        res.json({ error: "Error saving to database" });
      });
  } else {
    res.json({ error: "Invalid URL" });
  }
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, function () {
  console.log(`Listening on port ${PORT}`);
});
