import { 
  snippets, 
  type Snippet, 
  type InsertSnippet,
  consoleEntries,
  type ConsoleEntry
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

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
  
  // Database-specific operations
  initializeDatabase(): Promise<void>;
}

export class PostgresStorage implements IStorage {
  
  constructor() {}
  
  // Helper to ensure examples exist in the database
  async initializeDatabase(): Promise<void> {
    // Check if examples already exist
    const existingExamples = await this.getExamples();
    
    if (existingExamples.length === 0) {
      console.log('Initializing database with example snippets...');
      await this.seedExamples();
    }
  }
  
  private async seedExamples() {
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
        title: "JavaScript Fundamentals",
        description: "Variables, data types, and basic operations",
        code: `// Variables - let, const, var
let count = 10;
const name = "JavaScript";
var oldWay = "Legacy variable";

// Data types
const string = "Hello";
const number = 42;
const decimal = 3.14;
const boolean = true;
const nullValue = null;
const undefinedValue = undefined;
const array = [1, 2, 3];
const object = { key: "value", number: 42 };

// Template literals
const greeting = \`Hello, \${name}! Count is \${count}\`;
console.log(greeting);

// Basic math operations
console.log("Addition:", 5 + 3);
console.log("Subtraction:", 10 - 4);
console.log("Multiplication:", 3 * 4);
console.log("Division:", 20 / 5);
console.log("Modulus:", 10 % 3);
console.log("Exponentiation:", 2 ** 3);

// Increment/decrement
let num = 5;
console.log("Increment:", ++num); // 6
console.log("Decrement:", --num); // 5

// Type conversion
console.log("Number to string:", String(42));
console.log("String to number:", Number("42"));
console.log("Boolean conversion:", Boolean(1), Boolean(0));`,
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
        title: "Object Methods & Spread",
        description: "Working with objects in modern JavaScript",
        code: `// Object creation
const user = {
  firstName: "John",
  lastName: "Doe",
  age: 30,
  email: "john@example.com",
  
  // Object method
  getFullName() {
    return \`\${this.firstName} \${this.lastName}\`;
  }
};

// Accessing properties
console.log(user.firstName);
console.log(user["lastName"]);

// Object methods
console.log(user.getFullName());

// Object.keys, values, entries
console.log("Keys:", Object.keys(user));
console.log("Values:", Object.values(user));
console.log("Entries:", Object.entries(user));

// Spread operator
const userDetails = { ...user, location: "New York", age: 31 };
console.log("User with details:", userDetails);

// Object destructuring
const { firstName, lastName, ...rest } = user;
console.log("Destructured:", firstName, lastName);
console.log("Rest of properties:", rest);

// Checking if property exists
console.log("Has email?", "email" in user);
console.log("Has property?", user.hasOwnProperty("phone"));

// Object.assign
const merged = Object.assign({}, user, { role: "Admin" });
console.log("Merged object:", merged);`,
        isExample: true
      },
      {
        title: "ES6+ Features",
        description: "Modern JavaScript language features",
        code: `// Arrow functions
const add = (a, b) => a + b;
console.log("Arrow function:", add(5, 3));

// Default parameters
function greet(name = "Guest") {
  return \`Hello, \${name}!\`;
}
console.log(greet());
console.log(greet("Sarah"));

// Rest parameters
function sum(...numbers) {
  return numbers.reduce((total, num) => total + num, 0);
}
console.log("Sum with rest params:", sum(1, 2, 3, 4, 5));

// Spread operator
const arr1 = [1, 2, 3];
const arr2 = [4, 5, 6];
const combined = [...arr1, ...arr2];
console.log("Spread arrays:", combined);

// Object property shorthand
const name = "Alice";
const age = 25;
const person = { name, age };
console.log("Shorthand object:", person);

// Computed property names
const propName = "dynamicProp";
const obj = {
  [propName]: "Dynamic value"
};
console.log("Computed property:", obj);

// Destructuring
const [first, second, ...rest] = [1, 2, 3, 4, 5];
console.log("Destructured array:", first, second, rest);

// Optional chaining
const user = { 
  profile: { 
    address: { city: "New York" } 
  } 
};
console.log("Optional chaining:", user?.profile?.address?.city);
console.log("Nested prop (safe):", user?.profile?.nonExistent?.prop);

// Nullish coalescing
const value = null;
const defaultValue = value ?? "Default";
console.log("Nullish coalescing:", defaultValue);`,
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
        title: "Error Handling",
        description: "Try/catch and custom error types",
        code: `// Basic try/catch
try {
  // Code that might throw an error
  const result = nonExistentFunction();
  console.log(result);
} catch (error) {
  console.error("Caught an error:", error.message);
} finally {
  console.log("This always executes");
}

// Custom error types
class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
  }
}

class DatabaseError extends Error {
  constructor(message) {
    super(message);
    this.name = "DatabaseError";
  }
}

// Function that might throw different errors
function processUserData(data) {
  try {
    if (!data) {
      throw new ValidationError("Data is required");
    }
    
    if (!data.id) {
      throw new ValidationError("User ID is required");
    }
    
    if (data.id < 0) {
      throw new DatabaseError("Invalid user ID format");
    }
    
    return "Data processed successfully";
  } catch (error) {
    if (error instanceof ValidationError) {
      console.error("Validation Issue:", error.message);
    } else if (error instanceof DatabaseError) {
      console.error("Database Issue:", error.message);
    } else {
      console.error("Unknown error:", error);
    }
    throw error; // Re-throw for caller to handle
  }
}

// Test with different inputs
try {
  console.log(processUserData({ id: 123 }));
  console.log(processUserData(null));  // Will throw ValidationError
} catch (error) {
  console.log("Main caught:", error.name);
}`,
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
      },
      {
        title: "Classes & OOP",
        description: "Object-oriented programming in JavaScript",
        code: `// Class declaration
class Animal {
  constructor(name) {
    this.name = name;
  }
  
  speak() {
    console.log(\`\${this.name} makes a noise.\`);
  }
  
  // Static method - called on the class, not instances
  static compareAnimals(a, b) {
    return a.name === b.name;
  }
}

// Inheritance
class Dog extends Animal {
  constructor(name, breed) {
    super(name); // Call the parent constructor
    this.breed = breed;
  }
  
  speak() {
    console.log(\`\${this.name} barks! Woof woof!\`);
  }
  
  fetch() {
    console.log(\`\${this.name} fetches the ball!\`);
  }
}

// Creating instances
const generic = new Animal("Charlie");
const dog = new Dog("Max", "Golden Retriever");

// Using methods
generic.speak(); // Charlie makes a noise
dog.speak();     // Max barks! Woof woof!
dog.fetch();     // Max fetches the ball!

// Using static method
const anotherDog = new Dog("Max", "Labrador");
console.log("Same name?", Animal.compareAnimals(dog, anotherDog));

// Instance checking
console.log("dog is Dog?", dog instanceof Dog);       // true
console.log("dog is Animal?", dog instanceof Animal); // true
console.log("generic is Dog?", generic instanceof Dog); // false

// Private fields (newer JavaScript feature)
class BankAccount {
  #balance = 0; // Private field
  
  constructor(owner, initialDeposit = 0) {
    this.owner = owner;
    this.#balance = initialDeposit;
  }
  
  deposit(amount) {
    if (amount <= 0) throw new Error("Invalid amount");
    this.#balance += amount;
    return this.#balance;
  }
  
  withdraw(amount) {
    if (amount <= 0) throw new Error("Invalid amount");
    if (amount > this.#balance) throw new Error("Insufficient funds");
    this.#balance -= amount;
    return this.#balance;
  }
  
  get balance() {
    return \`$\${this.#balance.toFixed(2)}\`;
  }
}

const account = new BankAccount("John Doe", 100);
console.log(\`Initial: \${account.balance}\`);
account.deposit(50);
console.log(\`After deposit: \${account.balance}\`);
account.withdraw(25);
console.log(\`After withdrawal: \${account.balance}\`);

// Attempting to access private field would cause an error
// console.log(account.#balance); // SyntaxError`,
        isExample: true
      }
    ];
    
    // Insert all examples
    for (const example of examples) {
      await db.insert(snippets).values({
        title: example.title,
        code: example.code,
        description: example.description,
        isExample: true,
        // Let the default value handle the timestamp
        createdAt: new Date()
      });
    }
  }

  async getSnippets(): Promise<Snippet[]> {
    return await db.query.snippets.findMany({
      orderBy: desc(snippets.createdAt)
    });
  }

  async getSnippet(id: number): Promise<Snippet | undefined> {
    const result = await db.query.snippets.findFirst({
      where: eq(snippets.id, id)
    });
    
    return result || undefined;
  }

  async getExamples(): Promise<Snippet[]> {
    return await db.query.snippets.findMany({
      where: eq(snippets.isExample, true),
      orderBy: desc(snippets.createdAt)
    });
  }

  async createSnippet(snippet: InsertSnippet): Promise<Snippet> {
    const result = await db.insert(snippets)
      .values({
        title: snippet.title,
        code: snippet.code,
        description: snippet.description,
        isExample: false,
        createdAt: new Date()
      })
      .returning();
    
    return result[0];
  }

  async updateSnippet(id: number, snippet: Partial<InsertSnippet>): Promise<Snippet | undefined> {
    // First check if the snippet exists
    const existingSnippet = await this.getSnippet(id);
    
    if (!existingSnippet) {
      return undefined;
    }
    
    // Update the snippet
    const result = await db.update(snippets)
      .set({
        ...snippet
      })
      .where(eq(snippets.id, id))
      .returning();
    
    return result[0];
  }

  async deleteSnippet(id: number): Promise<boolean> {
    try {
      // First delete associated console entries
      await db.delete(consoleEntries)
        .where(eq(consoleEntries.snippetId, id));
      
      // Then delete the snippet itself
      const result = await db.delete(snippets)
        .where(eq(snippets.id, id))
        .returning();
      
      return result.length > 0;
    } catch (error) {
      console.error("Error deleting snippet:", error);
      return false;
    }
  }

  async getConsoleEntries(snippetId: number): Promise<ConsoleEntry[]> {
    return await db.query.consoleEntries.findMany({
      where: eq(consoleEntries.snippetId, snippetId),
      orderBy: consoleEntries.timestamp
    });
  }

  async createConsoleEntry(entry: Omit<ConsoleEntry, 'id' | 'timestamp'>): Promise<ConsoleEntry> {
    const result = await db.insert(consoleEntries)
      .values({
        snippetId: entry.snippetId,
        type: entry.type,
        content: entry.content
      })
      .returning();
    
    return result[0];
  }

  async clearConsoleEntries(snippetId: number): Promise<boolean> {
    try {
      await db.delete(consoleEntries)
        .where(eq(consoleEntries.snippetId, snippetId));
      
      return true;
    } catch (error) {
      console.error("Error clearing console entries:", error);
      return false;
    }
  }
}

export const storage = new PostgresStorage();
