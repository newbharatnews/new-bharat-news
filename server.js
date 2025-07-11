const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;

const ADMIN = { username: 'Sandeep', password: '123456' };

app.use(bodyParser.json());
app.use(express.static('public'));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN.username && password === ADMIN.password) {
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

app.get('/api/news', (req, res) => {
  const file = path.join(__dirname, 'public/news.json');
  fs.readFile(file, 'utf8', (err, data) => {
    if (err) return res.status(500).send('Read error');
    res.send(JSON.parse(data));
  });
});

app.post('/api/news', (req, res) => {
  const file = path.join(__dirname, 'public/news.json');
  const newItem = req.body;
  fs.readFile(file, 'utf8', (err, data) => {
    const news = JSON.parse(data);
    news.unshift(newItem);
    fs.writeFile(file, JSON.stringify(news, null, 2), err => {
      if (err) return res.status(500).send('Write error');
      res.send({ success: true });
    });
  });
});

app.post('/api/upload', upload.single('image'), (req, res) => {
  res.json({ url: '/uploads/' + req.file.filename });
});

app.post('/api/delete', (req, res) => {
  const file = path.join(__dirname, 'public/news.json');
  const { title } = req.body;
  fs.readFile(file, 'utf8', (err, data) => {
    let news = JSON.parse(data);
    news = news.filter(n => n.title !== title);
    fs.writeFile(file, JSON.stringify(news, null, 2), err => {
      if (err) return res.status(500).send('Delete error');
      res.send({ success: true });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});
