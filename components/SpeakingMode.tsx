import React, { useState, useRef } from 'react';
import { Mic, Square, Upload, AlertTriangle, FileAudio, BarChart2, RefreshCw, Flag } from 'lucide-react';
import { Button } from './Button';
import { ScoreChart } from './ScoreChart';
import { assessSpeaking, blobToBase64 } from '../services/geminiService';
import { AssessmentResult, DifficultyLevel } from '../types';

export const SpeakingMode: React.FC = () => {
  const [mode, setMode] = useState<'record' | 'upload'>('record');
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [level, setLevel] = useState<DifficultyLevel>(DifficultyLevel.INTERMEDIATE);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setResult(null);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Microphone access denied. Please allow microphone permissions or use the upload feature.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert("File size is too large. Please upload a file smaller than 10MB.");
        return;
      }
      setAudioBlob(file);
      setAudioUrl(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!audioBlob) return;
    setIsAnalyzing(true);
    try {
      const base64Audio = await blobToBase64(audioBlob);
      // Determine mime type 
      const mimeType = audioBlob.type || 'audio/mp3'; // Default fallback if type is missing
      const data = await assessSpeaking(base64Audio, mimeType, level);
      setResult(data);
    } catch (error) {
      console.error(error);
      alert('Analysis failed. Please try again or check your API key.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Mic className="text-indigo-600" /> Speaking Assessment
          </h2>
          <p className="text-slate-500">Record your speech or upload audio for RSA-based scoring.</p>
        </div>
        <select 
          value={level}
          onChange={(e) => setLevel(e.target.value as DifficultyLevel)}
          className="p-2 border border-slate-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
        >
          {Object.values(DifficultyLevel).map((lvl) => (
            <option key={lvl} value={lvl}>{lvl}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          {/* Mode Toggles */}
          <div className="flex bg-slate-100 p-1 rounded-lg w-fit">
            <button
              onClick={() => { setMode('record'); reset(); }}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${mode === 'record' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Record Microphone
            </button>
            <button
              onClick={() => { setMode('upload'); reset(); }}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${mode === 'upload' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Upload Audio
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col items-center justify-center min-h-[300px] relative overflow-hidden">
             
             {/* Recording UI */}
             {mode === 'record' && (
               <>
                 {isRecording && (
                   <div className="absolute inset-0 flex items-center justify-center">
                     <div className="w-48 h-48 bg-red-50 rounded-full animate-ping opacity-75"></div>
                     <div className="w-32 h-32 bg-red-100 rounded-full animate-pulse absolute opacity-50"></div>
                   </div>
                 )}
                 <div className="z-10 text-center space-y-6 w-full flex flex-col items-center">
                   <div className="text-6xl font-mono text-slate-800 font-bold">
                     {isRecording ? "REC" : "00:00"}
                   </div>
                   
                   {!audioBlob && (
                     <button
                       onClick={isRecording ? stopRecording : startRecording}
                       className={`w-20 h-20 rounded-full flex items-center justify-center transition-all transform hover:scale-105 shadow-lg ${
                         isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-indigo-600 hover:bg-indigo-700'
                       }`}
                     >
                       {isRecording ? <Square className="text-white" size={32} /> : <Mic className="text-white" size={32} />}
                     </button>
                   )}
                 </div>
               </>
             )}

             {/* Upload UI */}
             {mode === 'upload' && !audioBlob && (
               <div className="text-center w-full">
                 <input 
                   type="file" 
                   accept="audio/*" 
                   onChange={handleFileUpload} 
                   className="hidden" 
                   ref={fileInputRef} 
                 />
                 <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 rounded-xl p-8 hover:bg-slate-50 cursor-pointer transition-colors flex flex-col items-center"
                 >
                    <div className="bg-indigo-50 p-4 rounded-full mb-4">
                      <Upload className="text-indigo-600" size={32} />
                    </div>
                    <p className="font-medium text-slate-700">Click to upload audio file</p>
                    <p className="text-sm text-slate-400 mt-2">MP3, WAV, M4A up to 10MB</p>
                 </div>
               </div>
             )}

             {/* Playback & Actions */}
             {audioBlob && (
                 <div className="space-y-4 w-full z-10">
                    <div className="flex items-center justify-center p-4 bg-slate-50 rounded-lg">
                      <FileAudio className="text-indigo-600 mr-2" />
                      <span className="text-sm font-medium text-slate-700">Audio Captured</span>
                    </div>
                    <audio src={audioUrl!} controls className="w-full" />
                    <div className="flex gap-2 justify-center">
                      <Button onClick={handleAnalyze} isLoading={isAnalyzing} icon={<BarChart2 size={18}/>}>
                        Analyze Recording
                      </Button>
                      <Button variant="secondary" onClick={reset} icon={<RefreshCw size={18}/>}>
                        {mode === 'record' ? 'Re-record' : 'New Upload'}
                      </Button>
                    </div>
                 </div>
             )}
          </div>
        </div>

        {/* Results Section */}
        {result ? (
          <div className="space-y-6 animate-fade-in">
             
             {/* Alerts */}
             {result.flagForReview && (
               <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl flex items-start gap-3">
                 <Flag className="text-orange-600 flex-shrink-0 mt-0.5" size={20} />
                 <div>
                   <h3 className="text-orange-800 font-semibold text-sm">Review Recommended</h3>
                   <p className="text-orange-700 text-sm mt-1">The AI is uncertain about this evaluation. Consider flagging for human tutor review.</p>
                   <button className="mt-2 text-xs font-semibold text-orange-800 underline hover:text-orange-900">
                     Flag for Human Review
                   </button>
                 </div>
               </div>
             )}

             {result.audioQualityWarning && (
               <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex items-start gap-3">
                 <AlertTriangle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                 <div>
                   <h3 className="text-red-800 font-semibold text-sm">Poor Audio Quality</h3>
                   <p className="text-red-700 text-sm mt-1">{result.audioQualityWarning}</p>
                 </div>
               </div>
             )}

             {/* Scores */}
             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-6">
                   <div>
                     <h3 className="font-bold text-slate-800 text-lg">Analysis Results</h3>
                     <p className="text-slate-500 text-sm">Based on RSA Rubric</p>
                   </div>
                   <div className="text-right">
                     <span className="block text-2xl font-bold text-indigo-600">{result.cefrLevel}</span>
                     <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">CEFR Level</span>
                   </div>
                </div>
                
                <div className="mb-6 flex justify-between items-center bg-slate-50 p-4 rounded-lg">
                  <span className="text-slate-600 font-medium">Overall Score</span>
                  <span className="text-xl font-bold text-slate-900">{result.overallScore}/10</span>
                </div>

                <ScoreChart data={result.criteriaScores} />
             </div>

             {/* Transcription */}
             <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Transcript</h3>
                <p className="text-slate-700 leading-relaxed italic">"{result.transcription}"</p>
             </div>

             {/* Errors */}
             {result.pronunciationErrors && result.pronunciationErrors.length > 0 && (
               <div className="bg-red-50 border border-red-100 p-4 rounded-xl">
                 <h3 className="text-red-800 font-semibold mb-2">Pronunciation & Fluency Issues</h3>
                 <div className="flex flex-wrap gap-2 mb-3">
                   {result.pronunciationErrors.map((word, i) => (
                     <span key={i} className="px-2 py-1 bg-white border border-red-200 text-red-600 rounded text-sm">
                       {word}
                     </span>
                   ))}
                 </div>
                 <p className="text-red-700 text-sm">{result.generalFeedback}</p>
               </div>
             )}
          </div>
        ) : (
          <div className="hidden lg:flex flex-col items-center justify-center h-full text-slate-400 bg-slate-100/50 rounded-xl border-2 border-dashed border-slate-200">
             <BarChart2 size={48} className="mb-4 opacity-50" />
             <p>Analysis results will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
};