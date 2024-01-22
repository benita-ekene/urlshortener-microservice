require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const dns = require('dns');
const validUrl = require('valid-url');
const shortid = require('shortid');
const urlParser = require('url');
const BodyParser = require('body-parser');
const db = client.db('urlshortener')
const urls = db.collection('urls')

const app = express();

var cors = require('cors');
const { url } = require('inspector');
app.use(cors({optionsSuccessStatus: 200}));

const port = process.env.PORT || 3000;
mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => {console.log("Database connection established")})
.catch(() => {console.log("Error")});

app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.use('/public', express.static(`${process.cwd()}/public`));
app.get("/style", (req, res) => {
  res.sendFile(process.cwd() + 'public/style.css')
})

// Your first API endpoint
app.post('/api/shorturl', function(req, res) {
  url: req.body.url,
  const dnsLookUp = dns.lookup(urlParser.parse(url).hostname, async(err, address) =< {
    if(!address) {
      res.json({Error: "Invalid url"})
    }else{
      const urlCount = await urls.countDocuments({})
      const urlDoc = {
        url,
        shorturl: urlCount
      }
      const result = await urls.insertOne(urlDoc)
      console.log(result)
      res.json({original_url:url, shorturl: urlCount})
    }
  })
});


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
