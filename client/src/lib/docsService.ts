// Documentation service for providing JavaScript learning resources

export interface DocumentationResource {
  title: string;
  description: string;
  url: string;
  type: 'article' | 'reference' | 'tutorial' | 'video' | 'example';
  tags: string[];
}

export interface MethodDocumentation {
  name: string;
  description: string;
  syntax: string;
  parameters?: {
    name: string;
    description: string;
    type: string;
    optional: boolean;
  }[];
  returnValue?: {
    description: string;
    type: string;
  };
  examples: string[];
  url: string;
}

/**
 * Get documentation resources related to a JavaScript topic
 * @param topic The JavaScript topic or concept to find resources for
 * @returns Array of related documentation resources
 */
export function getResourcesForTopic(topic: string): DocumentationResource[] {
  const lowerTopic = topic.toLowerCase();
  return documentation.filter(doc => 
    doc.title.toLowerCase().includes(lowerTopic) || 
    doc.description.toLowerCase().includes(lowerTopic) ||
    doc.tags.some(tag => tag.toLowerCase().includes(lowerTopic))
  );
}

/**
 * Get documentation for a specific JavaScript method or property
 * @param methodName Name of the method or property (e.g., "Array.map" or "String.prototype.slice")
 * @returns Documentation for the method if found, undefined otherwise
 */
export function getMethodDocumentation(methodName: string): MethodDocumentation | undefined {
  const lowerMethod = methodName.toLowerCase();
  return methodDocs.find(doc => 
    doc.name.toLowerCase() === lowerMethod ||
    doc.name.toLowerCase().endsWith('.' + lowerMethod)
  );
}

/**
 * Extract likely JavaScript methods used in a code snippet
 * @param code The JavaScript code to analyze
 * @returns Array of method names found in the code
 */
export function extractMethodsFromCode(code: string): string[] {
  const methods: string[] = [];
  
  // Common JavaScript built-in methods to check for
  const commonMethods = [
    'map', 'filter', 'reduce', 'forEach', 'find', 'some', 'every',
    'slice', 'splice', 'concat', 'join', 'split', 'replace', 'match',
    'push', 'pop', 'shift', 'unshift', 'sort', 'reverse',
    'parseInt', 'parseFloat', 'toString', 'valueOf',
    'setTimeout', 'setInterval', 'fetch', 'JSON.parse', 'JSON.stringify'
  ];
  
  // Look for method calls in the code
  commonMethods.forEach(method => {
    const methodPattern = new RegExp(`\\.[${method[0]}]${method.slice(1)}\\s*\\(`, 'g');
    if (methodPattern.test(code)) {
      methods.push(method);
    }
  });
  
  // Create an array from methods with duplicate removal
  const uniqueMethods = Array.from(new Set(methods.map(item => item)));
  return uniqueMethods;
}

/**
 * Get documentation resources for methods used in a code snippet
 * @param code The JavaScript code to analyze
 * @returns Array of method documentation objects for methods found in the code
 */
export function getDocsForCode(code: string): MethodDocumentation[] {
  const methods = extractMethodsFromCode(code);
  return methods
    .map(method => getMethodDocumentation(method))
    .filter((doc): doc is MethodDocumentation => doc !== undefined);
}

