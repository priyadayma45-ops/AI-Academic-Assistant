import React, { useState } from 'react';
import { useToast } from '../../components/Toast';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card, { CardBody } from '../../components/Card';
import Button from '../../components/Button';
import aiService from '../../services/aiService';
import { 
  Sparkles, FileText, CheckCircle, 
  RefreshCw, Copy, Check, Info, Trash2, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const AiAssistant = () => {
  const { addToast } = useToast();
  
  // Tab control
  const [activeTab, setActiveTab] = useState('grammar'); // grammar, rewrite, summarize

  // Input states
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Grammar states
  const [grammarResult, setGrammarResult] = useState(null);

  // Rewrite states
  const [rewriteTone, setRewriteTone] = useState('ACADEMIC');
  const [rewriteResult, setRewriteResult] = useState('');

  // Summarize states
  const [summaryLength, setSummaryLength] = useState('SHORT');
  const [summaryResult, setSummaryResult] = useState('');

  // Character limit rules
  const LIMITS = {
    grammar: 10000,
    rewrite: 5000,
    summarize: 15000
  };

  // Change tab reset
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setInputText('');
    setGrammarResult(null);
    setRewriteResult('');
    setSummaryResult('');
  };

  // Action: Check Grammar
  const handleCheckGrammar = async () => {
    if (!inputText.trim()) {
      addToast('error', 'Please enter some text to check');
      return;
    }
    if (inputText.length > LIMITS.grammar) {
      addToast('error', `Text length exceeds maximum limit of ${LIMITS.grammar} characters`);
      return;
    }

    setLoading(true);
    setGrammarResult(null);
    try {
      const res = await aiService.checkGrammar(inputText);
      if (res.success) {
        setGrammarResult(res.data);
        if (res.data.errors.length === 0) {
          addToast('success', 'No spelling or grammar errors found!');
        } else {
          addToast('success', `Grammar check completed. Found ${res.data.errors.length} suggestions.`);
        }
      }
    } catch (err) {
      console.error(err);
      addToast('error', err.message || 'Failed to complete grammar check');
    } finally {
      setLoading(false);
    }
  };

  // Action: Rewrite Text
  const handleRewrite = async () => {
    if (!inputText.trim()) {
      addToast('error', 'Please enter some text to rewrite');
      return;
    }
    if (inputText.length > LIMITS.rewrite) {
      addToast('error', `Text length exceeds maximum limit of ${LIMITS.rewrite} characters`);
      return;
    }

    setLoading(true);
    setRewriteResult('');
    try {
      const res = await aiService.rewriteText(inputText, rewriteTone);
      if (res.success) {
        setRewriteResult(res.data);
        addToast('success', 'Text rewritten successfully!');
      }
    } catch (err) {
      console.error(err);
      addToast('error', err.message || 'Failed to rewrite text');
    } finally {
      setLoading(false);
    }
  };

  // Action: Summarize Text
  const handleSummarize = async () => {
    if (!inputText.trim()) {
      addToast('error', 'Please enter some text to summarize');
      return;
    }
    if (inputText.length > LIMITS.summarize) {
      addToast('error', `Text length exceeds maximum limit of ${LIMITS.summarize} characters`);
      return;
    }

    setLoading(true);
    setSummaryResult('');
    try {
      const res = await aiService.summarizeText(inputText, summaryLength);
      if (res.success) {
        setSummaryResult(res.data);
        addToast('success', 'Summary generated successfully!');
      }
    } catch (err) {
      console.error(err);
      addToast('error', err.message || 'Failed to generate summary');
    } finally {
      setLoading(false);
    }
  };

  // Copy to clipboard
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    addToast('success', 'Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  // Apply single correction
  const handleApplyCorrection = (original, corrected) => {
    if (!inputText.includes(original)) {
      addToast('info', 'Text was modified. Cannot apply suggestion automatically.');
      return;
    }
    const updated = inputText.replace(original, corrected);
    setInputText(updated);
    
    // Update local grammarResult state to filter out the corrected error
    if (grammarResult) {
      const filteredErrors = grammarResult.errors.filter(e => e.originalText !== original);
      setGrammarResult({
        ...grammarResult,
        errors: filteredErrors,
        fullyCorrectedText: grammarResult.fullyCorrectedText.replace(original, corrected)
      });
    }
    addToast('success', `Applied correction: "${original}" → "${corrected}"`);
  };

  // Apply all corrections
  const handleApplyAllCorrections = () => {
    if (grammarResult && grammarResult.fullyCorrectedText) {
      setInputText(grammarResult.fullyCorrectedText);
      setGrammarResult({
        ...grammarResult,
        errors: []
      });
      addToast('success', 'Applied all grammar corrections successfully!');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            AI Writing Assistant <Sparkles className="w-5 h-5 text-brand-500" />
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Improve your academic work with grammar checks, structural rewriting, and summaries.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 dark:border-darkbg-border gap-6">
          <button
            onClick={() => handleTabChange('grammar')}
            className={`pb-3 font-semibold text-sm tracking-wide transition-all border-b-2 outline-none ${
              activeTab === 'grammar'
                ? 'border-brand-500 text-brand-500'
                : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-white'
            }`}
          >
            Grammar Checker
          </button>
          <button
            onClick={() => handleTabChange('rewrite')}
            className={`pb-3 font-semibold text-sm tracking-wide transition-all border-b-2 outline-none ${
              activeTab === 'rewrite'
                ? 'border-brand-500 text-brand-500'
                : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-white'
            }`}
          >
            Context Rewriter
          </button>
          <button
            onClick={() => handleTabChange('summarize')}
            className={`pb-3 font-semibold text-sm tracking-wide transition-all border-b-2 outline-none ${
              activeTab === 'summarize'
                ? 'border-brand-500 text-brand-500'
                : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-white'
            }`}
          >
            Summarizer
          </button>
        </div>

        {/* Dual panel Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Input Panel */}
          <div className="lg:col-span-6">
            <Card className="shadow-lg">
              <CardBody className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="font-bold text-slate-900 dark:text-white">
                    {activeTab === 'grammar' && 'Source Draft'}
                    {activeTab === 'rewrite' && 'Original Text'}
                    {activeTab === 'summarize' && 'Full Assignment Text'}
                  </h2>
                  <span className="text-xs text-slate-400 font-semibold">
                    {inputText.length} / {LIMITS[activeTab]} chars
                  </span>
                </div>

                <div className="relative">
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type or paste your academic writing here..."
                    className="w-full h-96 p-4 rounded-xl border border-slate-200 dark:border-darkbg-border bg-slate-50/50 dark:bg-darkbg-card text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none resize-none transition-all text-sm leading-relaxed"
                  />
                  {inputText.trim() && (
                    <button
                      onClick={() => setInputText('')}
                      className="absolute bottom-4 right-4 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
                      title="Clear text"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Tab Specific Controls */}
                {activeTab === 'rewrite' && (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                      Target Tone:
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {['ACADEMIC', 'PROFESSIONAL', 'CREATIVE', 'SIMPLIFIED'].map((tone) => (
                        <button
                          key={tone}
                          type="button"
                          onClick={() => setRewriteTone(tone)}
                          className={`py-2 text-xs font-semibold rounded-lg tracking-wide border transition-all ${
                            rewriteTone === tone
                              ? 'bg-brand-500 border-brand-500 text-white shadow-md'
                              : 'bg-white dark:bg-darkbg-card border-slate-200 dark:border-darkbg-border text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                          }`}
                        >
                          {tone.toLowerCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'summarize' && (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                      Summary Format:
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'SHORT', label: 'Short' },
                        { id: 'MEDIUM', label: 'Medium' },
                        { id: 'BULLET_POINTS', label: 'Bullets List' }
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setSummaryLength(item.id)}
                          className={`py-2 text-xs font-semibold rounded-lg tracking-wide border transition-all ${
                            summaryLength === item.id
                              ? 'bg-brand-500 border-brand-500 text-white shadow-md'
                              : 'bg-white dark:bg-darkbg-card border-slate-200 dark:border-darkbg-border text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Trigger Button */}
                {activeTab === 'grammar' && (
                  <Button
                    onClick={handleCheckGrammar}
                    loading={loading}
                    className="w-full"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Verify Spelling & Grammar
                  </Button>
                )}

                {activeTab === 'rewrite' && (
                  <Button
                    onClick={handleRewrite}
                    loading={loading}
                    className="w-full"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Rewrite Content
                  </Button>
                )}

                {activeTab === 'summarize' && (
                  <Button
                    onClick={handleSummarize}
                    loading={loading}
                    className="w-full"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Generate Summary
                  </Button>
                )}
              </CardBody>
            </Card>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-6">
            <AnimatePresence mode="wait">
              {/* Grammar Results Display */}
              {activeTab === 'grammar' && (
                <motion.div
                  key="grammar-panel"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <Card className="shadow-lg">
                    <CardBody className="p-6 min-h-[464px] flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-center mb-6">
                          <h2 className="font-bold text-slate-900 dark:text-white">AI Coach Feedback</h2>
                          {grammarResult && grammarResult.errors.length > 0 && (
                            <button
                              onClick={handleApplyAllCorrections}
                              className="text-xs font-bold text-brand-500 hover:underline"
                            >
                              Apply All Suggestions
                            </button>
                          )}
                        </div>

                        {loading ? (
                          <div className="flex flex-col items-center justify-center h-80 gap-2 text-slate-400">
                            <RefreshCw className="w-8 h-8 animate-spin text-brand-500 mb-2" />
                            <span className="text-sm font-semibold">Running grammar audit...</span>
                          </div>
                        ) : grammarResult ? (
                          grammarResult.errors.length > 0 ? (
                            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                              {grammarResult.errors.map((error, idx) => (
                                <div 
                                  key={idx} 
                                  className="p-4 rounded-xl border border-slate-100 dark:border-darkbg-border bg-slate-50/50 dark:bg-darkbg-card space-y-2 hover:border-brand-500/30 transition-colors"
                                >
                                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                                    <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 dark:bg-red-950/20 dark:text-red-400 line-through">
                                      {error.originalText}
                                    </span>
                                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400">
                                      {error.correctedText}
                                    </span>
                                    
                                    <button
                                      onClick={() => handleApplyCorrection(error.originalText, error.correctedText)}
                                      className="ml-auto text-brand-500 hover:underline"
                                    >
                                      Apply
                                    </button>
                                  </div>
                                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-start gap-1.5 leading-relaxed">
                                    <Info className="w-3.5 h-3.5 text-brand-500 shrink-0 mt-0.5" />
                                    <span>{error.explanation}</span>
                                  </p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center h-80 gap-3 text-slate-400 text-center">
                              <CheckCircle className="w-12 h-12 text-emerald-500 stroke-[1.5]" />
                              <div>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">Grammatically Correct!</p>
                                <p className="text-xs text-slate-400 mt-1 max-w-[250px]">
                                  No spelling errors or styling problems detected in your draft.
                                </p>
                              </div>
                            </div>
                          )
                        ) : (
                          <div className="flex flex-col items-center justify-center h-80 gap-3 text-slate-400 text-center">
                            <FileText className="w-12 h-12 stroke-[1.5] text-slate-300" />
                            <div>
                              <p className="text-sm font-semibold">Ready for Review</p>
                              <p className="text-xs text-slate-400 mt-1 max-w-[250px]">
                                Enter copy in the draft editor and click Verify to start checks.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardBody>
                  </Card>
                </motion.div>
              )}

              {/* Rewrite Results Display */}
              {activeTab === 'rewrite' && (
                <motion.div
                  key="rewrite-panel"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Card className="shadow-lg">
                    <CardBody className="p-6 min-h-[464px] flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h2 className="font-bold text-slate-900 dark:text-white">Rewritten Output</h2>
                          {rewriteResult && (
                            <button
                              onClick={() => handleCopy(rewriteResult)}
                              className="p-2 text-slate-500 hover:text-brand-500 rounded-lg hover:bg-slate-100 dark:hover:bg-darkbg-card transition-colors flex items-center gap-1.5 text-xs font-semibold"
                            >
                              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                              Copy
                            </button>
                          )}
                        </div>

                        {loading ? (
                          <div className="flex flex-col items-center justify-center h-80 gap-2 text-slate-400">
                            <RefreshCw className="w-8 h-8 animate-spin text-brand-500 mb-2" />
                            <span className="text-sm font-semibold">Rephrasing draft text...</span>
                          </div>
                        ) : rewriteResult ? (
                          <div className="p-4 rounded-xl border border-slate-200 dark:border-darkbg-border bg-slate-50/30 dark:bg-darkbg-card h-80 overflow-y-auto text-sm leading-relaxed whitespace-pre-wrap text-slate-900 dark:text-slate-100">
                            {rewriteResult}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-80 gap-3 text-slate-400 text-center">
                            <RefreshCw className="w-12 h-12 stroke-[1.5] text-slate-300" />
                            <div>
                              <p className="text-sm font-semibold">No rewrites generated</p>
                              <p className="text-xs text-slate-400 mt-1 max-w-[250px]">
                                Pick a target tone constraint and click Rewrite Content to view results.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardBody>
                  </Card>
                </motion.div>
              )}

              {/* Summarize Results Display */}
              {activeTab === 'summarize' && (
                <motion.div
                  key="summarize-panel"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Card className="shadow-lg">
                    <CardBody className="p-6 min-h-[464px] flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h2 className="font-bold text-slate-900 dark:text-white">Summary Draft</h2>
                          {summaryResult && (
                            <button
                              onClick={() => handleCopy(summaryResult)}
                              className="p-2 text-slate-500 hover:text-brand-500 rounded-lg hover:bg-slate-100 dark:hover:bg-darkbg-card transition-colors flex items-center gap-1.5 text-xs font-semibold"
                            >
                              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                              Copy
                            </button>
                          )}
                        </div>

                        {loading ? (
                          <div className="flex flex-col items-center justify-center h-80 gap-2 text-slate-400">
                            <RefreshCw className="w-8 h-8 animate-spin text-brand-500 mb-2" />
                            <span className="text-sm font-semibold">Extracting summary points...</span>
                          </div>
                        ) : summaryResult ? (
                          <div className="p-4 rounded-xl border border-slate-200 dark:border-darkbg-border bg-slate-50/30 dark:bg-darkbg-card h-80 overflow-y-auto text-sm leading-relaxed whitespace-pre-wrap text-slate-900 dark:text-slate-100">
                            {summaryResult}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-80 gap-3 text-slate-400 text-center">
                            <FileText className="w-12 h-12 stroke-[1.5] text-slate-300" />
                            <div>
                              <p className="text-sm font-semibold">No summaries generated</p>
                              <p className="text-xs text-slate-400 mt-1 max-w-[250px]">
                                Provide your reference copy text and click Generate Summary to begin.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardBody>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AiAssistant;
