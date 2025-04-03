export interface CodeExample {
  id: string;
  title: string;
  description: string;
  code: string;
}

export const codeExamples: CodeExample[] = [
  {
    id: "console-logging",
    title: "Basic Console Logging",
    description: "Learn how to use console.log, warn, and error",
    code: `// Basic logging
console.log("This is a log message");
console.warn("This is a warning");
console.error("This is an error");

// Logging variables
const name = "JavaScript";
console.log("Hello, " + name + "!");

// Logging objects
const user = { name: "John", age: 30 };
console.log(user);

// Using console.table for arrays/objects
const users = [
  { name: "John", age: 30 },
  { name: "Jane", age: 25 }
];
console.table(users);`
  },
  {
    id: "fetch-api",
    title: "Fetch API Example",
    description: "Making HTTP requests with fetch",
    code: `// Basic fetch request
fetch('https://jsonplaceholder.typicode.com/todos/1')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));

// Using async/await with fetch
async function fetchData() {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/users');
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error('Error:', error);
  }
}

fetchData();`
  },
  {
    id: "array-methods",
    title: "Array Methods",
    description: "Map, filter, reduce and other array operations",
    code: `const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// Map - transform each element
const doubled = numbers.map(num => num * 2);
console.log('Doubled:', doubled);

// Filter - keep elements that pass the test
const evens = numbers.filter(num => num % 2 === 0);
console.log('Even numbers:', evens);

// Reduce - accumulate values
const sum = numbers.reduce((total, num) => total + num, 0);
console.log('Sum:', sum);

// Find - get first element that matches
const firstGreaterThanFive = numbers.find(num => num > 5);
console.log('First > 5:', firstGreaterThanFive);

// Some/Every - test if some/all elements match
console.log('Some > 5:', numbers.some(num => num > 5));
console.log('All > 5:', numbers.every(num => num > 5));

// Sort
const sortedDesc = [...numbers].sort((a, b) => b - a);
console.log('Sorted descending:', sortedDesc);`
  },
  {
    id: "async-await",
    title: "Async/Await",
    description: "Working with Promises and async functions",
    code: `// Promise example
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Using promises with .then()
delay(1000)
  .then(() => {
    console.log('Delayed 1 second');
    return delay(1000);
  })
  .then(() => {
    console.log('Delayed another second');
  });

// Using async/await
async function delayedMessages() {
  console.log('Starting...');
  
  await delay(1500);
  console.log('After 1.5 seconds');
  
  await delay(1000);
  console.log('After another second');
  
  return 'All done!';
}

// Call the async function
delayedMessages()
  .then(result => console.log(result));

// Parallel execution with Promise.all
async function parallel() {
  const [result1, result2] = await Promise.all([
    delay(2000).then(() => 'First result'),
    delay(1000).then(() => 'Second result')
  ]);
  
  console.log(result1, result2);
}

parallel();`
  },
  {
    id: "dom-manipulation",
    title: "DOM Manipulation",
    description: "Creating and updating DOM elements",
    code: `// Note: DOM manipulation works in browser context,
// but this example will run in our sandboxed environment

// Creating elements
function createDOM() {
  // Simulate DOM operations
  const div = { tagName: 'div', className: '', children: [], textContent: '' };
  
  div.className = 'container';
  div.textContent = 'Hello World';
  
  const button = { tagName: 'button', className: '', textContent: '', addEventListener: () => {} };
  button.textContent = 'Click me';
  button.className = 'btn';
  
  // Simulating append
  div.children.push(button);
  
  console.log('Created DOM structure:', JSON.stringify(div, null, 2));
  
  // Simulating event listener
  console.log('Adding click event listener to button');
  
  // Simulating a click
  console.log('Button clicked!');
}

createDOM();

// In a real browser environment, you would use:
/*
const div = document.createElement('div');
div.className = 'container';
div.textContent = 'Hello World';

const button = document.createElement('button');
button.textContent = 'Click me';
button.className = 'btn';

div.appendChild(button);

document.body.appendChild(div);

button.addEventListener('click', () => {
  console.log('Button clicked!');
});
*/`
  }
];
