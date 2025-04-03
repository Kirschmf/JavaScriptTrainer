import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Snippet } from "@shared/schema";

interface SidebarProps {
  onSelectExample: (example: Snippet) => void;
  onNewScript: () => void;
  currentSnippetId: number | undefined;
  isOpen: boolean;
}

export default function Sidebar({ onSelectExample, onNewScript, currentSnippetId, isOpen }: SidebarProps) {
  const { data: examples = [] } = useQuery({
    queryKey: ["/api/examples"],
  });
  
  const { data: snippets = [] } = useQuery({
    queryKey: ["/api/snippets"],
  });
  
  // Filter to get user snippets (non-examples)
  const userSnippets = snippets.filter((snippet: Snippet) => !snippet.isExample);

  return (
    <aside 
      className={`border-r border-border w-full md:w-64 flex-shrink-0 bg-card overflow-hidden flex flex-col ${
        isOpen ? 'block absolute z-10 h-full' : 'hidden md:flex'
      }`}
    >
      <div className="p-3 border-b border-border">
        <h2 className="font-semibold text-foreground">Examples</h2>
      </div>
      
      <ScrollArea className="flex-1">
        <ul className="p-1">
          {examples.map((example: Snippet) => (
            <li key={example.id} className="mb-1">
              <button 
                className={`p-2 w-full text-left hover:bg-accent/10 rounded transition-colors ${
                  currentSnippetId === example.id ? 'bg-accent/20' : ''
                }`}
                onClick={() => onSelectExample(example)}
              >
                <div className="font-medium text-foreground">{example.title}</div>
                <div className="text-xs text-muted-foreground truncate">{example.description}</div>
              </button>
            </li>
          ))}
        </ul>
        
        {userSnippets.length > 0 && (
          <>
            <div className="p-3 border-t border-border">
              <h2 className="font-semibold text-foreground">Your Snippets</h2>
            </div>
            <ul className="p-1">
              {userSnippets.map((snippet: Snippet) => (
                <li key={snippet.id} className="mb-1">
                  <button 
                    className={`p-2 w-full text-left hover:bg-accent/10 rounded transition-colors ${
                      currentSnippetId === snippet.id ? 'bg-accent/20' : ''
                    }`}
                    onClick={() => onSelectExample(snippet)}
                  >
                    <div className="font-medium text-foreground">{snippet.title}</div>
                    {snippet.description && (
                      <div className="text-xs text-muted-foreground truncate">{snippet.description}</div>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </ScrollArea>
      
      <div className="p-3 border-t border-border">
        <Button 
          className="w-full flex items-center justify-center"
          variant="outline"
          onClick={onNewScript}
        >
          <Plus className="mr-2 h-4 w-4" />
          <span>New Script</span>
        </Button>
      </div>
    </aside>
  );
}
