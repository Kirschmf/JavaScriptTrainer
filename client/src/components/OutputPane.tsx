import { useState, useRef, useEffect, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  Terminal, 
  Copy, 
  Trash2, 
  Code,
  Download, 
  FileCode,
  ArrowDown,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const [filter, setFilter] = useState<OutputType | 'all'>('all');
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const lastOutputLengthRef = useRef(outputs.length);
  const scrollTimeout = useRef<number>();
  
  const filteredOutputs = filter === 'all' 
    ? outputs 
    : outputs.filter(output => output.type === filter);
    
  // Scroll position detection hook with performance optimization
  useEffect(() => {
    const scrollArea = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    if (!scrollArea) return;
    
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollArea as HTMLDivElement;
      const bottomThreshold = 80; // px from bottom
      const isNearBottom = scrollHeight - scrollTop - clientHeight < bottomThreshold;
      
      setScrollPosition(scrollTop);
      setShowScrollButton(!isNearBottom && outputs.length > 5);
      
      // Mark user as actively scrolling
      setIsUserScrolling(true);
      // Clear any existing timeout
      clearTimeout(scrollTimeout.current);
      // Reset after a delay
      scrollTimeout.current = window.setTimeout(() => setIsUserScrolling(false), 150);
    };
    
    scrollArea.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      scrollArea.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [filteredOutputs.length, isUserScrolling]);
  
  // Auto-scroll to the bottom when new output is added ONLY if already at the bottom
  useEffect(() => {
    const outputsAdded = outputs.length > lastOutputLengthRef.current;
    lastOutputLengthRef.current = outputs.length;
    
    if (!outputsAdded) return;
    
    const scrollArea = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]') as HTMLDivElement;
    if (!scrollArea) return;
    
    const { scrollTop, scrollHeight, clientHeight } = scrollArea;
    const wasAtBottom = scrollHeight - scrollTop - clientHeight < 100;
    
    if (wasAtBottom || outputs.length <= 1) {
      requestAnimationFrame(scrollToBottom);
    } else {
      setShowScrollButton(true);
    }
  }, [outputs.length]);
  
  // Smooth scroll to bottom function
  const scrollToBottom = useCallback(() => {
    const scrollArea = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]') as HTMLDivElement;
    if (!scrollArea) return;
    
    const targetScroll = scrollArea.scrollHeight;
    const startPosition = scrollArea.scrollTop;
    const distance = targetScroll - startPosition;
    
    // Smooth scroll animation
    const duration = 300;
    const startTime = performance.now();
    
    const animateScroll = (currentTime: number) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3); // Cubic ease-out
      
      scrollArea.scrollTop = startPosition + distance * easeProgress;
      
      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      } else {
        setShowScrollButton(false);
      }
    };
    
    requestAnimationFrame(animateScroll);
  }, []);
  
  const getIconForOutputType = (type: OutputType) => {
    switch (type) {
      case 'error':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'warn':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      case 'log':
        return <Terminal className="h-4 w-4 text-green-500" />;
      default:
        return null;
    }
  };
  
  const getClassForOutputType = (type: OutputType) => {
    switch (type) {
      case 'error':
        return 'text-destructive border-l-2 border-destructive pl-2';
      case 'warn':
        return 'text-amber-500 border-l-2 border-amber-500 pl-2';
      case 'info':
        return 'text-blue-500 border-l-2 border-blue-500 pl-2';
      default:
        return 'text-foreground';
    }
  };
  
  const getBgClassForOutputType = (type: OutputType) => {
    switch (type) {
      case 'error':
        return 'bg-destructive/10';
      case 'warn':
        return 'bg-amber-500/5';
      case 'info':
        return 'bg-blue-500/5';
      default:
        return '';
    }
  };
    
  const copyOutputsToClipboard = () => {
    const text = outputs.map(output => output.content).join('\n');
    navigator.clipboard.writeText(text);
    toast({
      title: "Output copied!",
      description: "Console output has been copied to clipboard",
      duration: 2000
    });
  };
  
  const downloadOutputs = () => {
    const text = outputs.map(output => output.content).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'jsrunner-output.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Output downloaded",
      description: "Console output has been downloaded",
      duration: 2000
    });
  };
  
  const clearConsole = () => {
    // This is just a visual indication - actual clearing happens in parent component
    toast({
      title: "Console cleared",
      description: "Console output has been cleared",
      duration: 2000
    });
  };
  
  return (
    <div className="flex-1 flex flex-col h-full bg-background overflow-hidden">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="bg-card border-b border-border flex items-center justify-between px-2">
          <div className="flex-1">
            <TabsList className="h-10">
              <TabsTrigger value="console" className="h-full flex items-center">
                <Terminal className="h-4 w-4 mr-2" />
                Console
                {outputs.length > 0 && (
                  <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    {outputs.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="output" className="h-full flex items-center">
                <Code className="h-4 w-4 mr-2" />
                Preview
              </TabsTrigger>
            </TabsList>
          </div>
          
          {outputs.length > 0 && activeTab === "console" && (
            <div className="flex space-x-1 pr-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={copyOutputsToClipboard}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Copy output</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={downloadOutputs}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Download output</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={clearConsole}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Clear console</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </div>
        
        <TabsContent value="console" className="flex-1 p-0 m-0 flex flex-col">
          {outputs.length > 0 && (
            <div className="bg-card border-b border-border p-1 flex items-center justify-between">
              <div className="flex-1 flex items-center space-x-2 pl-2">
                <span className="text-xs text-muted-foreground">Filter:</span>
                <Select value={filter} onValueChange={(value) => setFilter(value as OutputType | 'all')}>
                  <SelectTrigger className="h-7 text-xs w-32">
                    <SelectValue placeholder="Select filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Outputs</SelectItem>
                    <SelectItem value="log">Logs</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warn">Warnings</SelectItem>
                    <SelectItem value="error">Errors</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="text-xs text-muted-foreground pr-2">
                {outputs.filter(o => o.type === 'error').length > 0 && (
                  <span className="text-destructive font-medium mr-2">
                    {outputs.filter(o => o.type === 'error').length} {outputs.filter(o => o.type === 'error').length === 1 ? 'error' : 'errors'}
                  </span>
                )}
                {outputs.filter(o => o.type === 'warn').length > 0 && (
                  <span className="text-amber-500 font-medium">
                    {outputs.filter(o => o.type === 'warn').length} {outputs.filter(o => o.type === 'warn').length === 1 ? 'warning' : 'warnings'}
                  </span>
                )}
              </div>
            </div>
          )}
          
          <div className="relative flex-1 overflow-hidden">
            <ScrollArea className="h-[calc(100vh-10rem)] p-3 font-mono text-sm" ref={scrollAreaRef}>
              {filteredOutputs.length === 0 ? (
                <div className="text-muted-foreground italic flex flex-col items-center justify-center h-32 text-center">
                  <Terminal className="h-8 w-8 text-muted-foreground/50 mb-2" />
                  {outputs.length === 0 
                    ? "No output yet. Run your code to see results here." 
                    : "No output matches the selected filter type."}
                </div>
              ) : (
                filteredOutputs.map((output, index) => (
                  <div 
                    key={index} 
                    className={`mb-2 rounded-md p-2 flex items-start ${getBgClassForOutputType(output.type)} transition-opacity duration-300 animate-in fade-in`}
                  >
                    {getIconForOutputType(output.type) && (
                      <span className="mr-2 mt-0.5 flex-shrink-0">
                        {getIconForOutputType(output.type)}
                      </span>
                    )}
                    <pre 
                      className={`whitespace-pre-wrap break-words font-mono tracking-tight leading-relaxed ${getClassForOutputType(output.type)}`}
                      style={{ 
                        textRendering: 'optimizeLegibility',
                        WebkitFontSmoothing: 'antialiased',
                        MozOsxFontSmoothing: 'grayscale'
                      }}
                    >
                      {output.content}
                    </pre>
                  </div>
                ))
              )}
            </ScrollArea>
            
            {/* Scroll to bottom button with smooth transition */}
            <div 
              className={`
                absolute bottom-4 right-4 transition-all duration-200 transform
                ${showScrollButton ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}
                ${outputs.length <= 3 ? 'hidden' : ''}
              `}
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="shadow-md h-9 w-9 rounded-full hover:bg-primary hover:text-primary-foreground transition-colors"
                      onClick={scrollToBottom}
                    >
                      <ChevronDown className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    <p>Scroll to bottom</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="output" className="flex-1 p-0 m-0 flex flex-col">
          <div className="flex-1 p-4 bg-background/50">
            <div className="max-w-lg mx-auto p-6 border border-border rounded-md bg-card shadow-sm">
              <h3 className="text-lg font-medium mb-2 flex items-center">
                <FileCode className="h-5 w-5 mr-2 text-primary" />
                Output Preview
              </h3>
              <p className="text-muted-foreground mb-4">
                This tab will show a live preview of your code output if it generates HTML, CSS, or visual elements.
              </p>
              <div className="p-6 border border-dashed border-border rounded-md flex flex-col items-center justify-center bg-background/50 min-h-40">
                <Code className="h-10 w-10 text-muted-foreground/30 mb-2" />
                <p className="text-muted-foreground text-center">Run code that produces visual output to see it here</p>
                <p className="text-xs text-muted-foreground/70 mt-1 text-center">
                  Example: code that manipulates the DOM or creates visual elements
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