// Documentation resources database
const documentation: DocumentationResource[] = [
  {
    title: "JavaScript Fundamentals",
    description: "Learn the basics of JavaScript programming language",
    url: "https://javascript.info/first-steps",
    type: "tutorial",
    tags: ["beginner", "basics", "variables", "functions"]
  },
  {
    title: "ES6 Features",
    description: "Overview of the main features introduced in ECMAScript 2015 (ES6)",
    url: "https://www.w3schools.com/js/js_es6.asp",
    type: "reference",
    tags: ["es6", "arrow functions", "let", "const", "classes", "modules"]
  },
  {
    title: "JavaScript Array Methods",
    description: "Comprehensive guide to JavaScript array methods with examples",
    url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array",
    type: "reference",
    tags: ["arrays", "map", "filter", "reduce", "forEach"]
  },
  {
    title: "Promises in JavaScript",
    description: "Understanding promises for asynchronous operations",
    url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises",
    type: "article",
    tags: ["async", "promises", "then", "catch", "asynchronous"]
  },
  {
    title: "Async/Await Tutorial",
    description: "Modern JavaScript async/await pattern explained with examples",
    url: "https://javascript.info/async-await",
    type: "tutorial",
    tags: ["async", "await", "promises", "asynchronous"]
  },
  {
    title: "JavaScript Objects and Classes",
    description: "Learn about object-oriented programming in JavaScript",
    url: "https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Objects",
    type: "tutorial",
    tags: ["objects", "classes", "inheritance", "prototypes", "OOP"]
  },
  {
    title: "JavaScript Event Loop Explained",
    description: "Understanding the event loop and asynchronous behavior",
    url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/EventLoop",
    type: "article",
    tags: ["event loop", "asynchronous", "callbacks", "callstack"]
  },
  {
    title: "JavaScript Regular Expressions",
    description: "Guide to using regular expressions in JavaScript",
    url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions",
    type: "reference",
    tags: ["regex", "regular expressions", "pattern matching", "string manipulation"]
  },
  {
    title: "JavaScript Modules",
    description: "Learn about modern JavaScript module system",
    url: "https://javascript.info/modules-intro",
    type: "tutorial",
    tags: ["modules", "import", "export", "ES modules"]
  },
  {
    title: "Functional Programming in JavaScript",
    description: "Techniques for writing functional code in JavaScript",
    url: "https://www.freecodecamp.org/news/functional-programming-in-javascript/",
    type: "article",
    tags: ["functional", "pure functions", "immutability", "higher-order functions"]
  },
  {
    title: "JavaScript Data Structures",
    description: "Implementation of common data structures in JavaScript",
    url: "https://www.freecodecamp.org/news/data-structures-in-javascript-with-examples/",
    type: "tutorial",
    tags: ["data structures", "arrays", "objects", "maps", "sets", "linked lists"]
  },
  {
    title: "JavaScript Design Patterns",
    description: "Common design patterns implemented in JavaScript",
    url: "https://www.patterns.dev/posts",
    type: "reference",
    tags: ["design patterns", "singleton", "factory", "observer", "module pattern"]
  }
];

