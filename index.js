require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const bodyParser = require('body-parser');
const validUrl = require('valid-url');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

// Middleware to parse JSON requests
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const urlMap = {};
let counter = 1;

// Function to validate and shorten URLs
function shortenUrl(originalUrl, callback) {
  // Validate URL format
  if (!validUrl.isWebUri(originalUrl)) {
    return callback(new Error('Invalid URL format'));
  }

  // Perform DNS lookup to validate the URL
  const urlParts = new URL(originalUrl);
  dns.lookup(urlParts.hostname, (err) => {
    if (err) {
      return callback(new Error('Invalid hostname'));
    }

    // Generate a short key (using a counter in this case)
    const shortKey = counter++;

    // Store the mapping
    urlMap[shortKey] = originalUrl;

    // Construct the shortened URL
    const shortenedUrl = `http://localhost:${port}/api/shorturl/${shortKey}`;

    callback(null, { original_url: originalUrl, short_url: shortenedUrl });
  });
}

// Endpoint to shorten URLs
app.post('/api/shorturl', (req, res) => {
  const { url } = req.body;

  shortenUrl(url, (err, result) => {
    if (err) {
      return res.status(400).json({ error: 'invalid url' });
    }

    res.json(result);
  });
});

// Endpoint to redirect to the original URL
app.get('/api/shorturl/:shortKey', (req, res) => {
  const { shortKey } = req.params;
  const originalUrl = urlMap[parseInt(shortKey)];

  if (!originalUrl) {
    return res.status(404).json({ error: 'URL not found' });
  }

  res.redirect(originalUrl);
});


app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.get("/styles", (req, res) => {
  res.sendFile(process.cwd() + "/public/style.css")
})

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
