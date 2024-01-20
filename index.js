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

const urlModel = mongoose.model('Url', {
	longUrl: String,
	shortUrl: String,
});


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

app.get('/api/shorturl/:shortUrl', async (req, res) => {
	try {
		const doc = await urlModel.findOne({ shortUrl: req.params.shortUrl });
		res.redirect(doc.longUrl);
	} catch (error) {
		res.status(500).send(error);
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
