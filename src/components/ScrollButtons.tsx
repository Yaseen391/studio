"use client";

import React, { useState, useEffect } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function ScrollButtons() {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    if (window.scrollY > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  return (
    <div
      className={cn(
        'fixed bottom-4 right-4 z-50 flex flex-col gap-2 transition-opacity duration-300',
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}
    >
      <Button size="icon" onClick={scrollToTop} className="rounded-full shadow-lg">
        <ArrowUp className="h-6 w-6" />
      </Button>
      <Button size="icon" onClick={scrollToBottom} className="rounded-full shadow-lg">
        <ArrowDown className="h-6 w-6" />
      </Button>
    </div>
  );
}
