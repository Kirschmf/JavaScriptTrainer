import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import CodeEditor from "@/components/CodeEditor";
import OutputPane from "@/components/OutputPane";
import DocPanel from "@/components/DocPanel";
import PackageExplorer from "@/components/PackageExplorer";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Snippet } from "@shared/schema";
import { lintCode, formatCode as prettierFormatCode } from "@/lib/lintingService";

export default function Home() {
  const [code, setCode] = useLocalStorage("jsrunner-code", "// Welcome to JSRunner\n// Type your JavaScript code here and press Run\n\nfunction greet(name) {\n  return `Hello, ${name}!`;\n}\n\nconst message = greet('World');\nconsole.log(message);");
  const [currentSnippet, setCurrentSnippet] = useState<Snippet | null>(null);
  const [consoleOutput, setConsoleOutput] = useState<any[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'console' | 'docs' | 'packages'>('console');
  const { toast } = useToast();

  const runCode = async () => {
    setIsExecuting(true);
    setConsoleOutput([
      { type: "info", content: "// Code execution started" }
    ]);
    
    try {
      const response = await apiRequest("POST", "/api/execute", {
        code,
        snippetId: currentSnippet?.id
      });
      
      const result = await response.json();
      
      const newOutput = [
        { type: "info", content: "// Code execution started" }
      ];
      
      // Add logs
      result.logs.forEach((log: string) => {
        newOutput.push({ type: "log", content: log });
      });
      
      // Add warnings
      result.warnings.forEach((warning: string) => {
        newOutput.push({ type: "warn", content: warning });
      });
      
      // Add errors
      result.errors.forEach((error: string) => {
        newOutput.push({ type: "error", content: error });
      });
      
      // Add error if there was one
      if (result.error) {
        newOutput.push({
          type: "error",
          content: `${result.error.name}: ${result.error.message}`
        });
      }
      
      // Add execution time
      newOutput.push({
        type: "info",
        content: `// Execution completed (${result.executionTime}ms)`
      });
      
      setConsoleOutput(newOutput);
    } catch (error) {
      setConsoleOutput([
        { type: "info", content: "// Code execution started" },
        { type: "error", content: "Failed to execute code. Server error." },
        { type: "info", content: "// Execution failed" }
      ]);
      
      toast({
        title: "Execution Error",
        description: "Failed to execute the code. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const saveSnippet = async () => {
    if (!code.trim()) {
      toast({
        title: "Cannot save empty snippet",
        description: "Please add some code first.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const title = prompt("Enter a title for your snippet:", currentSnippet?.title || "Untitled Snippet");
      
      if (!title) return; // User cancelled
      
      if (currentSnippet && currentSnippet.id) {
        // Update existing snippet
        await apiRequest("PUT", `/api/snippets/${currentSnippet.id}`, {
          title,
          code
        });
        
        setCurrentSnippet({
          ...currentSnippet,
          title,
          code
        });
        
        toast({
          title: "Snippet updated",
          description: `'${title}' has been updated.`
        });
      } else {
        // Create new snippet
        const response = await apiRequest("POST", "/api/snippets", {
          title,
          code,
          description: ""
        });
        
        const newSnippet = await response.json();
        setCurrentSnippet(newSnippet);
        
        toast({
          title: "Snippet saved",
          description: `'${title}' has been saved.`
        });
      }
    } catch (error) {
      toast({
        title: "Failed to save",
        description: "There was an error saving your snippet.",
        variant: "destructive"
      });
    }
  };

  const createNewSnippet = () => {
    setCurrentSnippet(null);
    setCode("// New snippet\n\n");
    setConsoleOutput([]);
  };

  const loadSnippet = (snippet: Snippet) => {
    setCurrentSnippet(snippet);
    setCode(snippet.code);
    
    // Close mobile menu when a snippet is selected
    setIsMobileMenuOpen(false);
  };

  const formatCode = async () => {
    try {
      setIsExecuting(true); // Show loading
      // Use prettier-based formatter from our linting service
      const formatted = await prettierFormatCode(code);
      setCode(formatted);
      
      toast({
        title: "Code formatted",
        description: "Your code has been formatted with Prettier"
      });
    } catch (error) {
      console.error("Formatting error:", error);
      toast({
        title: "Format failed",
        description: "Could not format the code. Check console for details.",
        variant: "destructive"
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const clearCode = () => {
    if (confirm("Are you sure you want to clear the editor?")) {
      setCode("");
      setConsoleOutput([]);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header 
        onSave={saveSnippet} 
        onRun={runCode}
        toggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMobileMenuOpen={isMobileMenuOpen}
      />
      
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        <div className="flex-shrink-0 md:w-72">
          <Sidebar 
            onSelectExample={loadSnippet}
            onNewScript={createNewSnippet}
            currentSnippetId={currentSnippet?.id}
            isOpen={isMobileMenuOpen}
          />
        </div>
        
        <div className="w-[8px] bg-border hover:bg-primary/20 transition-colors cursor-col-resize 
          hidden md:block resize-x"
          onMouseDown={(e) => {
            const resizeHandle = e.currentTarget;
            const sidebarWrapper = resizeHandle.previousSibling as HTMLElement;
            const mainContentWrapper = resizeHandle.nextSibling as HTMLElement;
            
            // Initial sizes
            const initialX = e.clientX;
            const initialSidebarWidth = sidebarWrapper.getBoundingClientRect().width;
            
            const onMouseMove = (e: MouseEvent) => {
              const deltaX = e.clientX - initialX;
              
              // Calculate new width
              const newSidebarWidth = initialSidebarWidth + deltaX;
              
              // Minimum size constraint
              const minWidth = 200;
              const maxWidth = 500;
              if (newSidebarWidth > minWidth && newSidebarWidth < maxWidth) {
                sidebarWrapper.style.width = `${newSidebarWidth}px`;
              }
            };
            
            const onMouseUp = () => {
              document.removeEventListener('mousemove', onMouseMove);
              document.removeEventListener('mouseup', onMouseUp);
            };
            
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
          }}
        />
        
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          <div className="flex-1 flex flex-col overflow-hidden">
            <CodeEditor 
              code={code} 
              setCode={setCode} 
              onRun={runCode} 
              onFormat={formatCode} 
              onClear={clearCode}
              isExecuting={isExecuting}
            />
          </div>
          
          <div className="w-[8px] bg-border hover:bg-primary/20 transition-colors cursor-col-resize 
            hidden md:block resize-x"
            onMouseDown={(e) => {
              const resizeHandle = e.currentTarget;
              const codeEditorWrapper = resizeHandle.previousSibling as HTMLElement;
              const outputWrapper = resizeHandle.nextSibling as HTMLElement;
              
              // Initial sizes
              const initialX = e.clientX;
              const initialEditorWidth = codeEditorWrapper.getBoundingClientRect().width;
              const initialOutputWidth = outputWrapper.getBoundingClientRect().width;
              
              const onMouseMove = (e: MouseEvent) => {
                const deltaX = e.clientX - initialX;
                
                // Calculate new widths
                const newEditorWidth = initialEditorWidth + deltaX;
                const newOutputWidth = initialOutputWidth - deltaX;
                
                // Minimum size constraints
                const minWidth = 200;
                if (newEditorWidth > minWidth && newOutputWidth > minWidth) {
                  codeEditorWrapper.style.flexBasis = `${newEditorWidth}px`;
                  outputWrapper.style.flexBasis = `${newOutputWidth}px`;
                }
              };
              
              const onMouseUp = () => {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
              };
              
              document.addEventListener('mousemove', onMouseMove);
              document.addEventListener('mouseup', onMouseUp);
            }}
          />
          
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex border-b border-border">
              <button
                className={`py-2 px-4 font-medium text-sm ${activeTab === 'console' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
                onClick={() => setActiveTab('console')}
              >
                Console
              </button>
              <button
                className={`py-2 px-4 font-medium text-sm ${activeTab === 'docs' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
                onClick={() => setActiveTab('docs')}
              >
                Documentation
              </button>
              <button
                className={`py-2 px-4 font-medium text-sm ${activeTab === 'packages' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
                onClick={() => setActiveTab('packages')}
              >
                Packages
              </button>
            </div>
            
            {activeTab === 'console' && (
              <OutputPane outputs={consoleOutput} />
            )}
            
            {activeTab === 'docs' && (
              <DocPanel code={code} visible={true} />
            )}
            
            {activeTab === 'packages' && (
              <PackageExplorer 
                visible={true} 
                onSelectExample={(exampleCode) => {
                  setCode(exampleCode);
                  toast({
                    title: "Package example loaded",
                    description: "Example code has been inserted into the editor"
                  });
                }} 
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
