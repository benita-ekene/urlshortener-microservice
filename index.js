require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const dns = require('dns');
const validUrl = require('valid-url');
const shortid = require('shortid');
const path = require('path');
const { getResponse, makeShortUrl } = require('./util');
const BodyParser = require('body-parser');

const app = express();

var cors = require('cors');
app.use(cors({optionsSuccessStatus: 200}));

const port = process.env.PORT || 3000;
mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => {console.log("Database connection established")})
.catch(() => {console.log("Error")});


// // Middleware to parse JSON requests
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());

// app.use('/public', express.static(`${process.cwd()}/public`));

// app.get('/', function(req, res) {
//   res.sendFile(process.cwd() + '/views/index.html');
// });

// app.get("/styles", (req, res) => {
//   res.sendFile(process.cwd() + "/public/style.css")
// })

app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) =>
	res.sendFile(path.join(__dirname, '/views/index.html')),
);

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

const Schema = mongoose.Schema;
const urlSchema = new Schema({
  original_url: {
    type: String,
    required: true,
  },
  short_url: {
    type: String,
    required: true,
  },
});

const URL = mongoose.model('URL', urlSchema);

app.post('/api/shorturl', async (req, res) => {
  const { url } = req.body;

  // Verify if the URL is valid using dns.lookup
  const urlObject = new URL({
    original_url: url,
    short_url: shortid.generate(),
  });

  dns.lookup(urlObject.original_url, (err) => {
    if (err) {
      return res.status(400).json({ error: 'invalid url' });
    }

    // Check if the URL already exists in the database
    URL.findOne({ original_url: urlObject.original_url }, async (error, result) => {
      if (error) {
        return res.status(500).json('This is a server error');
      }

      if (result) {
        return res.json({
          original_url: result.original_url,
          short_url: result.short_url,
        });
      }

      // Save the new URL to the database
      try {
        await urlObject.save();
        res.json({
          original_url: urlObject.original_url,
          short_url: urlObject.short_url,
        });
      } catch (saveError) {
        console.error(saveError);
        res.status(500).json('This is a server error');
      }
    });
  });
});

app.get('/api/shorturl/:short_url', async (req, res) => {
  const { short_url } = req.params;

  try {
    const findOne = await URL.findOne({ short_url });

    if (!findOne) {
      return res.status(404).json({ error: 'short_url not found' });
    }

    res.redirect(findOne.original_url);
  } catch (err) {
    console.error(err);
    res.status(500).json('This is a server error');
  }
});

app.post('/api/shorturl', (req, res) => {
	try {
		const { url: longUrl } = req.body;
		const { hostname } = new URL(longUrl);

		dns.lookup(hostname, async err => {
			if (!err) {
				const shortenedUrl = await urlModel.findOne({ longUrl });

				if (shortenedUrl) {
					res.send(getResponse(shortenedUrl));
				} else {
					const shortUrl = makeShortUrl(longUrl);
					const url = new urlModel({ longUrl, shortUrl });
					const doc = await url.save();

					res.send(getResponse(doc));
				}
			} else {
				res.send({ error: 'invalid URL' });
			}
		});
	} catch (error) {
		res.status(500).send(error);
	}
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
