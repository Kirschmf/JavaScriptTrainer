import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { 
  Plus, 
  Code, 
  FileCode, 
  Layers, 
  Box, 
  Clock, 
  FileJson,
  Network,
  FileText,
  AlertTriangle,
  BookOpen
} from "lucide-react";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Snippet } from "@shared/schema";

interface SidebarProps {
  onSelectExample: (example: Snippet) => void;
  onNewScript: () => void;
  currentSnippetId: number | undefined;
  isOpen: boolean;
}

// Helper to get icon for a snippet based on its title
const getSnippetIcon = (title: string) => {
  const titleLower = title.toLowerCase();
  
  if (titleLower.includes('console')) return <Code className="h-4 w-4 text-blue-400" />;
  if (titleLower.includes('array')) return <Layers className="h-4 w-4 text-green-400" />;
  if (titleLower.includes('object')) return <Box className="h-4 w-4 text-amber-400" />;
  if (titleLower.includes('async') || titleLower.includes('promise')) return <Clock className="h-4 w-4 text-purple-400" />;
  if (titleLower.includes('json')) return <FileJson className="h-4 w-4 text-orange-400" />;
  if (titleLower.includes('fetch') || titleLower.includes('api')) return <Network className="h-4 w-4 text-sky-400" />;
  if (titleLower.includes('dom')) return <FileText className="h-4 w-4 text-pink-400" />;
  if (titleLower.includes('error')) return <AlertTriangle className="h-4 w-4 text-red-400" />;
  if (titleLower.includes('class')) return <BookOpen className="h-4 w-4 text-indigo-400" />;
  
  return <FileCode className="h-4 w-4 text-muted-foreground" />;
};

// Group examples by categories
const categorizeExamples = (examples: Snippet[]) => {
  const categories: {[key: string]: Snippet[]} = {
    "Fundamentals": [],
    "Data Structures": [],
    "Async & Promises": [],
    "DOM & Browser": [],
    "Advanced Concepts": []
  };
  
  examples.forEach(example => {
    const title = example.title.toLowerCase();
    
    if (title.includes('console') || title.includes('fundamental')) {
      categories["Fundamentals"].push(example);
    } else if (title.includes('array') || title.includes('object')) {
      categories["Data Structures"].push(example);
    } else if (title.includes('async') || title.includes('promise') || title.includes('fetch')) {
      categories["Async & Promises"].push(example);
    } else if (title.includes('dom') || title.includes('manipulation')) {
      categories["DOM & Browser"].push(example);
    } else {
      categories["Advanced Concepts"].push(example);
    }
  });
  
  return categories;
};

export default function Sidebar({ onSelectExample, onNewScript, currentSnippetId, isOpen }: SidebarProps) {
  const { data: examples = [] } = useQuery({
    queryKey: ["/api/examples"],
  });
  
  const { data: snippets = [] } = useQuery({
    queryKey: ["/api/snippets"],
  });
  
  // Filter to get user snippets (non-examples)
  const userSnippets = (snippets as Snippet[]).filter(snippet => !snippet.isExample);
  
  // Get categorized examples
  const exampleCategories = categorizeExamples(examples as Snippet[]);

  return (
    <aside 
      className={`border-r border-border w-full md:w-72 flex-shrink-0 bg-card overflow-hidden flex flex-col ${
        isOpen ? 'block absolute z-10 h-full' : 'hidden md:flex'
      }`}
    >
      <div className="p-3 border-b border-border bg-gradient-to-r from-primary/10 to-transparent">
        <h2 className="font-semibold text-lg text-primary flex items-center">
          <Code className="mr-2 h-5 w-5" />
          JavaScript Examples
        </h2>
        <p className="text-xs text-muted-foreground">Explore pre-made code examples</p>
      </div>
      
      <ScrollArea className="flex-1">
        <Accordion type="multiple" defaultValue={["Fundamentals"]} className="px-1">
          {Object.entries(exampleCategories).map(([category, categoryExamples]) => (
            categoryExamples.length > 0 && (
              <AccordionItem key={category} value={category}>
                <AccordionTrigger className="py-2 text-sm font-medium hover:bg-accent/5 px-2 rounded">
                  {category}
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="py-1">
                    {categoryExamples.map((example: Snippet) => (
                      <li key={example.id} className="mb-1">
                        <button 
                          className={`p-2 w-full text-left hover:bg-accent/10 rounded transition-colors ${
                            currentSnippetId === example.id ? 'bg-accent/20 border-l-2 border-primary' : ''
                          }`}
                          onClick={() => onSelectExample(example)}
                        >
                          <div className="font-medium text-foreground flex items-center">
                            {getSnippetIcon(example.title)}
                            <span className="ml-2">{example.title}</span>
                          </div>
                          <div className="text-xs text-muted-foreground truncate pl-6">{example.description}</div>
                        </button>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            )
          ))}
        </Accordion>
        
        {userSnippets.length > 0 && (
          <>
            <div className="p-3 border-t border-border mt-2 bg-gradient-to-r from-blue-500/10 to-transparent">
              <h2 className="font-semibold text-foreground flex items-center">
                <FileCode className="mr-2 h-4 w-4" />
                Your Snippets
              </h2>
              <p className="text-xs text-muted-foreground">Your saved code snippets</p>
            </div>
            <ul className="p-1">
              {userSnippets.map((snippet: Snippet) => (
                <li key={snippet.id} className="mb-1">
                  <button 
                    className={`p-2 w-full text-left hover:bg-accent/10 rounded transition-colors ${
                      currentSnippetId === snippet.id ? 'bg-accent/20 border-l-2 border-blue-500' : ''
                    }`}
                    onClick={() => onSelectExample(snippet)}
                  >
                    <div className="font-medium text-foreground flex items-center">
                      <FileCode className="h-4 w-4 text-blue-400 mr-2" />
                      {snippet.title}
                    </div>
                    {snippet.description && (
                      <div className="text-xs text-muted-foreground truncate pl-6">{snippet.description}</div>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </ScrollArea>
      
      <div className="p-3 border-t border-border bg-card">
        <Button 
          className="w-full flex items-center justify-center bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700"
          variant="default"
          onClick={onNewScript}
        >
          <Plus className="mr-2 h-4 w-4" />
          <span>Create New Script</span>
        </Button>
      </div>
    </aside>
  );
}
