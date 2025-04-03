import { Button } from "@/components/ui/button";
import { Save, PlayCircle, Menu, X } from "lucide-react";

interface HeaderProps {
  onSave: () => void;
  onRun: () => void;
  toggleMobileMenu: () => void;
  isMobileMenuOpen: boolean;
}

export default function Header({ onSave, onRun, toggleMobileMenu, isMobileMenuOpen }: HeaderProps) {
  return (
    <header className="bg-ui-dark border-b border-border p-3 flex justify-between items-center">
      <div className="flex items-center">
        <div className="text-primary font-bold text-xl mr-2">JSRunner</div>
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
        
        <div className="hidden md:flex space-x-3">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center"
            onClick={onSave}
          >
            <Save className="mr-2 h-4 w-4" />
            <span>Save</span>
          </Button>
          
          <Button
            variant="default"
            size="sm"
            className="flex items-center"
            onClick={onRun}
          >
            <PlayCircle className="mr-2 h-4 w-4" />
            <span>Run</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
