require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const validUrl = require("valid-url");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const shortid = require("shortid");
const dns = require('dns');  // Fixed import
const { error } = require('console');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());
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
const urlSchema = new mongoose.Schema({
  original_url: {
    type: String,
    required: true,
    unique: true
  },
  short_url: String
});
const URLModel = mongoose.model("url", urlSchema);

// Starting view
app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Redirect to original URL using short URL
app.get('/api/shorturl/:short', function (req, res) {
  let short_url = req.params.short;  // Fixed variable name
  URLModel.findOne({ short_url: short_url })
    .then(function (foundUrl) {
      if (foundUrl) {
        let original_url = foundUrl.original_url;
        res.redirect(original_url);
      } else {
        res.json({ error: "Short URL not found" });
      }
    })
    .catch(function (err) {
      console.error(err);
      res.json({ error: "Internal server error" });
    });
});

app.post("/api/shorturl", (req, res) => {
  const url = req.body.url;
  // Validate url
  try {
    const urlObj = new URL(url);
    console.log(urlObj);

    // Use dns.lookup instead of dns.lookupService
    dns.lookup(urlObj.hostname, (err, address) => {
      console.log(address);

      // if dns address does not exist
      if (!address) {
        res.json({ error: "Invalid url" });  // Updated response format
      }
      // otherwise, we have a valid url
      else {
        let original_url = urlObj.href;
        let short_url = 1;

        // get short_url
        URLModel.find({}).sort({ short_url: -1 }).limit(1)
          .then((latestUrl) => {
            if (latestUrl.length > 0) {
              short_url = latestUrl[0].short_url + 1;
            }
            let resObj = {
              original_url: original_url,
              short_url: short_url,
            };

            let newURL = new URLModel(resObj);
            newURL.save()
            res.json(resObj);
          });
      }
    });
  } catch (error) {
    res.json({ error: "Invalid url" });  // Updated response format
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, function () {
  console.log(`Listening on port ${PORT}`);
});



// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const app = express();
// const validUrl = require("valid-url");
// const mongoose = require("mongoose");
// const bodyParser = require("body-parser");
// const shortid = require("shortid");

// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());
// app.use(express.json());
// app.use(cors());
// app.use('/public', express.static(`${process.cwd()}/public`));

// // Connect to MongoDB
// mongoose.connect(process.env.MONGODB_URL, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// })
//   .then(() => {
//     console.log('Connected to MongoDB');
//   })
//   .catch((error) => {
//     console.error('Error connecting to MongoDB:', error);
//   });

// // Define the Mongoose schema and model
// const urlSchema = new mongoose.Schema({
//   original_url: {
//     type: String,
//     required: true
//   },
//   short_url: String
// });
// const ShortUrl = mongoose.model("ShortURL", urlSchema);

// // Starting view
// app.get('/', function (req, res) {
//   res.sendFile(process.cwd() + '/views/index.html');
// });

// // Redirect to original URL using short URL
// app.get('/api/shorturl/:short', function (req, res) {
//   ShortUrl.create({ short_url: req.params.short })
//     .then(function (foundUrl) {
//       if (foundUrl) {
//         res.redirect(foundUrl.original_url);
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
//       .then(function (savedUrl) {
//         console.log('Document saved successfully:', savedUrl);
//         res.json({
//           original_url: savedUrl.original_url,
//           short_url: savedUrl.short_url
//         });
//       })
//       .catch(function (err) {
//         console.error('Error saving document:', err);
//         res.json({ error: "Error saving to database" });
//       });
//   } else {
//     res.json({ error: "Invalid URL" });
//   }
// });

// // Additional route to retrieve all stored short URLs (for testing purposes)
// app.get('/api/shorturl', function (req, res) {
//   ShortUrl.find({}, 'original_url short_url')
//     .then(function (foundUrls) {
//       res.json(foundUrls);
//     })
//     .catch(function (err) {
//       console.error(err);
//       res.json({ error: "Internal server error" });
//     });
// });

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, function () {
//   console.log(`Listening on port ${PORT}`);
// });