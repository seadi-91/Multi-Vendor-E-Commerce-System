const fs = require('fs');

let content = fs.readFileSync('client/src/pages/home/Home.jsx', 'utf8');

// Replace Chunk 1 (empty head/empty theirs)
content = content.replace(/<<<<<<< HEAD\n\n=======\n>>>>>>> 0a7d7e3 \(customer page\)\n/g, '');

// Split by markers and process
// Since regex over large multiline strings can be tricky, let's process line by line
const lines = content.split('\n');
const newLines = [];
let state = 'normal'; // normal, head, theirs
let conflictId = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  if (line.startsWith('<<<<<<< HEAD')) {
    state = 'head';
    conflictId++;
    continue;
  }
  
  if (line.startsWith('=======')) {
    state = 'theirs';
    continue;
  }
  
  if (line.startsWith('>>>>>>> 0a7d7e3')) {
    state = 'normal';
    continue;
  }
  
  // Conflict resolutions
  if (state === 'normal') {
    newLines.push(line);
  } else if (state === 'head') {
    // Keep HEAD for Header & Search Bar (Conflict 6)
    // Keep HEAD for Flash Deals section (Conflict 7)
    if (conflictId === 6 || conflictId === 7) {
      newLines.push(line);
    }
  } else if (state === 'theirs') {
    // Keep Theirs for Categories, Slides (Conflicts 1, 2, 3, 4, 5)
    // Keep Theirs for Footer (Conflict 8)
    if (conflictId >= 1 && conflictId <= 5) {
      newLines.push(line);
    }
    if (conflictId === 8) {
      newLines.push(line);
    }
  }
}

fs.writeFileSync('client/src/pages/home/Home.jsx', newLines.join('\n'));
console.log(`Resolved ${conflictId} conflicts in Home.jsx`);
