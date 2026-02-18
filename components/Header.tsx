
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-900 bg-black/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-black font-black">
            T
          </div>
          <span className="font-bold text-xl tracking-tight">TEARDOWN</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
