const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');
const express = require('express');
const cors = require('cors');

const app = express();

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL, 
}));

app.use(express.json());


const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

const languageMap = {
  python: 'python',
  cpp: 'g++', 
  c: 'gcc',
  java: 'javac',
  javascript: 'node'
};

app.post('/compile', (req, res) => {
  const { language, code, input } = req.body;
  const lang = languageMap[language];

  if (!lang) {
    return res.status(400).json({ error: 'Unsupported language' });
  }

  let fileName;
  let compileCommand;
  let executeCommand;

  switch (language) {
    case 'python':
      fileName = 'temp.py';
      compileCommand = null; 
      executeCommand = `python "${path.join(tempDir, fileName)}"`;
      break;
    case 'cpp':
      fileName = 'temp.cpp';
      compileCommand = `g++ "${path.join(tempDir, fileName)}" -o "${path.join(tempDir, 'a.out')}"`;
      executeCommand = `"${path.join(tempDir, 'a.out')}"`;
      break;
    case 'c':
      fileName = 'temp.c';
      compileCommand = `gcc "${path.join(tempDir, fileName)}" -o "${path.join(tempDir, 'a.out')}"`;
      executeCommand = `"${path.join(tempDir, 'a.out')}"`;
      break;
    case 'java':
      fileName = 'Main.java';
      compileCommand = `javac "${path.join(tempDir, fileName)}"`;
      executeCommand = `java -cp "${tempDir}" Main`; 
      break;
    case 'javascript':
      fileName = 'temp.js';
      compileCommand = null; 
      executeCommand = `node "${path.join(tempDir, fileName)}"`;
      break;
    default:
      return res.status(400).json({ error: 'Unsupported language' });
  }


  fs.writeFileSync(path.join(tempDir, fileName), code);


  const command = compileCommand ? `${compileCommand} && ${executeCommand}` : executeCommand;

  exec(command, (error, stdout, stderr) => {
    // Remove the temporary file after execution
    fs.unlink(path.join(tempDir, fileName), (err) => {
      if (err) console.error('Error removing temporary file:', err);
    });

    if (error) {
      console.error('Error executing code:', stderr);
      return res.status(500).json({ error: stderr });
    }

    res.json({ result: stdout });
  });
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
