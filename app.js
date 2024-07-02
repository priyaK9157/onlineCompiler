const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');
const express = require('express');
const cors = require('cors');

const app = express();

// CORS configuration
app.use(cors({
  origin: '*', // Replace with your frontend URL in production
}));

app.use(express.json());

// Create a temporary directory for code files
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

// Map programming languages to their respective commands
const languageMap = {
  python: 'python',
  cpp: 'g++', // Change to g++ for C++
  c: 'gcc',
  java: 'javac',
  javascript: 'node'
};

app.post('/compile', (req, res) => {
  const { language, code, input } = req.body;
  const lang = languageMap[language];

  // Validate language
  if (!lang) {
    return res.status(400).json({ error: 'Unsupported language' });
  }

  // Generate a temporary file name and path
  let fileName;
  let compileCommand;
  let executeCommand;

  switch (language) {
    case 'python':
      fileName = 'temp.py';
      compileCommand = null; // Python doesn't need compilation
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
      fileName = 'Main.java'; // Ensure the file name is Main.java if using class Main
      compileCommand = `javac "${path.join(tempDir, fileName)}"`;
      executeCommand = `java -cp "${tempDir}" Main`; // Execute the Main class
      break;
    case 'javascript':
      fileName = 'temp.js';
      compileCommand = null; // JavaScript doesn't need compilation
      executeCommand = `node "${path.join(tempDir, fileName)}"`;
      break;
    default:
      return res.status(400).json({ error: 'Unsupported language' });
  }

  // Write the code to the temporary file
  fs.writeFileSync(path.join(tempDir, fileName), code);

  // Compile and/or execute the command
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

// Get port from environment variable or default to 5000
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
