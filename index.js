require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dns = require('dns');
const bodyParser = require('body-parser');
const validUrl = require('valid-url');
const shortid = require('shortid');
const app = express();
const port = process.env.PORT || 3000;
mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => {console.log("Database connection established")})
.catch(() => {console.log("Error")});

app.use(cors());

// Middleware to parse JSON requests
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());



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

  if (!validUrl.isWebUri(url)) {
    return res.status(400).json({ error: 'invalid url' });
  }

  try {
    let findOne = await URL.findOne({ original_url: url });

    if (findOne) {
      return res.json({
        original_url: findOne.original_url,
        short_url: findOne.short_url,
      });
    }

    const urlCode = shortid.generate();
    findOne = new URL({
      original_url: url,
      short_url: urlCode,
    });

    await findOne.save();

    res.json({
      original_url: findOne.original_url,
      short_url: findOne.short_url,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json('This is a server error');
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
