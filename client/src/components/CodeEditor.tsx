import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Play, 
  AlignLeft, 
  Trash2, 
  Loader2, 
  FileCode,
  Copy,
  Download,
  Settings,
  Footprints,
  StepForward,
  RefreshCw,
  SkipForward,
  SkipBack,
  Bug
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Editor } from "@monaco-editor/react";
import { useTheme } from "@/components/ThemeProvider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { apiRequest } from "@/lib/queryClient";

interface CodeEditorProps {
  code: string;
  setCode: (code: string) => void;
  onRun: () => void;
  onFormat: () => void;
  onClear: () => void;
  isExecuting: boolean;
  isSimple?: boolean;
}

export default function CodeEditor({ 
  code, 
  setCode, 
  onRun, 
  onFormat, 
  onClear,
  isExecuting,
  isSimple = false
}: CodeEditorProps) {
  const editorRef = useRef<any>(null);
  const { toast } = useToast();
  const { currentTheme } = useTheme();
  // Set editor theme based on our theme configuration
  const [editorTheme, setEditorTheme] = useState(currentTheme.editorTheme);
  const [fontSize, setFontSize] = useState(14);
  const [autoRunEnabled, setAutoRunEnabled] = useState(true);
  
  // Visual execution state
  const [isVisualExecutionMode, setIsVisualExecutionMode] = useState(false);
  const [executionSteps, setExecutionSteps] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoadingSteps, setIsLoadingSteps] = useState(false);
  
  // Store monaco instance for later use
  const monacoRef = useRef<any>(null);
  
  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    
    // Add keyboard shortcut for running code (Ctrl+Enter or Cmd+Enter)
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      onRun();
    });
  };
  
  // Add auto-run debounce timer
  const autoRunTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Update editor theme when app theme changes
  useEffect(() => {
    setEditorTheme(currentTheme.editorTheme);
  }, [currentTheme]);
  
  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCode(value);
      
      // Auto-run the code after a short delay (debounce), but only if autoRunEnabled is true
      if (autoRunEnabled) {
        if (autoRunTimerRef.current) {
          clearTimeout(autoRunTimerRef.current);
        }
        
        autoRunTimerRef.current = setTimeout(() => {
          onRun();
        }, 1000); // Wait 1 second after typing stops before running
      }
    }
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Code copied!",
      description: "Code has been copied to clipboard",
      duration: 2000
    });
  };
  
  const downloadCode = () => {
    const blob = new Blob([code], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'jsrunner-code.js';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Code downloaded",
      description: "Your JavaScript code has been downloaded",
      duration: 2000
    });
  };
  
  // Start visual execution mode
  const startVisualExecution = async () => {
    try {
      setIsVisualExecutionMode(true);
      setIsLoadingSteps(true);
      setExecutionSteps([]);
      setCurrentStep(0);
      
      // Request the execution steps from the server
      const response = await apiRequest("POST", "/api/execute-visual", {
        code
      });
      
      const result = await response.json();
      if (result.steps && result.steps.length > 0) {
        setExecutionSteps(result.steps);
        // Highlight first step
        highlightStep(result.steps[0], 0);
        
        toast({
          title: "Visual execution ready",
          description: `${result.steps.length} steps prepared. Use the controls to walk through execution.`,
          duration: 3000
        });
      } else {
        toast({
          title: "No steps to display",
          description: "The code execution did not generate any visual steps.",
          variant: "destructive"
        });
        setIsVisualExecutionMode(false);
      }
    } catch (error) {
      toast({
        title: "Visual execution error",
        description: "Failed to prepare visual execution steps.",
        variant: "destructive"
      });
      setIsVisualExecutionMode(false);
    } finally {
      setIsLoadingSteps(false);
    }
  };
  
  // Stop visual execution mode
  const stopVisualExecution = () => {
    setIsVisualExecutionMode(false);
    setExecutionSteps([]);
    setCurrentStep(0);
    
    // Clear any decorations
    if (editorRef.current && monacoRef.current) {
      editorRef.current.deltaDecorations([], []);
    }
  };
  
  // Move to next step in visual execution
  const nextStep = () => {
    if (currentStep < executionSteps.length - 1) {
      const nextStepIndex = currentStep + 1;
      setCurrentStep(nextStepIndex);
      highlightStep(executionSteps[nextStepIndex], nextStepIndex);
    } else {
      toast({
        title: "End of execution",
        description: "You've reached the end of the code execution."
      });
    }
  };
  
  // Move to previous step in visual execution
  const prevStep = () => {
    if (currentStep > 0) {
      const prevStepIndex = currentStep - 1;
      setCurrentStep(prevStepIndex);
      highlightStep(executionSteps[prevStepIndex], prevStepIndex);
    }
  };
  
  // Highlight the current step in the editor
  const highlightStep = (step: any, stepIndex: number) => {
    if (!editorRef.current || !monacoRef.current) return;
    
    // Clear existing decorations
    editorRef.current.deltaDecorations([], []);
    
    // Add decoration for current line
    if (step.lineNumber && step.lineNumber > 0) {
      const lineNumber = step.lineNumber;
      const decorations = [{
        range: new monacoRef.current.Range(lineNumber, 1, lineNumber, 1),
        options: {
          isWholeLine: true,
          className: 'visual-execution-highlight',
          glyphMarginClassName: 'visual-execution-glyph',
          stickiness: monacoRef.current.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges
        }
      }];
      
      editorRef.current.deltaDecorations([], decorations);
      
      // Reveal the highlighted line
      editorRef.current.revealLineInCenter(lineNumber);
    }
  };
  
  return (
    <div className="flex-1 flex flex-col h-full border-r border-border">
      <div className="bg-card p-2 flex justify-between items-center border-b border-border">
        <div className="flex items-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="default"
                  size="sm"
                  className="flex items-center bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700"
                  onClick={onRun}
                  disabled={isExecuting}
                >
                  {isExecuting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="mr-2 h-4 w-4" />
                  )}
                  <span>Run</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Execute code (Ctrl+Enter)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <div className="ml-2 text-muted-foreground text-sm hidden md:flex items-center">
            <FileCode className="h-4 w-4 mr-1 text-primary" />
            <span>JavaScript</span>
          </div>
        </div>
        
        <div className="flex space-x-1">
          {!isSimple && !isVisualExecutionMode && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1 text-xs"
                    onClick={startVisualExecution}
                    disabled={isLoadingSteps || isExecuting}
                  >
                    {isLoadingSteps ? (
                      <RefreshCw className="h-3 w-3 animate-spin" />
                    ) : (
                      <Footprints className="h-3 w-3" />
                    )}
                    <span>Visual Execution</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Step through code execution</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          {isVisualExecutionMode && (
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={prevStep}
                disabled={currentStep === 0}
                className="h-8 w-8"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-skip-back">
                  <polygon points="19 20 9 12 19 4 19 20" />
                  <line x1="5" x2="5" y1="19" y2="5" />
                </svg>
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={nextStep}
                disabled={currentStep === executionSteps.length - 1}
                className="h-8 w-8"
              >
                <StepForward className="h-4 w-4" />
              </Button>
              <span className="text-xs text-muted-foreground mx-1">
                Step {currentStep + 1}/{executionSteps.length}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={stopVisualExecution}
                className="h-8 w-8"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x">
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </Button>
            </div>
          )}
          
          {!isVisualExecutionMode && (
            <>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={copyToClipboard}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Copy code</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              {!isSimple && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={downloadCode}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Download as .js file</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={onFormat}
                    >
                      <AlignLeft className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Format code</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              {!isSimple && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClear}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Clear editor</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              
              {!isSimple && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Editor Settings</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setFontSize(12)}>
                      Small Font
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFontSize(14)}>
                      Medium Font
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFontSize(16)}>
                      Large Font
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => setAutoRunEnabled(!autoRunEnabled)}
                      className="flex items-center justify-between"
                    >
                      Auto-Run Code
                      <span className={autoRunEnabled ? "text-green-500" : "text-red-500"}>
                        {autoRunEnabled ? "Enabled" : "Disabled"}
                      </span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </>
          )}
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden relative">
        <Editor
          height="100%"
          defaultLanguage="javascript"
          value={code}
          onChange={handleEditorChange}
          theme={editorTheme}
          options={{
            minimap: { enabled: false },
            fontSize: fontSize,
            fontFamily: "'Fira Code', monospace",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            lineNumbers: "on",
            lineNumbersMinChars: 1, // Minimum possible width for line numbers
            folding: true,
            wordWrap: "on",
            tabSize: 2,
            cursorBlinking: "smooth",
            contextmenu: true,
            smoothScrolling: true,
            cursorSmoothCaretAnimation: "on",
          }}
          onMount={handleEditorDidMount}
        />
        
        {isVisualExecutionMode && currentStep < executionSteps.length && (
          <div className="execution-step-panel">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-sm">
                Step {currentStep + 1}: {executionSteps[currentStep].description || 'Executing Code'}
              </h3>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6" 
                onClick={stopVisualExecution}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x">
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </Button>
            </div>
            
            {executionSteps[currentStep].variables && (
              <div className="mt-2">
                <h4 className="text-xs font-semibold text-muted-foreground mb-1">Variables:</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {Object.entries(executionSteps[currentStep].variables || {}).map(([name, value]) => (
                    <div key={name} className="bg-card p-1 rounded border border-border">
                      <div className="text-xs font-medium">{name}</div>
                      <div className="variable-value">
                        {typeof value === 'object' 
                          ? JSON.stringify(value) 
                          : String(value)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {executionSteps[currentStep].console && (
              <div className="mt-2">
                <h4 className="text-xs font-semibold text-muted-foreground mb-1">Console Output:</h4>
                <div className="bg-black text-white p-2 rounded font-mono text-xs">
                  {executionSteps[currentStep].console}
                </div>
              </div>
            )}
            
            {executionSteps[currentStep].explanation && (
              <div className="mt-2">
                <h4 className="text-xs font-semibold text-muted-foreground mb-1">Explanation:</h4>
                <div className="text-sm">{executionSteps[currentStep].explanation}</div>
              </div>
            )}
            
            <div className="flex justify-between mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={prevStep}
                disabled={currentStep === 0}
                className="text-xs"
              >
                Previous Step
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={nextStep}
                disabled={currentStep === executionSteps.length - 1}
                className="text-xs"
              >
                Next Step
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}