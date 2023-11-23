const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path'); 

const app = express();
const port = 3002;

app.use(cors());
app.use(express.static('uploads'));

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, 
  },
});

app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Plik przekracza maksymalny rozmiar 5 MB.' });
  }

  const filePath = path.join('uploads', req.file.originalname);
  const addedAt = new Date();
  fs.utimesSync(filePath, addedAt, addedAt);
  res.json({ message: 'File uploaded successfully' });
});

app.get('/files', (req, res) => {
  const files = fs.readdirSync('uploads').map(filename => {
    const filePath = path.join('uploads', filename);
    const stats = fs.statSync(filePath);
    return {
      name: filename,
      addedAt: stats.mtime, 
    };
  });

  const sortedFiles = files.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));
  res.json({ files: sortedFiles });
});



app.get('/uploads/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'uploads', filename);
  res.sendFile(filePath);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
