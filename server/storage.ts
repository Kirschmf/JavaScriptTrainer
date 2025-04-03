import { 
  snippets, 
  type Snippet, 
  type InsertSnippet,
  consoleEntries,
  type ConsoleEntry
} from "@shared/schema";

export interface IStorage {
  // Snippet operations
  getSnippets(): Promise<Snippet[]>;
  getSnippet(id: number): Promise<Snippet | undefined>;
  getExamples(): Promise<Snippet[]>;
  createSnippet(snippet: InsertSnippet): Promise<Snippet>;
  updateSnippet(id: number, snippet: Partial<InsertSnippet>): Promise<Snippet | undefined>;
  deleteSnippet(id: number): Promise<boolean>;
  
  // Console entry operations
  getConsoleEntries(snippetId: number): Promise<ConsoleEntry[]>;
  createConsoleEntry(entry: Omit<ConsoleEntry, 'id' | 'timestamp'>): Promise<ConsoleEntry>;
  clearConsoleEntries(snippetId: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private snippets: Map<number, Snippet>;
  private consoleEntries: Map<number, ConsoleEntry[]>;
  private currentSnippetId: number;
  private currentConsoleEntryId: number;

  constructor() {
    this.snippets = new Map();
    this.consoleEntries = new Map();
    this.currentSnippetId = 1;
    this.currentConsoleEntryId = 1;
    
    // Add default examples
    this.initializeExamples();
  }

  private initializeExamples() {
    const examples = [
      {
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
console.table(users);`,
        isExample: true
      },
      {
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

fetchData();`,
        isExample: true
      },
      {
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
console.log('Sorted descending:', sortedDesc);`,
        isExample: true
      },
      {
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

parallel();`,
        isExample: true
      },
      {
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
*/`,
        isExample: true
      }
    ];
    
    examples.forEach(example => {
      const id = this.currentSnippetId++;
      this.snippets.set(id, {
        id,
        title: example.title,
        description: example.description || "",
        code: example.code,
        isExample: true,
        createdAt: new Date().toISOString()
      });
    });
  }

  async getSnippets(): Promise<Snippet[]> {
    return Array.from(this.snippets.values());
  }

  async getSnippet(id: number): Promise<Snippet | undefined> {
    return this.snippets.get(id);
  }

  async getExamples(): Promise<Snippet[]> {
    return Array.from(this.snippets.values()).filter(snippet => snippet.isExample);
  }

  async createSnippet(snippet: InsertSnippet): Promise<Snippet> {
    const id = this.currentSnippetId++;
    const newSnippet: Snippet = {
      id,
      ...snippet,
      isExample: false,
      createdAt: new Date().toISOString()
    };
    
    this.snippets.set(id, newSnippet);
    return newSnippet;
  }

  async updateSnippet(id: number, snippet: Partial<InsertSnippet>): Promise<Snippet | undefined> {
    const existingSnippet = this.snippets.get(id);
    
    if (!existingSnippet) {
      return undefined;
    }
    
    const updatedSnippet = {
      ...existingSnippet,
      ...snippet
    };
    
    this.snippets.set(id, updatedSnippet);
    return updatedSnippet;
  }

  async deleteSnippet(id: number): Promise<boolean> {
    return this.snippets.delete(id);
  }

  async getConsoleEntries(snippetId: number): Promise<ConsoleEntry[]> {
    return this.consoleEntries.get(snippetId) || [];
  }

  async createConsoleEntry(entry: Omit<ConsoleEntry, 'id' | 'timestamp'>): Promise<ConsoleEntry> {
    const id = this.currentConsoleEntryId++;
    const newEntry: ConsoleEntry = {
      id,
      ...entry,
      timestamp: new Date().toISOString()
    };
    
    const entries = this.consoleEntries.get(entry.snippetId) || [];
    entries.push(newEntry);
    this.consoleEntries.set(entry.snippetId, entries);
    
    return newEntry;
  }

  async clearConsoleEntries(snippetId: number): Promise<boolean> {
    this.consoleEntries.set(snippetId, []);
    return true;
  }
}

export const storage = new MemStorage();
