import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, AlertTriangle, Info } from "lucide-react";

type OutputType = 'log' | 'error' | 'warn' | 'info';

interface ConsoleOutput {
  type: OutputType;
  content: string;
}

interface OutputPaneProps {
  outputs: ConsoleOutput[];
}

export default function OutputPane({ outputs }: OutputPaneProps) {
  const [activeTab, setActiveTab] = useState("console");
  
  const getIconForOutputType = (type: OutputType) => {
    switch (type) {
      case 'error':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'warn':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'info':
        return <Info className="h-4 w-4 text-muted-foreground" />;
      default:
        return null;
    }
  };
  
  const getClassForOutputType = (type: OutputType) => {
    switch (type) {
      case 'error':
        return 'text-destructive';
      case 'warn':
        return 'text-amber-500';
      case 'info':
        return 'text-muted-foreground';
      default:
        return 'text-foreground';
    }
  };
  
  return (
    <div className="flex-1 flex flex-col h-full bg-background overflow-hidden">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="bg-card border-b border-border">
          <TabsList className="h-10">
            <TabsTrigger value="console" className="h-full">Console</TabsTrigger>
            <TabsTrigger value="output" className="h-full">Output</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="console" className="flex-1 p-0 m-0 flex flex-col">
          <ScrollArea className="flex-1 p-3 font-mono text-sm">
            {outputs.length === 0 ? (
              <div className="text-muted-foreground italic">No output yet. Run your code to see results here.</div>
            ) : (
              outputs.map((output, index) => (
                <div 
                  key={index} 
                  className={`mb-1 flex items-start ${getClassForOutputType(output.type)}`}
                >
                  {getIconForOutputType(output.type) && (
                    <span className="mr-2 mt-0.5 flex-shrink-0">
                      {getIconForOutputType(output.type)}
                    </span>
                  )}
                  <pre className="whitespace-pre-wrap break-words font-mono">{output.content}</pre>
                </div>
              ))
            )}
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="output" className="flex-1 p-0 m-0 flex flex-col">
          <div className="flex-1 p-4">
            <div className="max-w-lg mx-auto p-6 border border-border rounded-md bg-card">
              <h3 className="text-lg font-medium mb-2">Output Preview</h3>
              <p className="text-muted-foreground mb-4">
                This tab will show a live preview of your code output if it generates HTML, CSS, or visual elements.
              </p>
              <div className="p-4 border border-dashed border-border rounded-md flex items-center justify-center bg-background min-h-32">
                <p className="text-muted-foreground">Run code that produces visual output to see it here</p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
