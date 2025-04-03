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
  Settings
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

interface CodeEditorProps {
  code: string;
  setCode: (code: string) => void;
  onRun: () => void;
  onFormat: () => void;
  onClear: () => void;
  isExecuting: boolean;
}

export default function CodeEditor({ 
  code, 
  setCode, 
  onRun, 
  onFormat, 
  onClear,
  isExecuting 
}: CodeEditorProps) {
  const editorRef = useRef<any>(null);
  const { toast } = useToast();
  const { theme: appTheme } = useTheme();
  const [editorTheme, setEditorTheme] = useState("vs-dark");
  const [fontSize, setFontSize] = useState(14);
  
  // Sync editor theme with app theme
  useEffect(() => {
    setEditorTheme(appTheme === "dark" ? "vs-dark" : "vs-light");
  }, [appTheme]);
  
  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    
    // Add keyboard shortcut for running code (Ctrl+Enter or Cmd+Enter)
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      onRun();
    });
  };
  
  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCode(value);
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
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Editor Settings</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setEditorTheme("vs-dark")}>
                Dark Theme
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setEditorTheme("vs-light")}>
                Light Theme
              </DropdownMenuItem>
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
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden">
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
      </div>
    </div>
  );
}
