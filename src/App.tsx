import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Camera, 
  Settings, 
  Zap, 
  ZapOff, 
  Clock, 
  RotateCcw, 
  Image as ImageIcon, 
  ChevronUp,
  Maximize2,
  Circle,
  Sun,
  Focus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { CameraMode, CameraSettings, COLORS } from './types';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [mode, setMode] = useState<CameraMode>('PHOTO');
  const [settings, setSettings] = useState<CameraSettings>({
    flash: 'off',
    hdr: true,
    timer: 0,
    resolution: '4:3',
  });
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [exposure, setExposure] = useState(0);
  const [focusPoint, setFocusPoint] = useState<{ x: number, y: number } | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: mode === 'VIDEO'
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  }, [mode]);

  useEffect(() => {
    startCamera();
    return () => {
      streamRef.current?.getTracks().forEach(track => track.stop());
    };
  }, [startCamera]);

  const handleCapture = async () => {
    if (isProcessing) return;

    if (mode === 'VIDEO') {
      setIsRecording(!isRecording);
      return;
    }

    setIsProcessing(true);
    
    // Simulate capture delay for "Enhanced Processing"
    setTimeout(() => {
      if (videoRef.current && canvasRef.current) {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0);
          // Apply some "Photon" filters (simulated)
          ctx.filter = 'contrast(1.1) saturate(1.1) brightness(1.05)';
          ctx.drawImage(canvas, 0, 0);
          setCapturedImage(canvas.toDataURL('image/jpeg'));
        }
      }
      setIsProcessing(false);
    }, 800);
  };

  const handleViewfinderClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setFocusPoint({ x, y });
    
    // Auto-hide focus ring
    setTimeout(() => setFocusPoint(null), 2000);
  };

  const modes: CameraMode[] = ['NIGHT', 'PORTRAIT', 'PHOTO', 'VIDEO', 'PRO'];

  return (
    <div className="fixed inset-0 bg-black text-white font-sans overflow-hidden select-none">
      {/* Viewfinder */}
      <div 
        className="relative w-full h-full flex items-center justify-center cursor-crosshair"
        onClick={handleViewfinderClick}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={cn(
            "w-full h-full object-cover transition-opacity duration-500",
            settings.resolution === '4:3' ? 'aspect-[3/4]' : 'aspect-video'
          )}
        />
        
        {/* Focus Ring */}
        <AnimatePresence>
          {focusPoint && (
            <motion.div
              initial={{ scale: 1.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="absolute pointer-events-none"
              style={{ left: `${focusPoint.x}%`, top: `${focusPoint.y}%`, transform: 'translate(-50%, -50%)' }}
            >
              <div className="w-16 h-16 border-2 border-yellow-400 rounded-sm flex items-center justify-center">
                <div className="w-1 h-1 bg-yellow-400 rounded-full" />
              </div>
              <motion.div 
                className="absolute -right-8 top-0 bottom-0 flex flex-col items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Sun size={16} className="text-yellow-400 mb-1" />
                <div className="w-0.5 h-12 bg-white/30 relative">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg" />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pro Mode Controls */}
        <AnimatePresence>
          {mode === 'PRO' && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col gap-6 z-20"
            >
              <div className="flex flex-col items-center gap-2">
                <span className="text-[10px] font-bold text-white/40 uppercase">ISO</span>
                <div className="w-1 h-24 bg-white/20 rounded-full relative">
                  <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-3 h-3 bg-yellow-400 rounded-full shadow-lg" />
                </div>
                <span className="text-[10px] font-bold text-yellow-400">400</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <span className="text-[10px] font-bold text-white/40 uppercase">S</span>
                <div className="w-1 h-24 bg-white/20 rounded-full relative">
                  <div className="absolute bottom-1/2 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full shadow-lg" />
                </div>
                <span className="text-[10px] font-bold">1/125</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <span className="text-[10px] font-bold text-white/40 uppercase">WB</span>
                <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-[10px] font-bold">
                  AUTO
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Grid Lines (Optional) */}
        <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 opacity-20">
          <div className="border-r border-b border-white/50" />
          <div className="border-r border-b border-white/50" />
          <div className="border-b border-white/50" />
          <div className="border-r border-b border-white/50" />
          <div className="border-r border-b border-white/50" />
          <div className="border-b border-white/50" />
          <div className="border-r border-white/50" />
          <div className="border-r border-white/50" />
          <div />
        </div>
      </div>

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent z-20">
        <button onClick={() => setShowSettings(true)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <Settings size={24} />
        </button>
        
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setSettings(s => ({ ...s, flash: s.flash === 'off' ? 'on' : 'off' }))}
            className={cn("p-2 rounded-full transition-colors", settings.flash === 'on' ? "text-yellow-400 bg-yellow-400/10" : "text-white")}
          >
            {settings.flash === 'on' ? <Zap size={22} /> : <ZapOff size={22} />}
          </button>
          
          <button 
            onClick={() => setSettings(s => ({ ...s, hdr: !s.hdr }))}
            className={cn("text-xs font-bold px-2 py-1 rounded border transition-colors", settings.hdr ? "border-blue-400 text-blue-400 bg-blue-400/10" : "border-white/40 text-white/40")}
          >
            HDR
          </button>

          <button 
            onClick={() => setSettings(s => ({ ...s, timer: s.timer === 0 ? 3 : s.timer === 3 ? 10 : 0 }))}
            className={cn("p-2 rounded-full transition-colors", settings.timer > 0 ? "text-blue-400 bg-blue-400/10" : "text-white")}
          >
            <Clock size={22} />
            {settings.timer > 0 && <span className="absolute top-0 right-0 text-[10px] font-bold">{settings.timer}s</span>}
          </button>
        </div>

        <div className="w-10 h-10" /> {/* Spacer */}
      </div>

      {/* Zoom Controls */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col items-center gap-4 z-20">
        <div className="flex flex-col items-center bg-black/40 backdrop-blur-md rounded-full p-1 border border-white/10">
          {[2, 1, 0.6].map((z) => (
            <button
              key={z}
              onClick={() => setZoom(z)}
              className={cn(
                "w-8 h-8 rounded-full text-[10px] font-bold flex items-center justify-center transition-all",
                zoom === z ? "bg-white text-black scale-110" : "text-white/60 hover:text-white"
              )}
            >
              {z}x
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-12 pb-8 z-20">
        {/* Mode Picker */}
        <div className="relative flex justify-center mb-8 overflow-hidden">
          <div className="flex items-center gap-8 px-12">
            {modes.map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={cn(
                  "text-xs font-bold tracking-widest transition-all duration-300 whitespace-nowrap",
                  mode === m ? "text-yellow-400 scale-110" : "text-white/40 hover:text-white/60"
                )}
              >
                {m}
              </button>
            ))}
          </div>
          <div className="absolute bottom-[-8px] left-1/2 -translate-x-1/2 w-1 h-1 bg-yellow-400 rounded-full" />
        </div>

        {/* Main Actions */}
        <div className="flex items-center justify-around px-8">
          {/* Gallery */}
          <button className="w-12 h-12 rounded-full bg-white/10 border border-white/20 overflow-hidden flex items-center justify-center group">
            {capturedImage ? (
              <img src={capturedImage} className="w-full h-full object-cover" alt="Last capture" />
            ) : (
              <ImageIcon size={24} className="text-white/60 group-hover:text-white transition-colors" />
            )}
          </button>

          {/* Shutter */}
          <div className="relative">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleCapture}
              disabled={isProcessing}
              className={cn(
                "w-20 h-20 rounded-full border-4 flex items-center justify-center transition-all duration-300",
                mode === 'VIDEO' ? "border-red-500/30" : "border-white/30",
                isProcessing && "opacity-50"
              )}
            >
              <div className={cn(
                "transition-all duration-300",
                mode === 'VIDEO' 
                  ? (isRecording ? "w-8 h-8 bg-red-500 rounded-sm" : "w-16 h-16 bg-red-500 rounded-full")
                  : "w-16 h-16 bg-white rounded-full"
              )} />
            </motion.button>
            
            {isProcessing && (
              <svg className="absolute inset-0 w-20 h-20 -rotate-90 pointer-events-none">
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  fill="none"
                  stroke="white"
                  strokeWidth="4"
                  strokeDasharray="226"
                  className="animate-[dash_1s_ease-in-out_infinite]"
                />
              </svg>
            )}
          </div>

          {/* Camera Switch */}
          <button 
            onClick={startCamera}
            className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <RotateCcw size={24} />
          </button>
        </div>
      </div>

      {/* Processing Overlay */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/20 backdrop-blur-[2px] z-50 flex flex-col items-center justify-center"
          >
            <div className="text-xs font-bold tracking-[0.2em] mb-4 text-white/80">ENHANCING IMAGE</div>
            <div className="w-48 h-1 bg-white/20 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-blue-400"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 0.8 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Modal (Simplified) */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute inset-0 bg-[#1c1c1c] z-[100] p-6 flex flex-col"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold">Settings</h2>
              <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-white/10 rounded-full">
                <ChevronUp className="rotate-180" />
              </button>
            </div>

            <div className="space-y-6">
              <section>
                <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">General</h3>
                <div className="bg-white/5 rounded-2xl overflow-hidden">
                  <div className="p-4 flex items-center justify-between border-b border-white/5">
                    <span>Save Location</span>
                    <div className="w-10 h-5 bg-blue-500 rounded-full relative">
                      <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                    </div>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <span>Grid Lines</span>
                    <div className="w-10 h-5 bg-white/20 rounded-full relative">
                      <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full" />
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">Photo</h3>
                <div className="bg-white/5 rounded-2xl overflow-hidden">
                  <div className="p-4 flex items-center justify-between border-b border-white/5">
                    <span>HDR+ Enhanced</span>
                    <span className="text-blue-400 text-sm font-bold">ON</span>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <span>RAW + JPEG</span>
                    <span className="text-white/40 text-sm">OFF</span>
                  </div>
                </div>
              </section>
            </div>

            <div className="mt-auto text-center text-[10px] text-white/20 uppercase tracking-widest">
              PhotonCamera Web v1.0.0
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <canvas ref={canvasRef} className="hidden" />

      <style>{`
        @keyframes dash {
          0% { stroke-dashoffset: 226; }
          50% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -226; }
        }
      `}</style>
    </div>
  );
}
