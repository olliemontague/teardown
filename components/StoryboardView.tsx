
import React, { useState } from 'react';
import { StoryboardItem } from '../types';

interface StoryboardViewProps {
  items: StoryboardItem[];
  videoName: string;
  onReset: () => void;
  onUpdateItem: (id: string, updates: Partial<StoryboardItem>) => void;
  onExportPPTX: () => void;
  captureFrame: (time: number) => Promise<string>;
}

const StoryboardView: React.FC<StoryboardViewProps> = ({ 
  items, 
  videoName, 
  onReset, 
  onUpdateItem, 
  onExportPPTX,
  captureFrame
}) => {
  const [editingId, setEditingId] = useState<{id: string, field: 'script' | 'description'} | null>(null);
  const [pickingFrameId, setPickingFrameId] = useState<string | null>(null);
  const [alternateFrames, setAlternateFrames] = useState<string[]>([]);
  const [isPicking, setIsPicking] = useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const openFramePicker = async (id: string, start: number, end: number) => {
    setPickingFrameId(id);
    setIsPicking(true);
    setAlternateFrames([]);
    
    const frames: string[] = [];
    const duration = end - start;
    const step = duration / 14;
    for (let i = 0; i < 15; i++) {
      const time = start + (i * step);
      const frame = await captureFrame(time);
      frames.push(frame);
    }
    setAlternateFrames(frames);
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-900 pb-8">
        <div>
          <h2 className="text-3xl font-extrabold mb-1">Storyboard Teardown</h2>
          <p className="text-zinc-500 text-sm truncate max-w-md">{videoName} • {items.length} Sections</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={onExportPPTX} 
            className="px-5 py-2.5 bg-[#FF5722] hover:bg-[#F4511E] text-white rounded-xl font-bold flex items-center gap-2 transition-colors"
          >
             <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
               <path d="M19,3H5C3.89,3,3,3.89,3,5v14c0,1.1,0.89,2,2,2h14c1.1,0,2-0.9,2-2V5C21,3.89,20.11,3,19,3z M19,19H5V5h14V19z M7,8h10v2H7V8z M7,12h10v2H7V12z" />
             </svg>
             Export as PPTX
          </button>
          <button onClick={onReset} className="px-5 py-2.5 bg-white text-black hover:bg-zinc-200 rounded-xl font-bold transition-colors">New Teardown</button>
        </div>
      </div>

      {isPicking && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="max-w-6xl w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Scrub Segment Frames</h3>
              <button onClick={() => setIsPicking(false)} className="text-zinc-500 hover:text-white">Close</button>
            </div>
            {alternateFrames.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center gap-4 text-zinc-500">
                <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                <p>Extracting segment frames...</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {alternateFrames.map((f, i) => (
                  <button key={i} onClick={() => { onUpdateItem(pickingFrameId!, { screenshot: f }); setIsPicking(false); }} className="aspect-video rounded-lg overflow-hidden border-2 border-transparent hover:border-amber-500 transition-all">
                    <img src={f} className="w-full h-full object-cover" alt={`Frame ${i}`} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-12">
        {items.map((item, index) => (
          <div key={item.id} className="group grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-1 flex flex-row lg:flex-col items-center lg:items-end gap-2 pt-2">
              <span className="text-4xl font-black text-zinc-900 group-hover:text-zinc-800 transition-colors">{(index + 1).toString().padStart(2, '0')}</span>
              <div className="px-2 py-1 bg-zinc-900 rounded text-[10px] font-bold text-zinc-400">
                {formatTime(item.startTime)}
              </div>
            </div>

            <div className="lg:col-span-11 grid grid-cols-1 md:grid-cols-5 gap-8 bg-zinc-900/20 p-6 rounded-3xl border border-transparent group-hover:border-zinc-800 transition-all">
              <div className="md:col-span-2 relative group/img aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl">
                <img src={item.screenshot} className="w-full h-full object-cover" alt="Midpoint Capture" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button onClick={() => openFramePicker(item.id, item.startTime, item.endTime)} className="px-4 py-2 bg-white text-black text-xs font-bold rounded-full shadow-lg hover:scale-105 transition-transform">Scrub Segment</button>
                </div>
              </div>

              <div className="md:col-span-3 flex flex-col justify-center space-y-4">
                {/* SCRIPT FIELD */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Verbatim Script</span>
                  {editingId?.id === item.id && editingId?.field === 'script' ? (
                    <textarea
                      autoFocus
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-lg font-medium leading-relaxed text-zinc-200 focus:outline-none focus:ring-1 focus:ring-white/20"
                      value={item.script}
                      onChange={(e) => onUpdateItem(item.id, { script: e.target.value })}
                      onBlur={() => setEditingId(null)}
                      rows={2}
                    />
                  ) : (
                    <p onClick={() => setEditingId({id: item.id, field: 'script'})} className="text-xl font-semibold italic leading-relaxed text-zinc-100 cursor-text hover:text-white transition-colors">
                      "{item.script}"
                    </p>
                  )}
                </div>

                {/* DESCRIPTION FIELD */}
                <div className="space-y-1 pt-2 border-t border-white/5">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Visual Description</span>
                  {editingId?.id === item.id && editingId?.field === 'description' ? (
                    <textarea
                      autoFocus
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm font-medium leading-relaxed text-zinc-400 focus:outline-none focus:ring-1 focus:ring-white/20"
                      value={item.description}
                      onChange={(e) => onUpdateItem(item.id, { description: e.target.value })}
                      onBlur={() => setEditingId(null)}
                      rows={2}
                    />
                  ) : (
                    <p onClick={() => setEditingId({id: item.id, field: 'description'})} className="text-sm leading-relaxed text-zinc-400 cursor-text hover:text-zinc-300 transition-colors">
                      {item.description}
                    </p>
                  )}
                </div>

                <div className="text-[9px] text-zinc-700 font-bold uppercase tracking-widest pt-2">
                  SEGMENT: {formatTime(item.startTime)} — {formatTime(item.endTime)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StoryboardView;
