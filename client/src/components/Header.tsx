import { Button } from "@/components/ui/button";
import { 
  Save, 
  PlayCircle, 
  Menu, 
  X, 
  Code, 
  Github, 
  BookOpen, 
  HelpCircle,
  InfoIcon
} from "lucide-react";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  onSave: () => void;
  onRun: () => void;
  toggleMobileMenu: () => void;
  isMobileMenuOpen: boolean;
}

export default function Header({ onSave, onRun, toggleMobileMenu, isMobileMenuOpen }: HeaderProps) {
  return (
    <header className="bg-gradient-to-r from-primary/20 via-background to-background border-b border-border p-3 flex justify-between items-center">
      <div className="flex items-center">
        <div className="flex items-center">
          <Code className="h-6 w-6 text-primary mr-2" />
          <div className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent font-bold text-xl mr-2">JSRunner</div>
        </div>
        <div className="text-muted-foreground text-sm hidden sm:block">JavaScript Runtime Environment</div>
      </div>
      
      <div className="flex space-x-3">
        <Button 
          variant="outline" 
          size="sm" 
          className="md:hidden" 
          onClick={toggleMobileMenu}
        >
          {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </Button>
        
        <div className="hidden md:flex space-x-3 items-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center"
                  onClick={onSave}
                >
                  <Save className="mr-2 h-4 w-4" />
                  <span>Save</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Save your code snippet</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="default"
                  size="sm"
                  className="flex items-center bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700"
                  onClick={onRun}
                >
                  <PlayCircle className="mr-2 h-4 w-4" />
                  <span>Run</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Execute your JavaScript code (Ctrl+Enter)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <HelpCircle className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="flex items-center cursor-pointer" onClick={() => window.open("https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide", "_blank")}>
                <BookOpen className="h-4 w-4 mr-2" />
                <span>JavaScript Reference</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center cursor-pointer" onClick={() => window.open("https://github.com/topics/javascript", "_blank")}>
                <Github className="h-4 w-4 mr-2" />
                <span>GitHub JS Resources</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex items-center cursor-pointer">
                <InfoIcon className="h-4 w-4 mr-2" />
                <span>About JSRunner</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