// Method documentation database (small subset for demo)
const methodDocs: MethodDocumentation[] = [
  {
    name: "Array.prototype.map",
    description: "Creates a new array with the results of calling a provided function on every element in the calling array.",
    syntax: "array.map(callback(currentValue[, index[, array]]) { /* return element */ }[, thisArg])",
    parameters: [
      {
        name: "callback",
        description: "Function that produces an element of the new Array from an element of the current one.",
        type: "Function",
        optional: false
      },
      {
        name: "thisArg",
        description: "Value to use as 'this' when executing the callback.",
        type: "Object",
        optional: true
      }
    ],
    returnValue: {
      description: "A new array with each element being the result of the callback function.",
      type: "Array"
    },
    examples: [
      "const numbers = [1, 4, 9, 16];\nconst doubledNumbers = numbers.map(x => x * 2);\n// doubledNumbers is now [2, 8, 18, 32]\n// original array is unchanged",
      "const people = [{name: 'John', age: 30}, {name: 'Jane', age: 25}];\nconst names = people.map(person => person.name);\n// names is now ['John', 'Jane']"
    ],
    url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map"
  },
  {
    name: "Array.prototype.filter",
    description: "Creates a new array with all elements that pass the test implemented by the provided function.",
    syntax: "array.filter(callback(element[, index[, array]]) { /* return element */ }[, thisArg])",
    parameters: [
      {
        name: "callback",
        description: "Function to test each element of the array. Return true to keep the element, false otherwise.",
        type: "Function",
        optional: false
      },
      {
        name: "thisArg",
        description: "Value to use as 'this' when executing the callback.",
        type: "Object",
        optional: true
      }
    ],
    returnValue: {
      description: "A new array with the elements that pass the test.",
      type: "Array"
    },
    examples: [
      "const numbers = [1, 2, 3, 4, 5];\nconst evenNumbers = numbers.filter(n => n % 2 === 0);\n// evenNumbers is [2, 4]\n// original array is unchanged",
      "const people = [{name: 'John', age: 30}, {name: 'Jane', age: 25}];\nconst adults = people.filter(person => person.age >= 18);\n// adults includes both people"
    ],
    url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter"
  },
  {
    name: "Array.prototype.reduce",
    description: "Executes a reducer function on each element of the array, resulting in a single output value.",
    syntax: "array.reduce(callback(accumulator, currentValue[, index[, array]]) { /* return result */ }[, initialValue])",
    parameters: [
      {
        name: "callback",
        description: "A function to execute on each element in the array.",
        type: "Function",
        optional: false
      },
      {
        name: "initialValue",
        description: "A value to use as the first argument to the first call of the callback.",
        type: "Any",
        optional: true
      }
    ],
    returnValue: {
      description: "The single value that results from the reduction.",
      type: "Any"
    },
    examples: [
      "const numbers = [1, 2, 3, 4];\nconst sum = numbers.reduce((acc, current) => acc + current, 0);\n// sum is 10",
      "const items = [{price: 10}, {price: 20}, {price: 30}];\nconst totalPrice = items.reduce((acc, item) => acc + item.price, 0);\n// totalPrice is 60"
    ],
    url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce"
  },
  {
    name: "String.prototype.replace",
    description: "Returns a new string with some or all matches of a pattern replaced by a replacement.",
    syntax: "string.replace(regexp|substr, newSubstr|function)",
    parameters: [
      {
        name: "regexp|substr",
        description: "A RegExp object or literal, or a string that will be replaced by newSubstr.",
        type: "RegExp|String",
        optional: false
      },
      {
        name: "newSubstr|function",
        description: "The string that replaces the substring or a function to be invoked to create the new substring.",
        type: "String|Function",
        optional: false
      }
    ],
    returnValue: {
      description: "A new string with some or all matches of a pattern replaced by a replacement.",
      type: "String"
    },
    examples: [
      "const str = 'Hello world';\nconst newStr = str.replace('world', 'JavaScript');\n// newStr is 'Hello JavaScript'",
      "const str = 'The quick brown fox';\nconst newStr = str.replace(/[aeiou]/g, '*');\n// newStr is 'Th* q**ck br*wn f*x'"
    ],
    url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace"
  },
  {
    name: "fetch",
    description: "The Fetch API provides an interface for fetching resources (including across the network).",
    syntax: "fetch(resource[, options])",
    parameters: [
      {
        name: "resource",
        description: "The resource that you wish to fetch, usually a URL string.",
        type: "String|Request",
        optional: false
      },
      {
        name: "options",
        description: "An object containing any custom settings you want to apply to the request.",
        type: "Object",
        optional: true
      }
    ],
    returnValue: {
      description: "A Promise that resolves to a Response object.",
      type: "Promise<Response>"
    },
    examples: [
      "fetch('https://api.example.com/data')\n  .then(response => response.json())\n  .then(data => console.log(data))\n  .catch(error => console.error('Error:', error));",
      "async function fetchData() {\n  try {\n    const response = await fetch('https://api.example.com/data');\n    const data = await response.json();\n    console.log(data);\n  } catch (error) {\n    console.error('Error:', error);\n  }\n}"
    ],
    url: "https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch"
  },
  {
    name: "Promise",
    description: "The Promise object represents the eventual completion (or failure) of an asynchronous operation and its resulting value.",
    syntax: "new Promise((resolve, reject) => { /* executor */ })",
    parameters: [
      {
        name: "executor",
        description: "A function that is passed with the arguments resolve and reject.",
        type: "Function",
        optional: false
      }
    ],
    returnValue: {
      description: "A new Promise object.",
      type: "Promise"
    },
    examples: [
      "const promise = new Promise((resolve, reject) => {\n  setTimeout(() => {\n    resolve('Success!');\n  }, 1000);\n});\n\npromise.then(value => console.log(value));",
      "function fetchData(url) {\n  return new Promise((resolve, reject) => {\n    fetch(url)\n      .then(response => response.json())\n      .then(data => resolve(data))\n      .catch(error => reject(error));\n  });\n}"
    ],
    url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise"
  }
];