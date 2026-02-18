
import React, { useState, useRef, useCallback } from 'react';
import Header from './components/Header';
import VideoUploader from './components/VideoUploader';
import StoryboardView from './components/StoryboardView';
import ProcessingState from './components/ProcessingState';
import { analyzeVideo } from './services/geminiService';
import { StoryboardItem, ProcessingStatus } from './types';
import pptxgen from "pptxgenjs";

const App: React.FC = () => {
  const isEmbed = new URLSearchParams(window.location.search).has('embed');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [storyboard, setStoryboard] = useState<StoryboardItem[]>([]);
  const [videoDimensions, setVideoDimensions] = useState({ width: 0, height: 0 });
  const [status, setStatus] = useState<ProcessingStatus>({
    step: 'idle',
    progress: 0,
    message: ''
  });

  const hiddenVideoRef = useRef<HTMLVideoElement>(null);

  const captureFrame = useCallback(async (time: number): Promise<string> => {
    return new Promise((resolve) => {
      const video = hiddenVideoRef.current;
      if (!video) return resolve('');

      const onSeeked = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
        video.removeEventListener('seeked', onSeeked);
        resolve(canvas.toDataURL('image/jpeg', 0.9));
      };

      video.addEventListener('seeked', onSeeked);
      const targetTime = Math.max(0, Math.min(time, video.duration || 0));
      video.currentTime = targetTime;
    });
  }, []);

  const processVideoData = async (file: File) => {
    setStoryboard([]);
    setStatus({ step: 'uploading', progress: 10, message: 'Loading video file...' });

    try {
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      const mimeType = file.type;
      
      const reader = new FileReader();
      const videoBase64 = await new Promise<string>((resolve) => {
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(file);
      });

      setStatus({ step: 'analyzing', progress: 40, message: 'AI is extracting script and describing action...' });
      const items = await analyzeVideo(videoBase64, mimeType);
      
      setStatus({ step: 'capturing', progress: 70, message: 'Capturing midpoint visual context...' });
      
      if (hiddenVideoRef.current) {
        hiddenVideoRef.current.src = url;
        await new Promise((resolve, reject) => {
          hiddenVideoRef.current!.onloadedmetadata = () => {
            setVideoDimensions({
              width: hiddenVideoRef.current!.videoWidth,
              height: hiddenVideoRef.current!.videoHeight
            });
            resolve(true);
          };
          hiddenVideoRef.current!.onerror = () => {
            reject(new Error("Video element could not load the source. Ensure the file is a valid video."));
          };
        });
      }

      const itemsWithScreenshots: StoryboardItem[] = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const midpoint = item.startTime + (item.endTime - item.startTime) / 2;
        const screenshot = await captureFrame(midpoint);
        
        itemsWithScreenshots.push({ ...item, screenshot });
        
        setStatus(prev => ({ 
          ...prev, 
          progress: 70 + (Math.floor((i / items.length) * 25)),
          message: `Captured visual for chapter ${i + 1} of ${items.length}...`
        }));
      }

      setStoryboard(itemsWithScreenshots);
      setStatus({ step: 'complete', progress: 100, message: 'Teardown complete!' });
    } catch (error: any) {
      console.error("Processing error:", error);
      setStatus({ step: 'error', progress: 0, message: error.message });
    }
  };

  const exportToPPTX = async () => {
    if (storyboard.length === 0) return;
    setStatus({ step: 'exporting', progress: 0, message: 'Generating professional deck...' });
    
    try {
      const pres = new pptxgen();
      pres.layout = 'LAYOUT_16x9'; 
      
      pres.defineSlideMaster({
        title: "TEARDOWN_MASTER",
        background: { color: "0A0A0A" },
        objects: [
          { text: { text: "TEARDOWN STORYBOARD", options: { x: 0.5, y: 0.1, w: 4, h: 0.2, color: "FFFFFF", fontSize: 8, bold: true } } }
        ]
      });

      const totalSlides = storyboard.length;
      const MAX_WIDTH = 6.25; 
      const MAX_HEIGHT_INCHES = 3.15; // Approx 8cm
      const SLIDE_WIDTH = 10;
      const videoRatio = videoDimensions.height / (videoDimensions.width || 1);

      let finalWidth = MAX_WIDTH;
      let finalHeight = finalWidth * videoRatio;

      if (finalHeight > MAX_HEIGHT_INCHES) {
        finalHeight = MAX_HEIGHT_INCHES;
        finalWidth = finalHeight / (videoRatio || 1);
      }

      const centerX = (SLIDE_WIDTH - finalWidth) / 2;

      for (let i = 0; i < totalSlides; i++) {
        const item = storyboard[i];
        const slide = pres.addSlide({ masterName: "TEARDOWN_MASTER" });
        
        slide.addText(`SCRIPT: "${item.script}"`, { 
          x: 0.5, y: 0.4, w: 9.0, h: 0.7, 
          fontSize: 14, color: "FFFFFF", align: "center", valign: "top", italic: true, bold: true
        });

        slide.addText(`ACTION: ${item.description}`, { 
          x: 0.5, y: 1.1, w: 9.0, h: 0.4, 
          fontSize: 10, color: "AAAAAA", align: "center", valign: "top"
        });

        if (item.screenshot) {
          slide.addImage({ 
            data: item.screenshot, 
            x: centerX, 
            y: 1.7, 
            w: finalWidth, 
            h: finalHeight
          });
        }

        slide.addText(`SLIDE ${i + 1} • ${Math.floor(item.startTime / 60)}:${(Math.floor(item.startTime % 60)).toString().padStart(2, '0')} - ${Math.floor(item.endTime / 60)}:${(Math.floor(item.endTime % 60)).toString().padStart(2, '0')}`, {
          x: 0.5, y: 5.3, w: 9, h: 0.2, fontSize: 7, color: "333333", align: "center"
        });

        const progress = Math.floor(((i + 1) / totalSlides) * 100);
        setStatus(prev => ({ ...prev, progress, message: `Building slide ${i + 1} of ${totalSlides}...` }));
        await new Promise(r => setTimeout(r, 10));
      }

      const fileName = `${videoFile?.name?.split('.')[0] || 'teardown_storyboard'}.pptx`;
      await pres.writeFile({ fileName });
      setStatus({ step: 'complete', progress: 100, message: 'Export Successful!' });
    } catch (err) {
      console.error(err);
      setStatus({ step: 'error', progress: 0, message: 'Failed to generate PPTX file.' });
    }
  };

  const handleUpdateItem = useCallback((id: string, updates: Partial<StoryboardItem>) => {
    setStoryboard(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  }, []);

  return (
    <div className="min-h-screen pb-20">
      {!isEmbed && <Header />}
      <main className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${isEmbed ? 'mt-4' : 'mt-12'}`}>
        {status.step === 'idle' && (
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight gradient-text">
                Visual Content Breakdown
              </h2>
              <p className="text-zinc-400 text-lg">
                Professional storyboard extraction. Verbatim scripts, visual descriptions, and pixel-perfect PPTX decks.
              </p>
            </div>
            <VideoUploader onSelect={processVideoData} />
          </div>
        )}
        {(status.step !== 'idle' && status.step !== 'complete' && status.step !== 'error') && <ProcessingState status={status} />}
        {status.step === 'error' && (
          <div className="max-w-2xl mx-auto p-8 glass rounded-3xl text-center border-red-900/50">
            <h3 className="text-xl font-bold mb-2">Analysis Failed</h3>
            <p className="text-zinc-400 mb-8 whitespace-pre-wrap">{status.message}</p>
            <button onClick={() => setStatus({ step: 'idle', progress: 0, message: '' })} className="px-6 py-2 bg-zinc-800 rounded-xl hover:bg-zinc-700 transition-colors">Try Another File</button>
          </div>
        )}
        {status.step === 'complete' && storyboard.length > 0 && (
          <StoryboardView 
            items={storyboard} 
            videoName={videoFile?.name || "Video Source"} 
            onReset={() => setStatus({ step: 'idle', progress: 0, message: '' })}
            onUpdateItem={handleUpdateItem}
            onExportPPTX={exportToPPTX}
            captureFrame={captureFrame}
          />
        )}
      </main>
      <video ref={hiddenVideoRef} className="hidden" muted playsInline crossOrigin="anonymous" />
    </div>
  );
};

export default App;
