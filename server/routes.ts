import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertSnippetSchema, insertConsoleEntrySchema } from "@shared/schema";
import vm from "vm2";
import OpenAI from "openai";

// Initialize OpenAI API client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Function to get AI code completion
async function getAICompletion(codeContext: string, language: string): Promise<string> {
  try {
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an AI assistant providing intelligent code completions for ${language}. 
          Provide only the code completion without any explanation or markdown formatting.
          The completion should be a natural continuation of the provided code.
          Analyze the code structure, variables, and functions to provide contextually appropriate completions.
          Complete functions, methods, or code blocks that appear to be unfinished.
          Use best practices and modern syntax for ${language}.`
        },
        {
          role: "user",
          content: `Complete this ${language} code. Be concise but helpful, and continue the logical flow of the code:\n\n${codeContext}`
        }
      ],
      max_tokens: 250,
      temperature: 0.3, // Lower temperature for more focused completions
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0
    });

    return response.choices[0]?.message?.content?.trim() || "";
  } catch (error) {
    console.error("OpenAI API error:", error);
    return "";
  }
}

/**
 * Explain code using OpenAI
 * @param code The code to explain
 * @returns A detailed explanation of the code
 */
async function explainCode(code: string): Promise<string> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return 'OpenAI API key not found. Add an API key to use the explanation feature.';
    }

    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a JavaScript expert who explains code clearly and concisely."
        },
        {
          role: "user",
          content: `Explain the following JavaScript code in detail. Focus on what it does, how it works, and any notable patterns or techniques used:\n\n${code}`
        }
      ],
      temperature: 0.5,
      max_tokens: 1000,
    });

    return response.choices[0]?.message?.content?.trim() || 'No explanation generated.';
  } catch (error: any) {
    console.error('Error explaining code:', error?.message || error);
    return `Error explaining code: ${error?.message || 'Unknown error'}`;
  }
}

/**
 * Improve or refactor code using OpenAI
 * @param code The code to improve
 * @param instructions Specific instructions for improvement
 * @returns Improved code and explanation
 */
async function improveCode(code: string, instructions: string): Promise<{ improvedCode: string; explanation: string }> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return {
        improvedCode: code,
        explanation: 'OpenAI API key not found. Add an API key to use the code improvement feature.'
      };
    }

    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a JavaScript expert who improves code to be more efficient, readable, and follow best practices. Respond in JSON format with 'improvedCode' and 'explanation' keys."
        },
        {
          role: "user",
          content: `Improve the following JavaScript code. ${instructions}:\n\n${code}\n\nRespond with the improved code and an explanation of your changes in JSON format.`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.5,
      max_tokens: 2000,
    });

    const result = JSON.parse(response.choices[0]?.message?.content || '{}');
    
    return {
      improvedCode: result.improvedCode || code,
      explanation: result.explanation || 'No explanation provided.'
    };
  } catch (error: any) {
    console.error('Error improving code:', error?.message || error);
    return {
      improvedCode: code,
      explanation: `Error improving code: ${error?.message || 'Unknown error'}`
    };
  }
}

/**
 * Debug code using OpenAI
 * @param code The code with issues
 * @param error The error message if available
 * @returns Fixed code and explanation
 */
async function debugCode(code: string, error?: string): Promise<{ fixedCode: string; explanation: string }> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return {
        fixedCode: code,
        explanation: 'OpenAI API key not found. Add an API key to use the debugging feature.'
      };
    }

    const errorContext = error ? `The code produced the following error: ${error}` : 'The code has issues that need to be fixed.';

    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a JavaScript debugging expert. Fix the provided code and explain what was wrong. Respond in JSON format with 'fixedCode' and 'explanation' keys."
        },
        {
          role: "user",
          content: `Debug this JavaScript code. ${errorContext}\n\n${code}\n\nRespond with the fixed code and an explanation in JSON format.`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 2000,
    });

    const result = JSON.parse(response.choices[0]?.message?.content || '{}');
    
    return {
      fixedCode: result.fixedCode || code,
      explanation: result.explanation || 'No explanation provided.'
    };
  } catch (error: any) {
    console.error('Error debugging code:', error?.message || error);
    return {
      fixedCode: code,
      explanation: `Error debugging code: ${error?.message || 'Unknown error'}`
    };
  }
}

/**
 * Generate code example based on description
 * @param description Description of what the code should do
 * @param language Programming language
 * @returns Generated code example
 */
async function generateCodeExample(description: string, language: string): Promise<string> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return '// OpenAI API key not found. Add an API key to use the code generation feature.';
    }

    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert ${language} developer who writes clean, efficient, and well-commented code examples.`
        },
        {
          role: "user",
          content: `Write a ${language} code example that does the following: ${description}`
        }
      ],
      temperature: 0.5,
      max_tokens: 1500,
    });

    return response.choices[0]?.message?.content?.trim() || '// No code generated.';
  } catch (error: any) {
    console.error('Error generating code example:', error?.message || error);
    return `// Error generating code example\n// ${error?.message || 'Unknown error'}`;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // API routes
  const apiRouter = express.Router();
  
  // Get all snippets
  apiRouter.get("/snippets", async (req, res) => {
    const snippets = await storage.getSnippets();
    res.json(snippets);
  });

  // Get all example snippets
  apiRouter.get("/examples", async (req, res) => {
    const examples = await storage.getExamples();
    res.json(examples);
  });

  // Get a single snippet
  apiRouter.get("/snippets/:id", async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid snippet ID" });
    }

    const snippet = await storage.getSnippet(id);
    if (!snippet) {
      return res.status(404).json({ message: "Snippet not found" });
    }

    res.json(snippet);
  });

  // Create a new snippet
  apiRouter.post("/snippets", async (req, res) => {
    try {
      const snippetData = insertSnippetSchema.parse(req.body);
      const newSnippet = await storage.createSnippet(snippetData);
      res.status(201).json(newSnippet);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid snippet data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create snippet" });
    }
  });

  // Update a snippet
  apiRouter.put("/snippets/:id", async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid snippet ID" });
    }

    try {
      // Allow partial updates
      const snippetData = insertSnippetSchema.partial().parse(req.body);
      const updatedSnippet = await storage.updateSnippet(id, snippetData);
      
      if (!updatedSnippet) {
        return res.status(404).json({ message: "Snippet not found" });
      }

      res.json(updatedSnippet);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid snippet data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update snippet" });
    }
  });

  // Delete a snippet
  apiRouter.delete("/snippets/:id", async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid snippet ID" });
    }

    const success = await storage.deleteSnippet(id);
    if (!success) {
      return res.status(404).json({ message: "Snippet not found" });
    }

    res.status(204).end();
  });

  // Get console entries for a snippet
  apiRouter.get("/snippets/:id/console", async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid snippet ID" });
    }

    const entries = await storage.getConsoleEntries(id);
    res.json(entries);
  });

  // Clear console entries for a snippet
  apiRouter.delete("/snippets/:id/console", async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid snippet ID" });
    }

    await storage.clearConsoleEntries(id);
    res.status(204).end();
  });

  // Execute code
  apiRouter.post("/execute", async (req, res) => {
    let { code, snippetId } = req.body;
    
    if (typeof code !== "string") {
      return res.status(400).json({ message: "Code must be a string" });
    }

    // Process the code to ensure it works with or without semicolons
    // Add semicolons to the end of lines that don't have them
    // This helps prevent issues with automatic semicolon insertion (ASI)
    code = code.split('\n')
      .map(line => {
        // Skip lines that are empty, comments only, or already end with a semicolon
        line = line.trim();
        if (!line || line.startsWith('//') || line.startsWith('/*') || line.endsWith('*/') || 
            line.endsWith(';') || line.endsWith('{') || line.endsWith('}') || 
            line.endsWith(':') || line.endsWith(',')) {
          return line;
        }
        return line + ';';
      })
      .join('\n');

    // Clear previous console entries if snippetId is provided
    if (snippetId) {
      await storage.clearConsoleEntries(snippetId);
    }

    const logs: any[] = [];
    const errors: any[] = [];
    const warnings: any[] = [];
    const infos: any[] = [];

    // Create sandbox with mocked console methods
    const sandbox = {
      console: {
        log: (...args: any[]) => {
          const content = args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
          ).join(' ');
          logs.push(content);
          
          if (snippetId) {
            storage.createConsoleEntry({
              snippetId,
              type: 'log',
              content
            });
          }
        },
        error: (...args: any[]) => {
          const content = args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
          ).join(' ');
          errors.push(content);
          
          if (snippetId) {
            storage.createConsoleEntry({
              snippetId,
              type: 'error',
              content
            });
          }
        },
        warn: (...args: any[]) => {
          const content = args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
          ).join(' ');
          warnings.push(content);
          
          if (snippetId) {
            storage.createConsoleEntry({
              snippetId,
              type: 'warn',
              content
            });
          }
        },
        info: (...args: any[]) => {
          const content = args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
          ).join(' ');
          infos.push(content);
          
          if (snippetId) {
            storage.createConsoleEntry({
              snippetId,
              type: 'info',
              content
            });
          }
        },
        table: (data: any) => {
          const content = JSON.stringify(data, null, 2);
          logs.push(`Table: ${content}`);
          
          if (snippetId) {
            storage.createConsoleEntry({
              snippetId,
              type: 'log',
              content: `Table: ${content}`
            });
          }
        }
      },
      setTimeout: (fn: Function, delay: number) => {
        if (delay > 5000) delay = 5000; // Limit timeouts to 5 seconds
        setTimeout(() => {
          try {
            fn();
          } catch (error: any) {
            const errorMsg = error.toString();
            errors.push(errorMsg);
            
            if (snippetId) {
              storage.createConsoleEntry({
                snippetId,
                type: 'error',
                content: errorMsg
              });
            }
          }
        }, delay);
      },
      fetch: (url: string, options?: any) => global.fetch(url, options)
    };

    const startTime = Date.now();
    let result: any;
    let error: any = null;

    try {
      // Use VM2 to execute code in a sandboxed environment
      const vm2 = new vm.VM({ 
        timeout: 5000, // 5 second timeout
        sandbox
      });
      
      // Execute the code
      result = await vm2.run(code);
      
      // Record execution info
      if (snippetId) {
        storage.createConsoleEntry({
          snippetId,
          type: 'info',
          content: `// Code execution completed in ${Date.now() - startTime}ms`
        });
      }
      
    } catch (err: any) {
      error = {
        name: err.name || 'Error',
        message: err.message || 'Unknown error',
        stack: err.stack
      };
      
      // Record error
      if (snippetId) {
        storage.createConsoleEntry({
          snippetId,
          type: 'error',
          content: `${err.name}: ${err.message}`
        });
      }
    }

    // Return all the console outputs and the result/error
    res.json({
      result: result !== undefined ? result : null,
      logs,
      errors,
      warnings,
      infos,
      error,
      executionTime: Date.now() - startTime
    });
  });

  // AI code completion endpoint
  apiRouter.post("/ai/complete", async (req, res) => {
    try {
      const { code, position, language = "javascript" } = req.body;
      
      if (!code || position === undefined) {
        return res.status(400).json({ message: "Code and cursor position are required" });
      }

      // Get the code before the cursor to provide context
      const codeBeforeCursor = code.substring(0, position);
      
      // Call OpenAI for code completion
      const completion = await getAICompletion(codeBeforeCursor, language);
      
      res.json({ completion });
    } catch (error) {
      console.error("Error getting AI completion:", error);
      res.status(500).json({ message: "Failed to get AI completion" });
    }
  });
  
  // Endpoint for explaining code
  apiRouter.post("/ai/explain", async (req, res) => {
    try {
      const { code } = req.body;
      
      if (!code) {
        return res.status(400).json({ message: "Code is required" });
      }
      
      const explanation = await explainCode(code);
      res.json({ explanation });
    } catch (error) {
      console.error("Error explaining code:", error);
      res.status(500).json({ message: "Failed to explain code" });
    }
  });
  
  // Endpoint for improving/refactoring code
  apiRouter.post("/ai/improve", async (req, res) => {
    try {
      const { code, instructions } = req.body;
      
      if (!code) {
        return res.status(400).json({ message: "Code is required" });
      }
      
      const result = await improveCode(code, instructions || "Make this code more efficient and follow best practices");
      res.json(result);
    } catch (error) {
      console.error("Error improving code:", error);
      res.status(500).json({ message: "Failed to improve code" });
    }
  });
  
  // Endpoint for debugging code
  apiRouter.post("/ai/debug", async (req, res) => {
    try {
      const { code, error: errorMessage } = req.body;
      
      if (!code) {
        return res.status(400).json({ message: "Code is required" });
      }
      
      const result = await debugCode(code, errorMessage);
      res.json(result);
    } catch (error) {
      console.error("Error debugging code:", error);
      res.status(500).json({ message: "Failed to debug code" });
    }
  });
  
  // Endpoint for generating code examples
  apiRouter.post("/ai/generate", async (req, res) => {
    try {
      const { description, language = "javascript" } = req.body;
      
      if (!description) {
        return res.status(400).json({ message: "Description is required" });
      }
      
      const code = await generateCodeExample(description, language);
      res.json({ code });
    } catch (error) {
      console.error("Error generating code example:", error);
      res.status(500).json({ message: "Failed to generate code example" });
    }
  });

  // Mount the API router
  app.use("/api", apiRouter);

  return httpServer;
}
