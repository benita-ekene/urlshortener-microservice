require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const { Schema, model } = mongoose;
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


// Define a schema
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
// Create a model based on the schema
const UrlModel = model('Url', urlSchema);

/* Time to create our routes.

HTTP POST /api/shorturl/new — Create new url
HTTP GET /api/shorturl/:short_url? — Get original url via  */

app.post("/api/shorturl", async function (req, res) {
const { url } = req.body
const urlCode = shortid.generate()
if(!validUrl.isWebUri({ url })) {
  res.status(404).json({Error: "Invalid url"})
}else{
  try{ let findOne = await URL.findOne({
    original_url: url
  })
  if(findOne) {
    res.json({
      original_url: findOne.original_url,
      short_url: findOne.short_url
    })
  }else{
    findOne = new URL({
      original_url: url,
      short_url: urlCode
    })
    await findOne.save()
    res.json({
      original_url: findOne.original_url,
      short_url: findOne.short_url
    })
  }

  }catch(err) {
    console.error(err)
    res.status(500).json("This is a server error")
  }
}
})

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
