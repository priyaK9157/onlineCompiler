const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const app = express();
const port = 5000;

app.use(cors()); // Add this line
app.use(express.json());

app.post('/compile', (req, res) => {
  const { language, code } = req.body;

  let dockerImage;
  let command;

  switch (language) {
    case 'C++':
      dockerImage = 'cpp-compiler';
      command = `echo "${code}" | docker run --rm -i ${dockerImage}`;
      break;
    case 'Java':
      dockerImage = 'java-compiler';
      command = `echo "${code}" | docker run --rm -i ${dockerImage}`;
      break;
    case 'JavaScript':
      dockerImage = 'javascript-compiler';
      command = `echo "${code}" | docker run --rm -i ${dockerImage}`;
      break;
    case 'Python':
      dockerImage = 'python-compiler';
      command = `echo "${code}" | docker run --rm -i ${dockerImage}`;
      break;
    default:
      return res.status(400).send('Unsupported language');
  }

  exec(command, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).send(`Error: ${stderr}`);
    }
    res.send({ result: stdout });
  });
});

app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});
