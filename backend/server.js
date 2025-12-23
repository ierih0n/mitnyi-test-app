const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json()); // Add this line to parse JSON bodies

const dataPath = path.join(__dirname, 'data.json');
const usersPath = path.join(__dirname, 'users.json');

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  fs.readFile(usersPath, 'utf8', (err, data) => {
    if (err) {
      res.status(500).send('Error reading users file');
      return;
    }

    const users = JSON.parse(data);
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
      res.json({ success: true });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  });
});


app.get('/api/topics', (req, res) => {
  fs.readFile(dataPath, 'utf8', (err, data) => {
    if (err) {
      res.status(500).send('Error reading data file');
      return;
    }
    const jsonData = JSON.parse(data);
    // The data is an array of objects, so we map over it to get the topics
    const topics = jsonData.map(item => item.topic);
    res.json(topics);
  });
});

app.get('/api/questions/:topic', (req, res) => {
  // URL-decode the topic parameter
  const topicName = decodeURIComponent(req.params.topic);
  fs.readFile(dataPath, 'utf8', (err, data) => {
    if (err) {
      res.status(500).send('Error reading data file');
      return;
    }
    const jsonData = JSON.parse(data);
    // Find the topic object in the array
    const topicData = jsonData.find(item => item.topic === topicName);

    if (topicData && topicData.questions) {
      res.json(topicData.questions);
    } else {
      res.status(404).send('Topic not found');
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
