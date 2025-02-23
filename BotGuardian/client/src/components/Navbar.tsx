import React, { useState } from 'react';
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Bot, LayoutDashboard, User, Menu, X } from "lucide-react";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="border-b bg-card/50 backdrop-blur-sm transition-colors duration-200 hover:bg-card/70"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/">
              <div className="flex items-center space-x-2 cursor-pointer transition-transform duration-200 hover:scale-105">
                <Bot className="h-6 w-6 text-primary" />
                <span className="text-lg font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">
                  BotGuardian
                </span>
              </div>
            </Link>
          </div>

          <div className="hidden md:block">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button 
                  variant="ghost" 
                  className="transition-colors duration-200 hover:bg-primary/20"
                >
                  Home
                </Button>
              </Link>
              <Link href="/aboutProject">
                <Button 
                  variant="ghost"
                  className="transition-colors duration-200 hover:bg-primary/20"
                >
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  About Project
                </Button>
              </Link>
              <Link href="/aboutTeam">
                <Button 
                  variant="ghost"
                  className="transition-colors duration-200 hover:bg-primary/20"
                >
                  <User className="mr-2 h-4 w-4" />
                  About Team
                </Button>
              </Link>
            </div>
          </div>

          <div className="md:hidden">
            <Button 
              variant="ghost" 
              onClick={toggleMenu}
              className="transition-colors duration-200 hover:bg-primary/20"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/">
              <Button 
                variant="ghost" 
                className="w-full text-left transition-colors duration-200 hover:bg-primary/20"
              >
                Home
              </Button>
            </Link>
            <Link href="/aboutProject">
              <Button 
                variant="ghost"
                className="w-full text-left transition-colors duration-200 hover:bg-primary/20"
              >
                <LayoutDashboard className="mr-2 h-4 w-4" />
                About Project
              </Button>
            </Link>
            <Link href="/aboutTeam">
              <Button 
                variant="ghost"
                className="w-full text-left transition-colors duration-200 hover:bg-primary/20"
              >
                <User className="mr-2 h-4 w-4" />
                About Team
              </Button>
            </Link>
          </div>
        </div>
      )}
    </motion.nav>
  );
}