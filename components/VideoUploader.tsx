
import React, { useRef } from 'react';

interface VideoUploaderProps {
  onSelect: (file: File) => void;
}

const VideoUploader: React.FC<VideoUploaderProps> = ({ onSelect }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onSelect(e.target.files[0]);
    }
  };

  return (
    <div className="group relative">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="video/*"
        className="hidden"
      />
      <div 
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-zinc-800 rounded-[2.5rem] p-16 transition-all cursor-pointer hover:border-zinc-500 hover:bg-zinc-900/50 group-hover:scale-[1.01]"
      >
        <div className="flex flex-col items-center gap-6">
          <div className="w-20 h-20 bg-zinc-900 rounded-2xl flex items-center justify-center group-hover:bg-white transition-colors">
            <svg className="w-10 h-10 text-zinc-500 group-hover:text-black transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold mb-2">Upload Video File</p>
            <p className="text-zinc-500 max-w-sm">
              Drag and drop your MP4, MOV, or WebM video file here to begin your AI breakdown.
            </p>
          </div>
        </div>
      </div>
      
      <div className="mt-8 text-center">
        <p className="text-[11px] text-zinc-600 font-medium uppercase tracking-widest">
          High fidelity analysis • Verbatim transcription • PPTX Export
        </p>
      </div>
    </div>
  );
};

export default VideoUploader;
