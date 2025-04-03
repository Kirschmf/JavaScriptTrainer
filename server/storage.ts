import { 
  snippets, 
  type Snippet, 
  type InsertSnippet,
  consoleEntries,
  type ConsoleEntry,
  challengeCategories,
  type ChallengeCategory,
  type InsertChallengeCategory,
  challenges,
  type Challenge,
  type InsertChallenge,
  userChallengeProgress,
  type UserChallengeProgress,
  type InsertUserChallengeProgress
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc } from "drizzle-orm";

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
  
  // Challenge category operations
  getChallengeCategories(): Promise<ChallengeCategory[]>;
  getChallengeCategory(id: number): Promise<ChallengeCategory | undefined>;
  createChallengeCategory(category: InsertChallengeCategory): Promise<ChallengeCategory>;
  updateChallengeCategory(id: number, category: Partial<InsertChallengeCategory>): Promise<ChallengeCategory | undefined>;
  deleteChallengeCategory(id: number): Promise<boolean>;
  
  // Challenge operations
  getChallenges(categoryId?: number): Promise<Challenge[]>;
  getChallenge(id: number): Promise<Challenge | undefined>;
  createChallenge(challenge: InsertChallenge): Promise<Challenge>;
  updateChallenge(id: number, challenge: Partial<InsertChallenge>): Promise<Challenge | undefined>;
  deleteChallenge(id: number): Promise<boolean>;
  
  // Challenge progress operations
  getChallengeProgress(challengeId: number): Promise<UserChallengeProgress | undefined>;
  createOrUpdateChallengeProgress(progress: InsertUserChallengeProgress): Promise<UserChallengeProgress>;
  getAllChallengeProgress(): Promise<UserChallengeProgress[]>;
  
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
    
    // Check if challenge categories exist
    const existingCategories = await this.getChallengeCategories();
    
    if (existingCategories.length === 0) {
      console.log('Initializing database with challenge categories and challenges...');
      await this.seedChallenges();
    }
  }
  
  private async seedChallenges() {
    // Create challenge categories
    const categories = [
      {
        name: "Fundamentals",
        description: "Basic JavaScript concepts and syntax",
        order: 1
      },
      {
        name: "Arrays & Objects",
        description: "Working with data structures in JavaScript",
        order: 2
      },
      {
        name: "Functions & Scope",
        description: "Learn about functions, closures, and scope",
        order: 3
      },
      {
        name: "Asynchronous JavaScript",
        description: "Promises, async/await, and handling asynchronous code",
        order: 4
      },
      {
        name: "DOM Manipulation",
        description: "Interact with the Document Object Model",
        order: 5
      }
    ];
    
    // Insert all categories and keep track of their IDs
    const categoryIds = [];
    for (const category of categories) {
      const result = await this.createChallengeCategory(category);
      categoryIds.push(result.id);
    }
    
    // Create challenges for the Fundamentals category
    const fundamentalsChallenges = [
      {
        categoryId: categoryIds[0],
        title: "Variable Swap",
        description: "Swap the values of two variables without using a temporary variable.",
        difficulty: "easy",
        starterCode: `// Swap the values of variables 'a' and 'b' without using a third variable
let a = 5;
let b = 10;

// Your code here


// Don't modify the code below
console.log(a); // Should output 10
console.log(b); // Should output 5`,
        solutionCode: `// Swap the values of variables 'a' and 'b' without using a third variable
let a = 5;
let b = 10;

// Solution using destructuring assignment
[a, b] = [b, a];

// Alternative solution using arithmetic operations:
// a = a + b;
// b = a - b;
// a = a - b;

// Don't modify the code below
console.log(a); // Should output 10
console.log(b); // Should output 5`,
        hints: ["Consider using array destructuring", "You can also use arithmetic operations like addition and subtraction"],
        testCases: JSON.stringify([
          { input: { a: 5, b: 10 }, expected: { a: 10, b: 5 } },
          { input: { a: -3, b: 7 }, expected: { a: 7, b: -3 } }
        ]),
        order: 1
      },
      {
        categoryId: categoryIds[0],
        title: "FizzBuzz",
        description: "Write a function that returns 'Fizz' for numbers divisible by 3, 'Buzz' for numbers divisible by 5, and 'FizzBuzz' for numbers divisible by both. Otherwise, return the number itself.",
        difficulty: "easy",
        starterCode: `// Implement the fizzBuzz function according to these rules:
// - Return "Fizz" if the number is divisible by 3
// - Return "Buzz" if the number is divisible by 5
// - Return "FizzBuzz" if the number is divisible by both 3 and 5
// - Return the number as a string for all other cases

function fizzBuzz(num) {
  // Your code here
}

// Test cases
console.log(fizzBuzz(3));  // Should output "Fizz"
console.log(fizzBuzz(5));  // Should output "Buzz"
console.log(fizzBuzz(15)); // Should output "FizzBuzz"
console.log(fizzBuzz(7));  // Should output "7"`,
        solutionCode: `// Implement the fizzBuzz function according to these rules:
// - Return "Fizz" if the number is divisible by 3
// - Return "Buzz" if the number is divisible by 5
// - Return "FizzBuzz" if the number is divisible by both 3 and 5
// - Return the number as a string for all other cases

function fizzBuzz(num) {
  if (num % 3 === 0 && num % 5 === 0) {
    return "FizzBuzz";
  } else if (num % 3 === 0) {
    return "Fizz";
  } else if (num % 5 === 0) {
    return "Buzz";
  } else {
    return String(num);
  }
}

// Test cases
console.log(fizzBuzz(3));  // Should output "Fizz"
console.log(fizzBuzz(5));  // Should output "Buzz"
console.log(fizzBuzz(15)); // Should output "FizzBuzz"
console.log(fizzBuzz(7));  // Should output "7"`,
        hints: ["Use the modulo operator (%) to check if a number is divisible by another", "Check for the most specific condition first (divisible by both 3 and 5)"],
        testCases: JSON.stringify([
          { input: 3, expected: "Fizz" },
          { input: 5, expected: "Buzz" },
          { input: 15, expected: "FizzBuzz" },
          { input: 7, expected: "7" },
          { input: 0, expected: "FizzBuzz" }
        ]),
        order: 2
      }
    ];
    
    // Create challenges for the Arrays & Objects category
    const arraysObjectsChallenges = [
      {
        categoryId: categoryIds[1],
        title: "Find Maximum Value",
        description: "Write a function that finds the maximum value in an array of numbers.",
        difficulty: "easy",
        starterCode: `// Implement a function to find the maximum value in an array
// Do not use the built-in Math.max(...array) method

function findMax(numbers) {
  // Your code here
}

// Test cases
console.log(findMax([1, 3, 2, 5, 4]));      // Should output 5
console.log(findMax([-1, -5, -2]));         // Should output -1
console.log(findMax([100, 0, -100, 200]));  // Should output 200`,
        solutionCode: `// Implement a function to find the maximum value in an array
// Do not use the built-in Math.max(...array) method

function findMax(numbers) {
  if (numbers.length === 0) {
    return undefined; // Handle edge case of empty array
  }
  
  let max = numbers[0]; // Start with the first element
  
  for (let i = 1; i < numbers.length; i++) {
    if (numbers[i] > max) {
      max = numbers[i];
    }
  }
  
  return max;
}

// Test cases
console.log(findMax([1, 3, 2, 5, 4]));      // Should output 5
console.log(findMax([-1, -5, -2]));         // Should output -1
console.log(findMax([100, 0, -100, 200]));  // Should output 200`,
        hints: ["Start by assuming the first element is the maximum", "Loop through the array and compare each value with your current maximum"],
        testCases: JSON.stringify([
          { input: [1, 3, 2, 5, 4], expected: 5 },
          { input: [-1, -5, -2], expected: -1 },
          { input: [100, 0, -100, 200], expected: 200 },
          { input: [42], expected: 42 }
        ]),
        order: 1
      },
      {
        categoryId: categoryIds[1],
        title: "Merge Objects",
        description: "Implement a function that merges two objects together, with the second object's properties taking precedence in case of duplicates.",
        difficulty: "medium",
        starterCode: `// Implement a function to merge two objects
// The second object's properties should override the first object's properties 
// when there are duplicate keys

function mergeObjects(obj1, obj2) {
  // Your code here
}

// Test cases
const person1 = { name: "John", age: 30 };
const person2 = { city: "New York", age: 32 };

console.log(mergeObjects(person1, person2));
// Should output: { name: "John", age: 32, city: "New York" }

const defaults = { theme: "dark", fontSize: 12, showSidebar: true };
const userSettings = { fontSize: 14, showSidebar: false };

console.log(mergeObjects(defaults, userSettings));
// Should output: { theme: "dark", fontSize: 14, showSidebar: false }`,
        solutionCode: `// Implement a function to merge two objects
// The second object's properties should override the first object's properties 
// when there are duplicate keys

function mergeObjects(obj1, obj2) {
  // Using the spread operator to merge objects
  return { ...obj1, ...obj2 };
  
  // Alternative solution using Object.assign
  // return Object.assign({}, obj1, obj2);
}

// Test cases
const person1 = { name: "John", age: 30 };
const person2 = { city: "New York", age: 32 };

console.log(mergeObjects(person1, person2));
// Should output: { name: "John", age: 32, city: "New York" }

const defaults = { theme: "dark", fontSize: 12, showSidebar: true };
const userSettings = { fontSize: 14, showSidebar: false };

console.log(mergeObjects(defaults, userSettings));
// Should output: { theme: "dark", fontSize: 14, showSidebar: false }`,
        hints: ["The spread operator (...) can be used to combine objects", "Object.assign() is another method for merging objects"],
        testCases: JSON.stringify([
          { 
            input: {
              obj1: { name: "John", age: 30 },
              obj2: { city: "New York", age: 32 }
            }, 
            expected: { name: "John", age: 32, city: "New York" }
          },
          { 
            input: {
              obj1: { theme: "dark", fontSize: 12, showSidebar: true },
              obj2: { fontSize: 14, showSidebar: false }
            }, 
            expected: { theme: "dark", fontSize: 14, showSidebar: false }
          }
        ]),
        order: 2
      }
    ];
    
    // Create challenges for the Functions category
    const functionsChallenges = [
      {
        categoryId: categoryIds[2],
        title: "Create Counter Closure",
        description: "Create a function that returns a counter function. The counter should increment each time it's called and return the current count.",
        difficulty: "medium",
        starterCode: `// Create a function 'createCounter' that returns a counter function
// The counter function, when called, should increment and return the count
// Each counter function should maintain its own independent count

function createCounter(startValue = 0) {
  // Your code here
}

// Test cases
const counter1 = createCounter();
console.log(counter1()); // Should output 1
console.log(counter1()); // Should output 2

const counter2 = createCounter(10);
console.log(counter2()); // Should output 11
console.log(counter2()); // Should output 12
console.log(counter1()); // Should output 3 (counter1 is not affected by counter2)`,
        solutionCode: `// Create a function 'createCounter' that returns a counter function
// The counter function, when called, should increment and return the count
// Each counter function should maintain its own independent count

function createCounter(startValue = 0) {
  // Using a closure to maintain the count
  let count = startValue;
  
  // Return a function that increments and returns the count
  return function() {
    count += 1;
    return count;
  };
}

// Test cases
const counter1 = createCounter();
console.log(counter1()); // Should output 1
console.log(counter1()); // Should output 2

const counter2 = createCounter(10);
console.log(counter2()); // Should output 11
console.log(counter2()); // Should output 12
console.log(counter1()); // Should output 3 (counter1 is not affected by counter2)`,
        hints: ["Use a closure to maintain state between function calls", "Each time createCounter is called, it should create a new 'count' variable in its scope"],
        testCases: JSON.stringify([
          { input: { calls: [[], []] }, expected: [1, 2] },
          { input: { startValue: 5, calls: [[], [], []] }, expected: [6, 7, 8] },
          { input: { multipleCounters: true }, expected: { counter1: [1, 2], counter2: [11, 12] } }
        ]),
        order: 1
      }
    ];
    
    // Create and insert all challenges
    const allChallenges = [
      ...fundamentalsChallenges,
      ...arraysObjectsChallenges,
      ...functionsChallenges
    ];
    
    for (const challenge of allChallenges) {
      try {
        console.log(`Creating challenge: ${challenge.title}`);
        await this.createChallenge(challenge);
      } catch (error) {
        console.error(`Error creating challenge ${challenge.title}:`, error);
      }
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

  // Challenge category operations
  async getChallengeCategories(): Promise<ChallengeCategory[]> {
    return await db.query.challengeCategories.findMany({
      orderBy: asc(challengeCategories.order)
    });
  }

  async getChallengeCategory(id: number): Promise<ChallengeCategory | undefined> {
    const result = await db.query.challengeCategories.findFirst({
      where: eq(challengeCategories.id, id)
    });
    
    return result || undefined;
  }

  async createChallengeCategory(category: InsertChallengeCategory): Promise<ChallengeCategory> {
    const result = await db.insert(challengeCategories)
      .values({
        name: category.name,
        description: category.description,
        order: category.order || 0,
        createdAt: new Date()
      })
      .returning();
    
    return result[0];
  }

  async updateChallengeCategory(id: number, category: Partial<InsertChallengeCategory>): Promise<ChallengeCategory | undefined> {
    // First check if the category exists
    const existingCategory = await this.getChallengeCategory(id);
    
    if (!existingCategory) {
      return undefined;
    }
    
    // Update the category
    const result = await db.update(challengeCategories)
      .set({
        ...category
      })
      .where(eq(challengeCategories.id, id))
      .returning();
    
    return result[0];
  }

  async deleteChallengeCategory(id: number): Promise<boolean> {
    try {
      // First delete all challenges in this category
      const challengesInCategory = await this.getChallenges(id);
      
      for (const challenge of challengesInCategory) {
        await this.deleteChallenge(challenge.id);
      }
      
      // Then delete the category itself
      const result = await db.delete(challengeCategories)
        .where(eq(challengeCategories.id, id))
        .returning();
      
      return result.length > 0;
    } catch (error) {
      console.error("Error deleting challenge category:", error);
      return false;
    }
  }

  // Challenge operations
  async getChallenges(categoryId?: number): Promise<Challenge[]> {
    if (categoryId) {
      return await db.query.challenges.findMany({
        where: eq(challenges.categoryId, categoryId),
        orderBy: asc(challenges.order)
      });
    } else {
      return await db.query.challenges.findMany({
        orderBy: [asc(challenges.categoryId), asc(challenges.order)]
      });
    }
  }

  async getChallenge(id: number): Promise<Challenge | undefined> {
    const result = await db.query.challenges.findFirst({
      where: eq(challenges.id, id)
    });
    
    return result || undefined;
  }

  async createChallenge(challenge: InsertChallenge): Promise<Challenge> {
    const result = await db.insert(challenges)
      .values({
        categoryId: challenge.categoryId,
        title: challenge.title,
        description: challenge.description,
        difficulty: challenge.difficulty,
        starterCode: challenge.starterCode,
        solutionCode: challenge.solutionCode,
        hints: challenge.hints || [],
        testCases: challenge.testCases,
        order: challenge.order || 0,
        createdAt: new Date()
      })
      .returning();
    
    return result[0];
  }

  async updateChallenge(id: number, challenge: Partial<InsertChallenge>): Promise<Challenge | undefined> {
    // First check if the challenge exists
    const existingChallenge = await this.getChallenge(id);
    
    if (!existingChallenge) {
      return undefined;
    }
    
    // Update the challenge
    const result = await db.update(challenges)
      .set({
        ...challenge
      })
      .where(eq(challenges.id, id))
      .returning();
    
    return result[0];
  }

  async deleteChallenge(id: number): Promise<boolean> {
    try {
      // First delete all user progress for this challenge
      await db.delete(userChallengeProgress)
        .where(eq(userChallengeProgress.challengeId, id));
      
      // Then delete the challenge itself
      const result = await db.delete(challenges)
        .where(eq(challenges.id, id))
        .returning();
      
      return result.length > 0;
    } catch (error) {
      console.error("Error deleting challenge:", error);
      return false;
    }
  }

  // Challenge progress operations
  async getChallengeProgress(challengeId: number): Promise<UserChallengeProgress | undefined> {
    const result = await db.query.userChallengeProgress.findFirst({
      where: eq(userChallengeProgress.challengeId, challengeId)
    });
    
    return result || undefined;
  }

  async createOrUpdateChallengeProgress(progress: InsertUserChallengeProgress): Promise<UserChallengeProgress> {
    // Check if progress exists
    const existingProgress = await this.getChallengeProgress(progress.challengeId);
    
    if (existingProgress) {
      // Update existing progress
      const result = await db.update(userChallengeProgress)
        .set({
          userCode: progress.userCode,
          completed: progress.completed,
          lastAttemptAt: new Date()
        })
        .where(eq(userChallengeProgress.id, existingProgress.id))
        .returning();
      
      return result[0];
    } else {
      // Create new progress entry
      const result = await db.insert(userChallengeProgress)
        .values({
          challengeId: progress.challengeId,
          userCode: progress.userCode,
          completed: progress.completed,
          lastAttemptAt: new Date()
        })
        .returning();
      
      return result[0];
    }
  }

  async getAllChallengeProgress(): Promise<UserChallengeProgress[]> {
    return await db.query.userChallengeProgress.findMany({
      orderBy: desc(userChallengeProgress.lastAttemptAt)
    });
  }
}

export const storage = new PostgresStorage();
