// seed/seed.js
// Inserts starter quiz content into MongoDB.
// Run with:  npm run seed   (from the backend/ folder)
// What it does:
//   1. Connects to MongoDB using MONGO_URI from .env
//   2. Deletes all existing questions (so re-running never creates duplicates)
//   3. Inserts 50 questions: 10 each for JavaScript, HTML, CSS, Node.js, MongoDB,
//      with a mix of easy / medium / hard difficulties.
//
// NOTE: correctAnswer must be the EXACT text of one of the four options.

require('dotenv').config({ path: `${__dirname}/../.env` });
const mongoose = require('mongoose');
const Question = require('../models/Question');

const questions = [
  // ---------------- JavaScript (10) ----------------
  {
    question: 'What does the `let` keyword do in JavaScript?',
    options: [
      'Declares a block-scoped variable',
      'Declares a constant value',
      'Defines a new function',
      'Imports an external module',
    ],
    correctAnswer: 'Declares a block-scoped variable',
    category: 'JavaScript',
    difficulty: 'easy',
    explanation: '`let` creates a variable that only exists inside the block { } where it is declared, unlike the older function-scoped `var`.',
  },
  {
    question: 'Which symbol starts a single-line comment in JavaScript?',
    options: ['//', '<!--', '##', '**'],
    correctAnswer: '//',
    category: 'JavaScript',
    difficulty: 'easy',
    explanation: 'Everything after // on the same line is ignored by the JavaScript engine.',
  },
  {
    question: 'What is the result of `typeof "hello"`?',
    options: ['string', 'text', 'char', 'String object'],
    correctAnswer: 'string',
    category: 'JavaScript',
    difficulty: 'easy',
    explanation: '`typeof` returns the primitive type name as a lowercase string.',
  },
  {
    question: 'Which keyword declares a constant in JavaScript?',
    options: ['const', 'let', 'var', 'static'],
    correctAnswer: 'const',
    category: 'JavaScript',
    difficulty: 'easy',
    explanation: '`const` creates a binding that cannot be reassigned after initialization.',
  },
  {
    question: 'Which array method adds an element to the END of an array?',
    options: ['push()', 'pop()', 'shift()', 'unshift()'],
    correctAnswer: 'push()',
    category: 'JavaScript',
    difficulty: 'medium',
    explanation: '`push()` appends to the end and returns the new length; `pop()` removes from the end.',
  },
  {
    question: 'What does `JSON.parse()` do?',
    options: [
      'Converts a JSON string into a JavaScript object',
      'Converts a JavaScript object into a JSON string',
      'Validates an HTML document',
      'Parses a URL query string',
    ],
    correctAnswer: 'Converts a JSON string into a JavaScript object',
    category: 'JavaScript',
    difficulty: 'medium',
    explanation: '`JSON.parse()` is the reverse operation of `JSON.stringify()`.',
  },
  {
    question: 'Which of these is NOT a primitive data type in JavaScript?',
    options: ['string', 'boolean', 'float', 'undefined'],
    correctAnswer: 'float',
    category: 'JavaScript',
    difficulty: 'medium',
    explanation: 'JavaScript has a single numeric type: `number`. There is no separate `float` type.',
  },
  {
    question: 'What does `Array.map()` return?',
    options: [
      'A new array with transformed elements',
      'The first element of the array',
      "The array's length",
      'Nothing — it modifies the array in place',
    ],
    correctAnswer: 'A new array with transformed elements',
    category: 'JavaScript',
    difficulty: 'medium',
    explanation: '`map()` never mutates the original array; it builds and returns a brand-new one.',
  },
  {
    question: 'What is a closure in JavaScript?',
    options: [
      'A function that remembers variables from its outer scope',
      'A way to close a browser tab',
      'A loop that runs forever',
      'A special type of class',
    ],
    correctAnswer: 'A function that remembers variables from its outer scope',
    category: 'JavaScript',
    difficulty: 'hard',
    explanation: 'When an inner function references outer variables, those variables stay alive as long as the inner function exists.',
  },
  {
    question: 'What does `this` refer to inside an arrow function?',
    options: [
      'It inherits `this` from the surrounding scope',
      'The global window object',
      'The function itself',
      'It is always undefined',
    ],
    correctAnswer: 'It inherits `this` from the surrounding scope',
    category: 'JavaScript',
    difficulty: 'hard',
    explanation: 'Arrow functions do not bind their own `this`; they capture it lexically from where they are defined.',
  },

  // ---------------- HTML (10) ----------------
  {
    question: 'What does HTML stand for?',
    options: [
      'Hyper Text Markup Language',
      'High Text Machine Language',
      'Hyper Transfer Markup Language',
      'Home Tool Markup Language',
    ],
    correctAnswer: 'Hyper Text Markup Language',
    category: 'HTML',
    difficulty: 'easy',
    explanation: 'HTML is the standard markup language used to structure content on the web.',
  },
  {
    question: 'Which tag creates the largest heading?',
    options: ['<h1>', '<h6>', '<head>', '<header>'],
    correctAnswer: '<h1>',
    category: 'HTML',
    difficulty: 'easy',
    explanation: 'Headings run from <h1> (largest) down to <h6> (smallest).',
  },
  {
    question: 'Which tag is used to create a hyperlink?',
    options: ['<a>', '<link>', '<href>', '<url>'],
    correctAnswer: '<a>',
    category: 'HTML',
    difficulty: 'easy',
    explanation: 'The anchor tag <a href="..."> creates clickable links between pages.',
  },
  {
    question: 'Which element inserts a line break?',
    options: ['<br>', '<lb>', '<break>', '<newline>'],
    correctAnswer: '<br>',
    category: 'HTML',
    difficulty: 'easy',
    explanation: '<br> is an empty element that breaks the text onto a new line.',
  },
  {
    question: 'Which attribute provides alternative text for an image?',
    options: ['alt', 'title', 'src', 'caption'],
    correctAnswer: 'alt',
    category: 'HTML',
    difficulty: 'medium',
    explanation: 'The alt attribute describes the image for screen readers and shows if the image fails to load.',
  },
  {
    question: 'Which element creates a dropdown list?',
    options: ['<select>', '<dropdown>', '<list>', '<option> alone'],
    correctAnswer: '<select>',
    category: 'HTML',
    difficulty: 'medium',
    explanation: '<select> wraps <option> elements to build a dropdown menu.',
  },
  {
    question: 'Which tag defines a table row?',
    options: ['<tr>', '<td>', '<th>', '<table>'],
    correctAnswer: '<tr>',
    category: 'HTML',
    difficulty: 'medium',
    explanation: '<tr> = table row. It contains <td> (data) or <th> (header) cells.',
  },
  {
    question: 'Which input type creates a checkbox?',
    options: ['checkbox', 'check', 'box', 'toggle'],
    correctAnswer: 'checkbox',
    category: 'HTML',
    difficulty: 'medium',
    explanation: '<input type="checkbox"> renders a box the user can tick on or off.',
  },
  {
    question: 'Which HTML5 element represents self-contained content like a blog post?',
    options: ['<article>', '<section>', '<div>', '<aside>'],
    correctAnswer: '<article>',
    category: 'HTML',
    difficulty: 'hard',
    explanation: '<article> marks content that makes sense on its own, e.g. a post, card or comment.',
  },
  {
    question: 'What does the `defer` attribute do on a `<script>` tag?',
    options: [
      'Delays execution until the HTML is fully parsed',
      'Loads the script twice',
      'Makes the script run before the HTML loads',
      'Disables the script',
    ],
    correctAnswer: 'Delays execution until the HTML is fully parsed',
    category: 'HTML',
    difficulty: 'hard',
    explanation: 'Deferred scripts download in parallel but execute in order after parsing, so they never block rendering.',
  },

  // ---------------- CSS (10) ----------------
  {
    question: 'What does CSS stand for?',
    options: [
      'Cascading Style Sheets',
      'Computer Style Sheets',
      'Creative Style System',
      'Colorful Style Sheets',
    ],
    correctAnswer: 'Cascading Style Sheets',
    category: 'CSS',
    difficulty: 'easy',
    explanation: 'The "cascade" is the set of rules browsers use to resolve conflicting styles.',
  },
  {
    question: 'Which property changes the color of text?',
    options: ['color', 'font-color', 'text-color', 'background-color'],
    correctAnswer: 'color',
    category: 'CSS',
    difficulty: 'easy',
    explanation: 'The `color` property sets the foreground (text) color of an element.',
  },
  {
    question: 'Which selector targets the element with id="menu"?',
    options: ['#menu', '.menu', 'menu', '*menu'],
    correctAnswer: '#menu',
    category: 'CSS',
    difficulty: 'easy',
    explanation: '`#` selects by id, while `.` selects by class name.',
  },
  {
    question: 'How do you write a comment in CSS?',
    options: ['/* comment */', '// comment', '<!-- comment -->', '# comment'],
    correctAnswer: '/* comment */',
    category: 'CSS',
    difficulty: 'easy',
    explanation: 'CSS comments are wrapped in /* ... */ and can span multiple lines.',
  },
  {
    question: 'Which property controls the space INSIDE an element, between its content and border?',
    options: ['padding', 'margin', 'spacing', 'inset'],
    correctAnswer: 'padding',
    category: 'CSS',
    difficulty: 'medium',
    explanation: '`padding` is inner space; `margin` is the outer space around the element.',
  },
  {
    question: 'What does `display: flex` do to an element?',
    options: [
      'Turns it into a flex container',
      'Hides the element',
      'Centers all text',
      'Makes it float left',
    ],
    correctAnswer: 'Turns it into a flex container',
    category: 'CSS',
    difficulty: 'medium',
    explanation: 'Its children become flex items laid out along the main axis.',
  },
  {
    question: "Which unit is relative to the root element's font size?",
    options: ['rem', 'px', 'pt', 'cm'],
    correctAnswer: 'rem',
    category: 'CSS',
    difficulty: 'medium',
    explanation: '1rem equals the font-size of the <html> element, so rem-based layouts respect user font settings.',
  },
  {
    question: 'Which property pins an element to the viewport while scrolling past it?',
    options: ['position: sticky', 'position: static', 'float: left', 'display: block'],
    correctAnswer: 'position: sticky',
    category: 'CSS',
    difficulty: 'medium',
    explanation: '`sticky` behaves like `relative` until a scroll threshold is reached, then sticks like `fixed`.',
  },
  {
    question: 'What does `z-index` control?',
    options: [
      'The stacking order of positioned elements',
      'The zoom level of text',
      'The order of CSS files',
      'The tab order of links',
    ],
    correctAnswer: 'The stacking order of positioned elements',
    category: 'CSS',
    difficulty: 'hard',
    explanation: 'A higher z-index paints on top, but it only works on positioned elements.',
  },
  {
    question: 'Which pseudo-class applies while the mouse hovers over an element?',
    options: [':hover', '::hover', ':mouse-over', ':active'],
    correctAnswer: ':hover',
    category: 'CSS',
    difficulty: 'hard',
    explanation: '`:hover` matches when the pointer is over the element; `:active` matches while it is being clicked.',
  },

  // ---------------- Node.js (10) ----------------
  {
    question: 'What is Node.js?',
    options: [
      "A JavaScript runtime built on Chrome's V8 engine",
      'A JavaScript framework for the browser',
      'A database system',
      'A CSS preprocessor',
    ],
    correctAnswer: "A JavaScript runtime built on Chrome's V8 engine",
    category: 'Node.js',
    difficulty: 'easy',
    explanation: 'Node.js lets you run JavaScript outside the browser — for example, on servers.',
  },
  {
    question: 'Which command initializes a new Node.js project?',
    options: ['npm init', 'node start', 'npm create', 'node init'],
    correctAnswer: 'npm init',
    category: 'Node.js',
    difficulty: 'easy',
    explanation: '`npm init` walks you through creating a package.json file for your project.',
  },
  {
    question: "Which file lists a Node.js project's dependencies?",
    options: ['package.json', 'node.json', 'dependencies.txt', 'package.lock only'],
    correctAnswer: 'package.json',
    category: 'Node.js',
    difficulty: 'easy',
    explanation: 'package.json records the project metadata, scripts and dependencies.',
  },
  {
    question: 'Which global object gives information about the current Node process?',
    options: ['process', 'window', 'document', 'globalThis only'],
    correctAnswer: 'process',
    category: 'Node.js',
    difficulty: 'easy',
    explanation: 'Common uses: process.env for config, process.argv for CLI args, process.exit() to quit.',
  },
  {
    question: 'What does `require()` do in Node.js?',
    options: [
      'Loads a module',
      'Sends an HTTP request',
      'Reads user input',
      'Starts the server',
    ],
    correctAnswer: 'Loads a module',
    category: 'Node.js',
    difficulty: 'medium',
    explanation: "`require('./file')` or `require('package')` loads CommonJS modules.",
  },
  {
    question: 'Which built-in module helps work with file and directory paths?',
    options: ['path', 'fs', 'http', 'url'],
    correctAnswer: 'path',
    category: 'Node.js',
    difficulty: 'medium',
    explanation: '`path.join()` builds correct paths on any operating system.',
  },
  {
    question: 'What is middleware in Express?',
    options: [
      'A function that processes requests before the final handler',
      'A type of database',
      'A CSS library',
      'The Express router itself',
    ],
    correctAnswer: 'A function that processes requests before the final handler',
    category: 'Node.js',
    difficulty: 'medium',
    explanation: 'Middleware runs in order and can modify req/res, or end the request early.',
  },
  {
    question: 'What does npm stand for?',
    options: [
      'Node Package Manager',
      'New Project Module',
      'Node Program Maker',
      'Network Package Mapper',
    ],
    correctAnswer: 'Node Package Manager',
    category: 'Node.js',
    difficulty: 'medium',
    explanation: 'npm is the default package manager that ships with Node.js.',
  },
  {
    question: 'What is the event loop in Node.js?',
    options: [
      'The mechanism that handles asynchronous operations',
      'A for-loop over events',
      'The call stack itself',
      'A database query engine',
    ],
    correctAnswer: 'The mechanism that handles asynchronous operations',
    category: 'Node.js',
    difficulty: 'hard',
    explanation: 'The event loop lets Node.js handle many I/O operations concurrently on a single thread.',
  },
  {
    question: 'Which method starts an Express app listening for requests on a port?',
    options: ['app.listen()', 'app.start()', 'app.serve()', 'app.open()'],
    correctAnswer: 'app.listen()',
    category: 'Node.js',
    difficulty: 'hard',
    explanation: '`app.listen(5000)` binds the server to port 5000.',
  },

  // ---------------- MongoDB (10) ----------------
  {
    question: 'What type of database is MongoDB?',
    options: [
      'A NoSQL document database',
      'A relational SQL database',
      'A graph database',
      'A key-value cache only',
    ],
    correctAnswer: 'A NoSQL document database',
    category: 'MongoDB',
    difficulty: 'easy',
    explanation: 'MongoDB stores flexible, JSON-like documents instead of rigid tables.',
  },
  {
    question: 'In what format does MongoDB store documents internally?',
    options: ['BSON', 'XML', 'CSV', 'YAML'],
    correctAnswer: 'BSON',
    category: 'MongoDB',
    difficulty: 'easy',
    explanation: 'BSON is binary JSON — it adds types like Date and ObjectId.',
  },
  {
    question: 'Which method retrieves documents matching a filter?',
    options: ['find()', 'get()', 'select()', 'fetch()'],
    correctAnswer: 'find()',
    category: 'MongoDB',
    difficulty: 'easy',
    explanation: '`db.users.find({ age: 21 })` returns a cursor of matching documents.',
  },
  {
    question: 'What is Mongoose?',
    options: [
      'An ODM library for MongoDB and Node.js',
      'A MongoDB server',
      'A query language',
      'A hosting service',
    ],
    correctAnswer: 'An ODM library for MongoDB and Node.js',
    category: 'MongoDB',
    difficulty: 'easy',
    explanation: 'Mongoose adds schemas, models and validation on top of the MongoDB driver.',
  },
  {
    question: 'What is a collection in MongoDB?',
    options: [
      'A group of documents, similar to a table',
      'A single document',
      'A database backup',
      'An index',
    ],
    correctAnswer: 'A group of documents, similar to a table',
    category: 'MongoDB',
    difficulty: 'medium',
    explanation: 'Collections hold documents; unlike SQL tables, the documents can have different shapes.',
  },
  {
    question: 'Which method inserts ONE document into a collection?',
    options: ['insertOne()', 'insert()', 'addOne()', 'push()'],
    correctAnswer: 'insertOne()',
    category: 'MongoDB',
    difficulty: 'medium',
    explanation: '`insertOne()` adds a single document; `insertMany()` adds several at once.',
  },
  {
    question: 'What is the purpose of the `_id` field?',
    options: [
      'It uniquely identifies each document',
      'It stores the creation date only',
      'It counts the documents',
      'It is optional metadata',
    ],
    correctAnswer: 'It uniquely identifies each document',
    category: 'MongoDB',
    difficulty: 'medium',
    explanation: "MongoDB auto-generates an ObjectId for `_id` if you don't provide one.",
  },
  {
    question: 'Which tool provides a graphical interface for MongoDB?',
    options: ['MongoDB Compass', 'MongoDB Terminal', 'Mongo Shell GUI', 'Atlas CLI'],
    correctAnswer: 'MongoDB Compass',
    category: 'MongoDB',
    difficulty: 'medium',
    explanation: 'Compass lets you explore data, run queries and manage indexes visually.',
  },
  {
    question: 'Which query operator matches values GREATER THAN a number?',
    options: ['$gt', '$lt', '$eq', '$in'],
    correctAnswer: '$gt',
    category: 'MongoDB',
    difficulty: 'hard',
    explanation: '`{ age: { $gt: 18 } }` matches documents where age is greater than 18.',
  },
  {
    question: 'What is the aggregation pipeline in MongoDB?',
    options: [
      'A series of stages that process documents into computed results',
      'A backup tool',
      'A way to connect replicas',
      'A schema validator',
    ],
    correctAnswer: 'A series of stages that process documents into computed results',
    category: 'MongoDB',
    difficulty: 'hard',
    explanation: 'Stages like $match, $group and $sort transform data step by step.',
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear old questions so re-running the seed never creates duplicates.
    await Question.deleteMany({});
    const inserted = await Question.insertMany(questions);

    console.log(`Seeded ${inserted.length} questions successfully.`);
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
