import { useState, useEffect } from "react";
import { getDocsForCode, getMethodDocumentation, getResourcesForTopic, type MethodDocumentation, type DocumentationResource } from "@/lib/docsService";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, Search, ExternalLink, Code, FileText, Video, Lightbulb } from "lucide-react";

interface DocPanelProps {
  code: string;
  visible: boolean;
}

export default function DocPanel({ code, visible }: DocPanelProps) {
  const [methodDocs, setMethodDocs] = useState<MethodDocumentation[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<DocumentationResource[]>([]);
  const [activeTab, setActiveTab] = useState("code-docs");

  // Parse code and find documentation for detected methods
  useEffect(() => {
    if (code && visible) {
      const docs = getDocsForCode(code);
      setMethodDocs(docs);
    }
  }, [code, visible]);

  // Handle search for JavaScript topics
  const handleSearch = () => {
    if (searchQuery.trim()) {
      const results = getResourcesForTopic(searchQuery);
      setSearchResults(results);
    }
  };

  // Handle keypress for search input
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Get icon for resource type
  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'article':
        return <FileText className="w-4 h-4 mr-2" />;
      case 'reference':
        return <BookOpen className="w-4 h-4 mr-2" />;
      case 'tutorial':
        return <Lightbulb className="w-4 h-4 mr-2" />;
      case 'video':
        return <Video className="w-4 h-4 mr-2" />;
      case 'example':
        return <Code className="w-4 h-4 mr-2" />;
      default:
        return <FileText className="w-4 h-4 mr-2" />;
    }
  };

  if (!visible) return null;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-2 border-b border-border">
        <h2 className="text-lg font-semibold flex items-center">
          <BookOpen className="w-5 h-5 mr-2 text-primary" />
          JavaScript Resources
        </h2>
      </div>

      <Tabs
        defaultValue="code-docs"
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col"
      >
        <TabsList className="grid grid-cols-2 mx-2 mt-2">
          <TabsTrigger value="code-docs">Code Docs</TabsTrigger>
          <TabsTrigger value="search-docs">Search Topics</TabsTrigger>
        </TabsList>

        <TabsContent value="code-docs" className="flex-1 p-2">
          {methodDocs.length > 0 ? (
            <ScrollArea className="h-full">
              <Accordion type="single" collapsible className="w-full">
                {methodDocs.map((doc, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-md font-medium">
                      {doc.name}
                    </AccordionTrigger>
                    <AccordionContent>
                      <Card className="border-none shadow-none">
                        <CardContent className="p-0">
                          <p className="text-sm mb-2">{doc.description}</p>
                          
                          <div className="mb-2">
                            <h4 className="text-xs font-semibold text-muted-foreground mb-1">SYNTAX</h4>
                            <code className="text-xs bg-muted p-1 block rounded">{doc.syntax}</code>
                          </div>
                          
                          {doc.parameters && doc.parameters.length > 0 && (
                            <div className="mb-2">
                              <h4 className="text-xs font-semibold text-muted-foreground mb-1">PARAMETERS</h4>
                              <ul className="text-xs space-y-1">
                                {doc.parameters.map((param, paramIndex) => (
                                  <li key={paramIndex} className="ml-2">
                                    <span className="font-mono">{param.name}</span>
                                    {param.optional && <span className="text-muted-foreground"> (optional)</span>}
                                    <span className="text-muted-foreground ml-1">- {param.description}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {doc.returnValue && (
                            <div className="mb-2">
                              <h4 className="text-xs font-semibold text-muted-foreground mb-1">RETURN VALUE</h4>
                              <p className="text-xs ml-2">
                                <span className="font-mono">{doc.returnValue.type}</span>
                                <span className="text-muted-foreground ml-1">- {doc.returnValue.description}</span>
                              </p>
                            </div>
                          )}
                          
                          {doc.examples && doc.examples.length > 0 && (
                            <div className="mb-2">
                              <h4 className="text-xs font-semibold text-muted-foreground mb-1">EXAMPLES</h4>
                              {doc.examples.map((example, exIndex) => (
                                <pre key={exIndex} className="text-xs bg-muted p-2 rounded my-1 overflow-auto max-h-36">
                                  <code>{example}</code>
                                </pre>
                              ))}
                            </div>
                          )}
                          
                          <a 
                            href={doc.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-primary flex items-center hover:underline mt-2"
                          >
                            Read full documentation <ExternalLink className="w-3 h-3 ml-1" />
                          </a>
                        </CardContent>
                      </Card>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </ScrollArea>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <BookOpen className="w-12 h-12 mb-2 opacity-30" />
              <p className="text-sm">No methods detected in your code.</p>
              <p className="text-xs mt-1">Try using common JavaScript methods like map, filter, or reduce.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="search-docs" className="flex-1 p-2">
          <div className="mb-4 flex space-x-2">
            <Input
              placeholder="Search JavaScript topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button onClick={handleSearch} size="sm">
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>

          <ScrollArea className="h-[calc(100%-3rem)]">
            {searchResults.length > 0 ? (
              <div className="space-y-3">
                {searchResults.map((resource, index) => (
                  <Card key={index} className="overflow-hidden">
                    <CardHeader className="p-3 pb-2">
                      <CardTitle className="text-sm flex items-center">
                        {getResourceIcon(resource.type)}
                        {resource.title}
                      </CardTitle>
                      <CardDescription className="text-xs">{resource.type}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                      <p className="text-xs mb-2">{resource.description}</p>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {resource.tags.map((tag, tagIndex) => (
                          <span key={tagIndex} className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <a 
                        href={resource.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-primary flex items-center hover:underline"
                      >
                        Visit resource <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : searchQuery ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Search className="w-12 h-12 mb-2 opacity-30" />
                <p className="text-sm">No results found for "{searchQuery}".</p>
                <p className="text-xs mt-1">Try searching for JavaScript topics like "promises", "arrays", or "functions".</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Search className="w-12 h-12 mb-2 opacity-30" />
                <p className="text-sm">Search for JavaScript topics</p>
                <p className="text-xs mt-1">Try "async/await", "objects", "arrays", or "promises"</p>
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}