import React from 'react';
import './ShinyButton.css';

interface ShinyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function ShinyButton({ children, onClick, className = "", ...props }: ShinyButtonProps) {
  return (
    <button className={`shiny-cta ${className}`} onClick={onClick} {...props}>
      <span>{children}</span>
    </button>
  );
}

