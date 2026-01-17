import React, { useState, useRef } from "react";
import {
  Mic,
  Square,
  Upload,
  BarChart2,
  RefreshCw,
  BadgeCheck,
  ShieldCheck,
  BookOpen,
  Info,
  FileText,
  CheckCircle,
  HelpCircle,
} from "lucide-react";
import { Button } from "./Button";
import { ScoreChart } from "./ScoreChart";
import { assessSpeaking, blobToBase64 } from "../services/geminiService";
import {
  AssessmentResult,
  TestType,
  TargetLevel,
  AssessmentStatus,
  AssessmentType,
  ConfidenceLevel,
} from "../types";
import { AVAILABLE_TUTORS } from "../services/mockData";

export const SpeakingMode: React.FC = () => {
  const [mode, setMode] = useState<"record" | "upload">("record");
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [testType, setTestType] = useState<TestType>(TestType.IELTS);
  const [targetLevel, setTargetLevel] = useState<TargetLevel>(
    TargetLevel.INTERMEDIATE
  );
  const [activeSubTab, setActiveSubTab] = useState<"feedback" | "reference">(
    "feedback"
  );

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
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };
      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((track) => track.stop());
      };
      mediaRecorder.start();
      setIsRecording(true);
      setResult(null);
    } catch (err) {
      alert("Microphone access denied.");
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
      const data = await assessSpeaking(
        base64Audio,
        audioBlob.type || "audio/mp3",
        testType,
        targetLevel
      );
      const extendedResult: AssessmentResult = {
        ...data,
        id: `s-${Date.now()}`,
        status: AssessmentStatus.AI_ESTIMATE,
        userInput: "Audio Recording",
        testType: testType,
        targetLevel: targetLevel,
        type: AssessmentType.SPEAKING,
      };
      setResult(extendedResult);
    } catch (error) {
      console.error(error);
      alert("Analysis failed.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setResult(null);
  };

  const getConfidenceColor = (conf?: ConfidenceLevel) => {
    switch (conf) {
      case ConfidenceLevel.HIGH:
        return "bg-green-100 text-green-700";
      case ConfidenceLevel.MEDIUM:
        return "bg-yellow-100 text-yellow-700";
      case ConfidenceLevel.LOW:
        return "bg-red-100 text-red-700";
      default:
        return "bg-slate-100 text-slate-500";
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Mic className="text-indigo-600" /> Speaking Assessment
          </h2>
          <p className="text-slate-500">
            Intelligent pronunciation analysis & fluency benchmarks.
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={testType}
            onChange={(e) => setTestType(e.target.value as TestType)}
            className="p-2 border border-slate-300 rounded-lg bg-white text-sm"
          >
            {Object.values(TestType).map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <select
            value={targetLevel}
            onChange={(e) => setTargetLevel(e.target.value as TargetLevel)}
            className="p-2 border border-slate-300 rounded-lg bg-white text-sm"
          >
            {Object.values(TargetLevel).map((lvl) => (
              <option key={lvl} value={lvl}>
                {lvl}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="flex bg-slate-100 p-1 rounded-lg w-fit">
            <button
              onClick={() => {
                setMode("record");
                reset();
              }}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                mode === "record"
                  ? "bg-white shadow text-indigo-600"
                  : "text-slate-500"
              }`}
            >
              Record
            </button>
            <button
              onClick={() => {
                setMode("upload");
                reset();
              }}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                mode === "upload"
                  ? "bg-white shadow text-indigo-600"
                  : "text-slate-500"
              }`}
            >
              Upload
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-8 flex flex-col items-center justify-center min-h-[300px] shadow-sm">
            {audioBlob ? (
              <div className="space-y-4 w-full">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <audio src={audioUrl!} controls className="w-full" />
                </div>
                <div className="flex gap-2 justify-center">
                  <Button
                    onClick={handleAnalyze}
                    isLoading={isAnalyzing}
                    icon={<BarChart2 size={18} />}
                  >
                    Analyze Speech
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={reset}
                    icon={<RefreshCw size={18} />}
                  >
                    Reset
                  </Button>
                </div>
              </div>
            ) : mode === "record" ? (
              <div className="text-center">
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
                    isRecording
                      ? "bg-red-500 animate-pulse scale-110 shadow-lg shadow-red-200"
                      : "bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100"
                  }`}
                >
                  {isRecording ? (
                    <Square className="text-white" size={36} />
                  ) : (
                    <Mic className="text-white" size={36} />
                  )}
                </button>
                <p className="mt-4 font-medium text-slate-600">
                  {isRecording ? "Listening..." : "Click to speak"}
                </p>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 p-12 cursor-pointer flex flex-col items-center hover:bg-slate-50 transition-colors rounded-xl"
              >
                <Upload className="text-indigo-600 mb-4" size={40} />
                <p className="font-semibold text-slate-700">
                  Drop audio file here
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  MP3, WAV, or WEBM (Max 10MB)
                </p>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  ref={fileInputRef}
                />
              </div>
            )}
          </div>
        </div>

        {result ? (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full w-fit text-xs font-bold uppercase tracking-wider ${
                  result.status === AssessmentStatus.HUMAN_VERIFIED
                    ? "bg-green-100 text-green-700"
                    : "bg-indigo-100 text-indigo-700"
                }`}
              >
                {result.status === AssessmentStatus.HUMAN_VERIFIED ? (
                  <BadgeCheck size={14} />
                ) : (
                  <ShieldCheck size={14} />
                )}
                {result.status === AssessmentStatus.HUMAN_VERIFIED
                  ? "Human-Verified"
                  : "AI Estimate"}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex bg-slate-100 border-b border-slate-200">
                <button
                  onClick={() => setActiveSubTab("feedback")}
                  className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 ${
                    activeSubTab === "feedback"
                      ? "bg-white text-indigo-600 border-t-2 border-indigo-600"
                      : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  <Info size={16} /> Analysis
                </button>
                <button
                  onClick={() => setActiveSubTab("reference")}
                  className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 ${
                    activeSubTab === "reference"
                      ? "bg-white text-indigo-600 border-t-2 border-indigo-600"
                      : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  <FileText size={16} /> Transcripts
                </button>
              </div>

              <div className="p-6">
                {activeSubTab === "feedback" ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="text-4xl font-black text-indigo-600">
                        {result.overallScore}
                      </div>
                      <div className="text-right">
                        <span className="block text-lg font-bold text-slate-700">
                          {result.cefrLevel}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                          CEFR Rank
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        Performance Markers
                        <HelpCircle size={12} />
                      </h4>
                      {result.criteriaScores.map((c, i) => (
                        <div
                          key={i}
                          className="bg-slate-50 rounded-xl p-4 border border-slate-100"
                        >
                          <div className="flex justify-between items-start mb-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-slate-700">
                                {c.criteria}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-[4px] text-[9px] font-black uppercase ${getConfidenceColor(
                                  c.confidence
                                )}`}
                              >
                                {c.confidence} Conf.
                              </span>
                            </div>
                            <span className="text-sm font-bold text-slate-400">
                              {c.score}/10
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 italic mb-2">
                            "{c.feedback}"
                          </p>

                          <div className="pt-2 mt-2 border-t border-slate-200/50">
                            <div className="flex flex-wrap gap-1">
                              {c.keyFactors.map((f, j) => (
                                <span
                                  key={j}
                                  className="bg-white px-1.5 py-0.5 rounded text-[9px] text-slate-600 border border-slate-200 font-medium"
                                >
                                  {f}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <ScoreChart data={result.criteriaScores} />
                  </div>
                ) : (
                  <div className="space-y-5">
                    <h3 className="font-bold text-slate-800 text-sm">
                      Topic Reference Transcripts
                    </h3>
                    <div className="space-y-4">
                      {result.referenceAnswers?.map((ref, i) => (
                        <div
                          key={i}
                          className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm"
                        >
                          <div className="bg-indigo-600 px-3 py-1.5 text-white flex justify-between items-center">
                            <span className="text-[10px] font-bold uppercase">
                              Band {ref.band} Benchmark
                            </span>
                            <CheckCircle size={12} />
                          </div>
                          <div className="p-4">
                            <p className="text-xs text-slate-700 leading-relaxed mb-3 font-medium">
                              "{ref.content}"
                            </p>
                            <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-100">
                              <p className="text-[10px] text-emerald-800 leading-tight">
                                <span className="font-bold">
                                  Key Distinction:
                                </span>{" "}
                                {ref.rationale}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-100">
              <h3 className="font-semibold text-emerald-900 flex items-center gap-2 mb-3">
                <BookOpen size={18} /> Training Path
              </h3>
              <div className="space-y-2">
                {result.learningPath?.map((step, i) => (
                  <div key={i} className="flex gap-2 text-xs text-emerald-800">
                    <span className="flex-shrink-0 w-4 h-4 bg-emerald-200 rounded-full flex items-center justify-center text-[10px] font-bold">
                      {i + 1}
                    </span>
                    <p>{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="hidden lg:flex flex-col items-center justify-center bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 h-full">
            <BarChart2 size={48} className="text-slate-300 mb-2" />
            <p className="text-slate-400 font-medium">
              Detailed Speech Analysis will appear here
            </p>
            <p className="text-xs text-slate-300 mt-1">
              Including confidence mapping & reference transcripts
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
