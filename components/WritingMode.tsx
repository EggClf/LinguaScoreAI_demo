import React, { useState } from "react";
import {
  PenTool,
  CheckCircle,
  RefreshCcw,
  ArrowRight,
  Flag,
  BookOpen,
  UserCheck,
  ShieldCheck,
  BadgeCheck,
  HelpCircle,
  FileText,
  Info,
} from "lucide-react";
import { Button } from "./Button";
import { ScoreChart } from "./ScoreChart";
import { assessWriting } from "../services/geminiService";
import {
  AssessmentResult,
  TestType,
  TargetLevel,
  WritingCorrection,
  AssessmentStatus,
  AssessmentType,
  ConfidenceLevel,
} from "../types";
import { AVAILABLE_TUTORS } from "../services/mockData";

export const WritingMode: React.FC = () => {
  const [text, setText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [testType, setTestType] = useState<TestType>(TestType.IELTS);
  const [targetLevel, setTargetLevel] = useState<TargetLevel>(
    TargetLevel.INTERMEDIATE
  );
  const [selectedTutor, setSelectedTutor] = useState<string>("");
  const [isSentToTutor, setIsSentToTutor] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<"feedback" | "reference">(
    "feedback"
  );

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setIsAnalyzing(true);
    setIsSentToTutor(false);
    try {
      const data = await assessWriting(text, testType, targetLevel);
      const extendedResult: AssessmentResult = {
        ...data,
        id: `w-${Date.now()}`,
        status: AssessmentStatus.AI_ESTIMATE,
        userInput: text,
        testType: testType,
        targetLevel: targetLevel,
        type: AssessmentType.WRITING,
      };
      setResult(extendedResult);
    } catch (error) {
      console.error(error);
      alert("Failed to analyze text. Please check your API Key.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setText("");
    setIsSentToTutor(false);
    setSelectedTutor("");
  };

  const handleSendToTutor = () => {
    if (!selectedTutor) return;
    setTimeout(() => {
      setIsSentToTutor(true);
      if (result)
        setResult({ ...result, status: AssessmentStatus.PENDING_HUMAN });
    }, 1000);
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
            <PenTool className="text-indigo-600" /> Writing Assessment
          </h2>
          <p className="text-slate-500">
            IELTS-style evaluation with confidence mapping and band references.
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
        <div className="space-y-4">
          <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-200">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type your essay or paragraph here..."
              className="w-full h-80 p-4 rounded-lg resize-none outline-none focus:bg-slate-50 transition-colors text-slate-700"
              disabled={isAnalyzing || !!result}
            />
          </div>

          {!result ? (
            <div className="flex justify-end">
              <Button
                onClick={handleAnalyze}
                isLoading={isAnalyzing}
                disabled={text.length < 10}
                icon={<ArrowRight size={18} />}
              >
                Analyze Writing
              </Button>
            </div>
          ) : (
            <Button
              variant="secondary"
              onClick={handleReset}
              icon={<RefreshCcw size={18} />}
            >
              New Assessment
            </Button>
          )}
        </div>

        {result ? (
          <div className="space-y-6 animate-fade-in">
            {/* Verification & Score Header */}
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
              <div className="text-sm font-medium text-slate-400">
                ID: {result.id.split("-")[1]}
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
                  <Info size={16} /> Detailed Feedback
                </button>
                <button
                  onClick={() => setActiveSubTab("reference")}
                  className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 ${
                    activeSubTab === "reference"
                      ? "bg-white text-indigo-600 border-t-2 border-indigo-600"
                      : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  <FileText size={16} /> Reference Samples
                </button>
              </div>

              <div className="p-6">
                {activeSubTab === "feedback" ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-xs font-bold uppercase mb-1">
                          Overall Band
                        </p>
                        <div className="text-4xl font-black text-slate-800">
                          {result.overallScore}
                        </div>
                      </div>
                      <div className="bg-indigo-50 px-4 py-2 rounded-xl text-indigo-700 font-bold">
                        {result.cefrLevel}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-sm font-bold text-slate-500 uppercase flex items-center gap-2">
                        Criterion Breakdown
                        <HelpCircle size={14} className="opacity-50" />
                      </h4>
                      {result.criteriaScores.map((c, i) => (
                        <div
                          key={i}
                          className="group relative bg-slate-50 rounded-xl p-4 border border-slate-100 hover:border-indigo-200 transition-colors"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-700">
                                {c.criteria}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getConfidenceColor(
                                  c.confidence
                                )}`}
                              >
                                {c.confidence} Confidence
                              </span>
                            </div>
                            <div className="text-sm font-bold text-indigo-600">
                              {c.score}/{c.maxScore}
                            </div>
                          </div>
                          <p className="text-xs text-slate-500 mb-3">
                            {c.feedback}
                          </p>

                          <div className="pt-3 border-t border-slate-200/60">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1.5 flex items-center gap-1">
                              <Info size={10} /> Why this score?
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {c.keyFactors.map((f, j) => (
                                <span
                                  key={j}
                                  className="bg-white px-2 py-0.5 rounded border border-slate-200 text-[10px] text-slate-600 font-medium italic"
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
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                    <h3 className="font-bold text-slate-800">
                      Topic Reference Answers
                    </h3>
                    <p className="text-xs text-slate-500 -mt-4">
                      Compare your work with these model samples at different
                      band levels.
                    </p>

                    <div className="space-y-6">
                      {result.referenceAnswers?.map((ref, i) => (
                        <div
                          key={i}
                          className="border border-slate-200 rounded-xl overflow-hidden"
                        >
                          <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
                            <span className="text-sm font-bold text-indigo-700">
                              Band {ref.band} Sample
                            </span>
                            <CheckCircle
                              size={14}
                              className="text-emerald-500"
                            />
                          </div>
                          <div className="p-4 bg-white">
                            <p className="text-sm text-slate-700 leading-relaxed mb-3 italic">
                              "{ref.content}"
                            </p>
                            <div className="bg-indigo-50/50 p-3 rounded-lg border border-indigo-100">
                              <p className="text-[11px] font-bold text-indigo-800 uppercase mb-1">
                                Why Band {ref.band}?
                              </p>
                              <p className="text-[11px] text-indigo-700 leading-snug">
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

            {/* Recommendations Section */}
            <div className="bg-indigo-50 rounded-xl p-5 border border-indigo-100">
              <h3 className="font-semibold text-indigo-900 flex items-center gap-2 mb-4">
                <BookOpen size={20} /> Recommendations
              </h3>
              <div className="space-y-3">
                {result.recommendedLessons?.map((lesson, idx) => (
                  <div
                    key={idx}
                    className="bg-white p-3 rounded-lg border border-indigo-100 shadow-sm"
                  >
                    <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wide">
                      {lesson.category}
                    </span>
                    <h4 className="font-semibold text-slate-800 text-sm mt-0.5">
                      {lesson.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {lesson.rationale}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Request Human Review */}
            {!isSentToTutor &&
              result.status !== AssessmentStatus.HUMAN_VERIFIED && (
                <div className="bg-slate-100 border border-slate-200 p-4 rounded-xl">
                  <div className="flex gap-2">
                    <select
                      className="flex-1 text-xs p-2 rounded border border-slate-300 bg-white"
                      value={selectedTutor}
                      onChange={(e) => setSelectedTutor(e.target.value)}
                    >
                      <option value="">
                        Select a Tutor for Expert Review...
                      </option>
                      {AVAILABLE_TUTORS.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                    <Button
                      variant="primary"
                      className="!py-1 !px-4 !text-xs !bg-slate-800"
                      onClick={handleSendToTutor}
                      disabled={!selectedTutor}
                    >
                      Request Review
                    </Button>
                  </div>
                </div>
              )}
          </div>
        ) : (
          <div className="hidden lg:flex flex-col items-center justify-center h-full text-slate-400 bg-slate-100/50 rounded-xl border-2 border-dashed border-slate-200">
            <PenTool size={48} className="mb-4 opacity-50" />
            <p>Results will show criterion confidence & reference answers</p>
          </div>
        )}
      </div>
    </div>
  );
};
