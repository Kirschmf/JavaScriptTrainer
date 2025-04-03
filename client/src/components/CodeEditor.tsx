import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, AlignLeft, Trash2 } from "lucide-react";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Editor } from "@monaco-editor/react";

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
  
  const handleEditorDidMount = (editor: any) => {
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
  
  return (
    <div className="flex-1 flex flex-col h-full border-r border-border">
      <div className="bg-card p-2 flex justify-between items-center">
        <div className="flex items-center">
          <Button
            variant="default"
            size="sm"
            className="flex items-center"
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
          <div className="ml-2 text-muted-foreground text-sm hidden md:flex items-center">
            <span>Ctrl+Enter to run</span>
          </div>
        </div>
        
        <div className="flex space-x-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onFormat}
            title="Format Code"
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={onClear}
            title="Clear Editor"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          defaultLanguage="javascript"
          value={code}
          onChange={handleEditorChange}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: "'Fira Code', monospace",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            lineNumbers: "on",
            folding: true,
            wordWrap: "on",
            tabSize: 2
          }}
          onMount={handleEditorDidMount}
        />
      </div>
    </div>
  );
}
