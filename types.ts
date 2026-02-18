
export interface StoryboardItem {
  id: string;
  startTime: number;
  endTime: number;
  script: string;
  description: string;
  screenshot?: string;
}

export interface ProcessingStatus {
  step: 'idle' | 'uploading' | 'analyzing' | 'capturing' | 'complete' | 'error' | 'exporting';
  progress: number;
  message: string;
}

export enum ModelName {
  FLASH = 'gemini-3-flash-preview',
  PRO = 'gemini-3-pro-preview'
}
