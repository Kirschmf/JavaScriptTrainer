import { useState } from "react";
import { commonPackages, getPackageExample, type PackageInfo } from "@/lib/packageService";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Package, ExternalLink, Code, ChevronRight, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PackageExplorerProps {
  visible: boolean;
  onSelectExample: (code: string) => void;
}

export default function PackageExplorer({ visible, onSelectExample }: PackageExplorerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPackages, setFilteredPackages] = useState<PackageInfo[]>(commonPackages);
  const { toast } = useToast();

  if (!visible) return null;

  const handleSearch = () => {
    if (searchQuery.trim()) {
      const filtered = commonPackages.filter(pkg =>
        pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pkg.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredPackages(filtered);
    } else {
      setFilteredPackages(commonPackages);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleUsePackage = (packageName: string) => {
    const example = getPackageExample(packageName);
    onSelectExample(example);
    
    toast({
      title: "Package example loaded",
      description: `${packageName} example code has been loaded into the editor.`,
      duration: 3000
    });
  };

  const handleCopyImport = (importStatement: string) => {
    navigator.clipboard.writeText(importStatement);
    
    toast({
      title: "Import statement copied",
      description: "The import statement has been copied to your clipboard.",
      duration: 2000
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-2 border-b border-border">
        <h2 className="text-lg font-semibold flex items-center">
          <Package className="w-5 h-5 mr-2 text-primary" />
          Package Explorer
        </h2>
      </div>

      <div className="p-2">
        <div className="mb-4 flex space-x-2">
          <Input
            placeholder="Search packages..."
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

        <ScrollArea className="h-[calc(100vh-15rem)]">
          <div className="space-y-3">
            {filteredPackages.length > 0 ? (
              filteredPackages.map((pkg, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardHeader className="p-3 pb-2">
                    <CardTitle className="text-sm flex items-center">
                      <Package className="w-4 h-4 mr-2 text-primary" />
                      {pkg.name}
                    </CardTitle>
                    <CardDescription className="text-xs">{pkg.version}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <p className="text-xs mb-3">{pkg.description}</p>
                    
                    <div className="flex items-center justify-between text-xs bg-muted p-1.5 rounded mb-3">
                      <code className="text-xs overflow-hidden text-ellipsis flex-1">
                        {pkg.importStatement}
                      </code>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-5 w-5 ml-1" 
                        onClick={() => handleCopyImport(pkg.importStatement)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <a 
                        href={pkg.homepage || pkg.cdnUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-primary flex items-center hover:underline"
                      >
                        Documentation <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                      
                      <Button 
                        size="sm" 
                        onClick={() => handleUsePackage(pkg.name)}
                        className="h-7 text-xs flex items-center"
                      >
                        <Code className="w-3 h-3 mr-1" />
                        Try Example
                        <ChevronRight className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                <Package className="w-12 h-12 mb-2 opacity-30" />
                <p className="text-sm">No packages match "{searchQuery}".</p>
                <p className="text-xs mt-1">Try searching for another package or browse the list.</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}