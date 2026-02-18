
import React from 'react';
import { ProcessingStatus } from '../types';

interface ProcessingStateProps {
  status: ProcessingStatus;
}

const ProcessingState: React.FC<ProcessingStateProps> = ({ status }) => {
  return (
    <div className="max-w-2xl mx-auto py-20 flex flex-col items-center">
      <div className="relative w-24 h-24 mb-10">
        <div className="absolute inset-0 rounded-full border-4 border-zinc-900"></div>
        <div 
          className="absolute inset-0 rounded-full border-4 border-white border-t-transparent animate-spin"
          style={{ clipPath: 'polygon(0 0, 100% 0, 100% 50%, 0 50%)' }}
        ></div>
        <div className="absolute inset-0 flex items-center justify-center font-bold text-lg">
          {status.progress}%
        </div>
      </div>
      
      <div className="text-center space-y-3">
        <h3 className="text-2xl font-bold capitalize">{status.step}...</h3>
        <p className="text-zinc-400 max-w-sm">{status.message}</p>
      </div>

      <div className="mt-12 w-full max-w-md bg-zinc-900 h-1.5 rounded-full overflow-hidden">
        <div 
          className="h-full bg-white transition-all duration-500 ease-out"
          style={{ width: `${status.progress}%` }}
        ></div>
      </div>
      
      <div className="mt-10 grid grid-cols-3 gap-8 w-full max-w-lg">
        {[
          { label: 'Upload', active: status.step === 'uploading' || status.progress > 10 },
          { label: 'Analyze', active: status.step === 'analyzing' || status.progress > 40 },
          { label: 'Export', active: status.step === 'capturing' || status.progress > 70 },
        ].map((item, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${item.active ? 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'bg-zinc-800'}`}></div>
            <span className={`text-[10px] font-bold tracking-widest uppercase ${item.active ? 'text-white' : 'text-zinc-600'}`}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProcessingState;
