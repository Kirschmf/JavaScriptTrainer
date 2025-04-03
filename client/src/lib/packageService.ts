// Package service for handling external npm packages via ESM.sh

export interface PackageInfo {
  name: string;
  version: string;
  description: string;
  importStatement: string;
  cdnUrl: string;
  homepage?: string;
}

export interface ImportedPackage {
  name: string;
  version: string;
  module: any;
}

// Cache imported modules to avoid duplicate fetches
const moduleCache = new Map<string, any>();

/**
 * Import a package dynamically from ESM.sh or other ESM CDNs
 * @param packageName Package name
 * @param version Optional version, defaults to 'latest'
 * @returns The imported module
 */
export async function importPackage(packageName: string, version = 'latest'): Promise<any> {
  try {
    const cacheKey = `${packageName}@${version}`;
    
    // Check if module is already cached
    if (moduleCache.has(cacheKey)) {
      return moduleCache.get(cacheKey);
    }
    
    // Create URL for ESM.sh CDN
    const esmUrl = `https://esm.sh/${packageName}${version !== 'latest' ? `@${version}` : ''}`;
    
    // Dynamically import the module
    const module = await import(/* @vite-ignore */ esmUrl);
    
    // Cache the module
    moduleCache.set(cacheKey, module);
    
    return module;
  } catch (error: any) {
    console.error(`Error importing package "${packageName}@${version}":`, error);
    throw new Error(`Failed to import ${packageName}@${version}: ${error?.message || 'Unknown error'}`);
  }
}

/**
 * Get import statement for a package
 * @param packageName Name of the package
 * @param version Version of the package (optional)
 * @returns Import statement string
 */
export function getImportStatement(packageName: string, version = 'latest'): string {
  const versionString = version !== 'latest' ? `@${version}` : '';
  return `import packageName from 'https://esm.sh/${packageName}${versionString}';`;
}

/**
 * Common npm packages for quick access
 */
export const commonPackages: PackageInfo[] = [
  {
    name: 'lodash',
    version: 'latest',
    description: 'A modern JavaScript utility library delivering modularity, performance & extras.',
    importStatement: "import _ from 'https://esm.sh/lodash';",
    cdnUrl: 'https://esm.sh/lodash',
    homepage: 'https://lodash.com/'
  },
  {
    name: 'axios',
    version: 'latest',
    description: 'Promise based HTTP client for the browser and node.js',
    importStatement: "import axios from 'https://esm.sh/axios';",
    cdnUrl: 'https://esm.sh/axios',
    homepage: 'https://axios-http.com/'
  },
  {
    name: 'date-fns',
    version: 'latest',
    description: 'Modern JavaScript date utility library',
    importStatement: "import { format, addDays } from 'https://esm.sh/date-fns';",
    cdnUrl: 'https://esm.sh/date-fns',
    homepage: 'https://date-fns.org/'
  },
  {
    name: 'uuid',
    version: 'latest',
    description: 'RFC-compliant UUID generator',
    importStatement: "import { v4 as uuidv4 } from 'https://esm.sh/uuid';",
    cdnUrl: 'https://esm.sh/uuid',
    homepage: 'https://github.com/uuidjs/uuid'
  },
  {
    name: 'zod',
    version: 'latest',
    description: 'TypeScript-first schema validation with static type inference',
    importStatement: "import { z } from 'https://esm.sh/zod';", 
    cdnUrl: 'https://esm.sh/zod',
    homepage: 'https://zod.dev/'
  },
  {
    name: 'chart.js',
    version: 'latest',
    description: 'Simple yet flexible JavaScript charting for designers & developers',
    importStatement: "import Chart from 'https://esm.sh/chart.js';",
    cdnUrl: 'https://esm.sh/chart.js',
    homepage: 'https://www.chartjs.org/'
  },
  {
    name: 'marked',
    version: 'latest',
    description: 'A markdown parser and compiler. Built for speed.',
    importStatement: "import { marked } from 'https://esm.sh/marked';",
    cdnUrl: 'https://esm.sh/marked',
    homepage: 'https://marked.js.org/'
  },
  {
    name: 'd3',
    version: 'latest',
    description: 'Data visualization library for web browsers',
    importStatement: "import * as d3 from 'https://esm.sh/d3';",
    cdnUrl: 'https://esm.sh/d3',
    homepage: 'https://d3js.org/'
  }
];

/**
 * Inject imports into code
 * @param code Original code
 * @param packages Array of package names to import
 * @returns Code with import statements at the top
 */
export function injectImports(code: string, packages: string[]): string {
  const importStatements = packages.map(pkg => {
    const packageInfo = commonPackages.find(p => p.name === pkg);
    return packageInfo ? packageInfo.importStatement : getImportStatement(pkg);
  }).join('\n');
  
  return `${importStatements}\n\n${code}`;
}

/**
 * Generate example code snippet for a package
 * @param packageName Package to generate an example for
 * @returns Example code that uses the package
 */
