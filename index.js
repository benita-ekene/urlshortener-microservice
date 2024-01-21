require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const dns = require('dns');
const validUrl = require('valid-url');
const shortid = require('shortid');
const path = require('path');
const BodyParser = require('body-parser');

const app = express();

var cors = require('cors');
app.use(cors({optionsSuccessStatus: 200}));

const port = process.env.PORT || 3000;
mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => {console.log("Database connection established")})
.catch(() => {console.log("Error")});

app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));


app.get('/', (req, res) =>
	res.sendFile(path.join(__dirname, '/views/index.html')),
);

// Your first API endpoint
app.post('/api/shorturl', function(req, res) {
  res.json({ greeting: 'hello API' });
});


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
