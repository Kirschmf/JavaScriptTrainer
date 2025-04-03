import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertSnippetSchema, insertConsoleEntrySchema } from "@shared/schema";
import vm from "vm2";

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
    const { code, snippetId } = req.body;
    
    if (typeof code !== "string") {
      return res.status(400).json({ message: "Code must be a string" });
    }

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

  // Mount the API router
  app.use("/api", apiRouter);

  return httpServer;
}