export function getPackageExample(packageName: string): string {
  switch (packageName) {
    case 'lodash':
      return `import _ from 'https://esm.sh/lodash';\n\n// Using lodash to filter and manipulate arrays\nconst array = [1, 2, 3, 4, 5];\nconst evens = _.filter(array, num => num % 2 === 0);\nconsole.log('Even numbers:', evens);\n\nconst doubled = _.map(array, num => num * 2);\nconsole.log('Doubled values:', doubled);\n\nconst sum = _.reduce(array, (total, num) => total + num, 0);\nconsole.log('Sum:', sum);`;
    
    case 'axios':
      return `import axios from 'https://esm.sh/axios';\n\n// Make a request to JSONPlaceholder API\nasync function fetchTodos() {\n  try {\n    const response = await axios.get('https://jsonplaceholder.typicode.com/todos/1');\n    console.log('Todo item:', response.data);\n    return response.data;\n  } catch (error) {\n    console.error('Error fetching data:', error);\n  }\n}\n\nfetchTodos();`;
    
    case 'date-fns':
      return `import { format, addDays, differenceInDays } from 'https://esm.sh/date-fns';\n\n// Working with dates\nconst now = new Date();\n\n// Format the current date\nconsole.log('Formatted date:', format(now, 'MMMM dd, yyyy'));\n\n// Add 5 days to the current date\nconst futureDate = addDays(now, 5);\nconsole.log('Date in 5 days:', format(futureDate, 'MMMM dd, yyyy'));\n\n// Calculate difference between dates\nconst days = differenceInDays(futureDate, now);\nconsole.log('Difference in days:', days);`;
    
    case 'uuid':
      return `import { v4 as uuidv4 } from 'https://esm.sh/uuid';\n\n// Generate random UUIDs\nconst id1 = uuidv4();\nconst id2 = uuidv4();\n\nconsole.log('UUID 1:', id1);\nconsole.log('UUID 2:', id2);\nconsole.log('UUIDs are different:', id1 !== id2);`;
    
    case 'zod':
      return `import { z } from 'https://esm.sh/zod';\n\n// Define a schema for a person\nconst PersonSchema = z.object({\n  name: z.string().min(2),\n  age: z.number().int().positive(),\n  email: z.string().email(),\n  isActive: z.boolean().default(true)\n});\n\n// Type is inferred from the schema\ntype Person = z.infer<typeof PersonSchema>;\n\n// Create and validate a person object\ntry {\n  const person = PersonSchema.parse({\n    name: 'John Doe',\n    age: 30,\n    email: 'john@example.com'\n  });\n  console.log('Valid person:', person);\n} catch (error) {\n  console.error('Validation error:', error);\n}\n\n// This will throw an error\ntry {\n  const invalidPerson = PersonSchema.parse({\n    name: 'J', // Too short\n    age: -5, // Negative number\n    email: 'not-an-email'\n  });\n} catch (error) {\n  console.error('Invalid person errors:', error.errors);\n}`;
    
    case 'chart.js':
      return `import Chart from 'https://esm.sh/chart.js';\n\n// Chart.js needs a canvas element\n// This code would work in a browser where you have a canvas with id='myChart'\n// For demonstration purposes only\n\n// Sample data for a chart\nconst data = {\n  labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],\n  datasets: [{\n    label: '# of Votes',\n    data: [12, 19, 3, 5, 2, 3],\n    backgroundColor: [\n      'rgba(255, 99, 132, 0.2)',\n      'rgba(54, 162, 235, 0.2)',\n      'rgba(255, 206, 86, 0.2)',\n      'rgba(75, 192, 192, 0.2)',\n      'rgba(153, 102, 255, 0.2)',\n      'rgba(255, 159, 64, 0.2)'\n    ],\n    borderWidth: 1\n  }]\n};\n\n// Chart configuration\nconst config = {\n  type: 'bar',\n  data: data,\n  options: {\n    scales: {\n      y: {\n        beginAtZero: true\n      }\n    }\n  }\n};\n\n// In a browser, you would create the chart like this:\n// const myChart = new Chart(document.getElementById('myChart'), config);\n\nconsole.log('Chart configuration prepared:', config);\n`;
    
    case 'marked':
      return `import { marked } from 'https://esm.sh/marked';\n\n// Convert markdown to HTML\nconst markdown = '# Hello World\\n\\nThis is **bold** and this is *italic*.\\n\\n- List item 1\\n- List item 2\\n\\n[Link to Google](https://google.com)';\n\nconst html = marked.parse(markdown);\n\nconsole.log('Original Markdown:');\nconsole.log(markdown);\n\nconsole.log('\\nConverted HTML:');\nconsole.log(html);`;
    
    case 'd3':
      return `import * as d3 from 'https://esm.sh/d3';\n\n// D3.js examples typically manipulate the DOM\n// This is a simple data manipulation example with D3\n\n// Sample dataset\nconst dataset = [\n  { name: 'Alice', score: 96 },\n  { name: 'Bob', score: 78 },\n  { name: 'Carol', score: 85 },\n  { name: 'Dave', score: 90 },\n  { name: 'Eve', score: 92 }\n];\n\n// Use D3 to process the data\nconst maxScore = d3.max(dataset, d => d.score);\nconst minScore = d3.min(dataset, d => d.score);\nconst avgScore = d3.mean(dataset, d => d.score);\nconst medianScore = d3.median(dataset, d => d.score);\n\n// Create a scale function\nconst scale = d3.scaleLinear()\n  .domain([minScore, maxScore])\n  .range([0, 100]);\n\n// Map scores to percentages\nconst scaledScores = dataset.map(d => ({\n  name: d.name,\n  originalScore: d.score,\n  scaledScore: Math.round(scale(d.score))\n}));\n\nconsole.log('Dataset statistics:');\nconsole.log('Max score:', maxScore);\nconsole.log('Min score:', minScore);\nconsole.log('Average score:', avgScore);\nconsole.log('Median score:', medianScore);\nconsole.log('\\nScaled scores:');\nconsole.log(scaledScores);`;
      
    default:
      return `// No example available for ${packageName}\n// Here's how to import it:\n// import packageName from 'https://esm.sh/${packageName}';\n\nconsole.log('Try using the ${packageName} package here!');`;
  }
}