import React from "react";
import { Github, Linkedin, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black/20 backdrop-blur-md py-12 mt-20 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-xl font-display font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
            AI Career Guide
          </span>
        </div>
        
        <p className="text-muted-foreground flex items-center gap-2 text-sm">
          Built with <Heart className="w-4 h-4 text-red-500 fill-red-500" /> by <span className="text-white font-medium">Nayana Bhagath</span>
        </p>

        <div className="flex items-center gap-4">
          <a 
            href="https://linkedin.com" 
            target="_blank" 
            rel="noreferrer"
            className="w-10 h-10 rounded-full glass flex items-center justify-center text-muted-foreground hover:text-white hover:bg-primary/20 transition-all duration-300"
          >
            <Linkedin className="w-5 h-5" />
          </a>
          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noreferrer"
            className="w-10 h-10 rounded-full glass flex items-center justify-center text-muted-foreground hover:text-white hover:bg-primary/20 transition-all duration-300"
          >
            <Github className="w-5 h-5" />
          </a>
        </div>
      </div>
    </footer>
  );
}
