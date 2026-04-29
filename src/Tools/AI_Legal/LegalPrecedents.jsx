import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Scale, Search, FileText, ChevronRight, Gavel,
    Calendar, Shield, AlertCircle, Copy, Save,
    Share2, ExternalLink, Bookmark, CheckCircle2,
    ArrowLeft, Info, Filter, Zap, BookOpen, ArrowRight, X, Brain,
    Briefcase, Plus, Folder
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { apis } from '../../types';

const LegalPrecedents = ({ projectId: initialProjectId, onBack, cases = [], onSelectCase, onCreateCase }) => {
    const [mode, setMode] = useState('CURRENT'); // 'CURRENT' or 'MANUAL'
    const [selectedProjectId, setSelectedProjectId] = useState(null); // Force user to select even if global projectId exists
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState([]);
    const [selectedCaseDetail, setSelectedCaseDetail] = useState(null);
    const [searchMetadata, setSearchMetadata] = useState(null);

    // Get the actual case object from the selectedProjectId or fallback to null (never auto-select)
    const activeCase = cases.find(c => c._id === selectedProjectId);

    const handleSearch = async (manualQuery = null, forceProjectId = null) => {
        const targetProjectId = forceProjectId || (mode === 'CURRENT' ? selectedProjectId : null);
        if (mode === 'CURRENT' && !targetProjectId) return;

        setIsLoading(true);
        try {
            const searchQuery = manualQuery || (mode === 'MANUAL' ? query : '');
            const response = await axios.post(`${apis.precedents}/search`, {
                query: searchQuery,
                projectId: mode === 'CURRENT' ? targetProjectId : null
            });

            setResults(response.data.precedents || []);
            setSearchMetadata({
                mode: response.data.mode,
                query: response.data.query
            });

            if (response.data.precedents?.length === 0) {
                toast.error("No relevant precedents found for this case context.");
            } else {
                toast.success("Legal Precedents Activated", { icon: '⚖️' });
            }
        } catch (error) {
            console.error("Search failed:", error);
            toast.error("Failed to fetch precedents. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const onCaseClick = (c) => {
        setSelectedProjectId(c._id);
        onSelectCase(c); // Update global context if needed
        handleSearch(null, c._id);
    };

    const resetSelection = () => {
        setSelectedProjectId(null);
        setResults([]);
        setSearchMetadata(null);
    };

    useEffect(() => {
        // If mode switches to manual, results stay but we are in manual mode.
        // If mode switches to current and no selection, results cleared.
        if (mode === 'CURRENT' && !selectedProjectId) {
            setResults([]);
            setSearchMetadata(null);
        }
    }, [mode, selectedProjectId]);

    const copyCitation = (citation) => {
        navigator.clipboard.writeText(citation);
        toast.success("Citation copied to clipboard!");
    };

    // --- Sub-renderers ---

    const renderCaseSelection = () => {
        if (cases.length === 0) return renderEmptyCases();

        return (
            <div className="max-w-6xl mx-auto py-8 px-4">
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-indigo-100">
                        <Folder size={32} className="text-indigo-600" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
                        Select a Case to Analyze
                    </h2>
                    <p className="text-xs text-slate-500 font-medium max-w-md mx-auto">
                        Choose a case from your workspace to begin searching for relevant legal precedents and judgements.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {cases.map((c) => (
                        <motion.div
                            key={c._id}
                            whileHover={{ y: -3 }}
                            className="bg-white border border-slate-200 rounded-[20px] p-5 shadow-sm hover:shadow-lg hover:border-indigo-200 transition-all cursor-pointer flex flex-col justify-between"
                            onClick={() => onCaseClick(c)}
                        >
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                                        <Scale size={14} className="text-slate-600" />
                                    </div>
                                    <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 bg-slate-50 text-slate-500 rounded-md">
                                        {c.caseType || 'General'}
                                    </span>
                                </div>
                                <h3 className="text-sm font-black text-slate-900 mb-1.5 line-clamp-1">{c.name}</h3>
                                <p className="text-[10px] text-slate-500 line-clamp-2 mb-4 font-medium leading-relaxed">
                                    {c.description || "No description provided for this case."}
                                </p>
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                                    {new Date(c.updatedAt).toLocaleDateString()}
                                </span>
                                <button className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700 transition-all">
                                    Analyze Precedents <ArrowRight size={12} />
                                </button>
                            </div>
                        </motion.div>
                    ))}

                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        onClick={onCreateCase}
                        className="border-2 border-dashed border-slate-200 rounded-[20px] p-5 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 transition-all min-h-[140px]"
                    >
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                            <Plus size={20} className="text-slate-400" />
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">New Case</span>
                    </motion.div>
                </div>
            </div>
        );
    };

    const renderEmptyCases = () => (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <Briefcase size={48} className="text-slate-200" />
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2">No Cases Found</h3>
            <p className="text-slate-500 max-w-sm mb-8 font-medium">
                You haven't created any case workspaces yet. Create your first case to start using AI Legal Precedents.
            </p>
            <button
                onClick={onCreateCase}
                className="flex items-center gap-2 bg-slate-900 text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 shadow-xl shadow-slate-200 transition-all"
            >
                <Plus size={18} /> Create New Case
            </button>
        </div>
    );

    const renderLoading = () => (
        <div className="flex flex-col items-center justify-center py-20">
            <div className="relative mb-8">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-20 h-20 border-4 border-indigo-500/20 border-t-indigo-600 rounded-full"
                />
                <Scale size={28} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-600 animate-pulse" />
            </div>
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-[0.2em] animate-pulse">Analyzing Case & Retrieval</h3>
            <p className="text-slate-400 mt-2 font-medium text-sm">Cross-referencing legal databases for relevant precedents...</p>
        </div>
    );

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-2xl m-4">
            {/* Header */}
            <div className="px-8 py-6 bg-white border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-20 backdrop-blur-md bg-white/90">
                <div className="flex items-center gap-4">
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={onBack}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                    >
                        <ArrowLeft size={20} className="text-slate-600" />
                    </motion.button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl font-black text-slate-900">⚖️ LEGAL PRECEDENTS</h2>
                            {activeCase && mode === 'CURRENT' && (
                                <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-lg">
                                    <Briefcase size={12} className="text-indigo-600" />
                                    <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest truncate max-w-[150px]">
                                        {activeCase.name}
                                    </span>
                                    <button
                                        onClick={resetSelection}
                                        className="text-[9px] font-bold text-slate-400 hover:text-indigo-600 ml-1 transition-colors underline underline-offset-2"
                                    >
                                        Change
                                    </button>
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                            Advanced Judgement Discovery Engine
                        </p>
                    </div>
                </div>

                <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 w-fit">
                    <button
                        onClick={() => { setMode('CURRENT'); if (!selectedProjectId) resetSelection(); }}
                        className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center gap-2 ${mode === 'CURRENT'
                                ? 'bg-white text-indigo-600 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        {mode === 'CURRENT' && <CheckCircle2 size={12} />} Current Case
                    </button>
                    <button
                        onClick={() => setMode('MANUAL')}
                        className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center gap-2 ${mode === 'MANUAL'
                                ? 'bg-white text-indigo-600 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        {mode === 'MANUAL' && <CheckCircle2 size={12} />} Manual Search
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {isLoading ? renderLoading() : (
                    <>
                        {mode === 'CURRENT' && !selectedProjectId ? renderCaseSelection() : (
                            <div className="p-8">
                                {/* Search Bar (Only in Manual Mode) */}
                                {mode === 'MANUAL' && (
                                    <div className="max-w-2xl mx-auto mb-10">
                                        <div className="relative group">
                                            <div className="absolute inset-0 bg-indigo-500/10 blur-xl rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                                            <input
                                                type="text"
                                                value={query}
                                                onChange={(e) => setQuery(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                                placeholder="Search case law by topic, issue, or keyword..."
                                                className="w-full bg-white border-2 border-slate-100 focus:border-indigo-500 rounded-2xl px-6 py-5 pl-14 text-sm font-medium shadow-sm transition-all outline-none"
                                            />
                                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                                            <button
                                                onClick={() => handleSearch()}
                                                disabled={isLoading || !query}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 disabled:opacity-50 transition-all"
                                            >
                                                {isLoading ? 'Searching...' : 'Search'}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Results Grid */}
                                {results.length > 0 ? (
                                    <div className="grid grid-cols-1 gap-6 max-w-4xl mx-auto">
                                        {results.map((caseItem, idx) => (
                                            <PrecedentCard
                                                key={idx}
                                                caseItem={caseItem}
                                                onClick={() => setSelectedCaseDetail(caseItem)}
                                                onCopyCitation={() => copyCitation(caseItem.citation)}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    !isLoading && (
                                        <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
                                            <BookOpen size={48} className="text-slate-300 mb-4" />
                                            <h3 className="text-lg font-bold text-slate-800">No Precedents Found</h3>
                                            <p className="text-xs text-slate-500 max-w-xs mt-2 font-medium">
                                                {mode === 'CURRENT'
                                                    ? "We couldn't find relevant precedents based on this case's facts. Try refining the case documents or use manual search."
                                                    : "Enter a search query to discover relevant case laws and legal principles."}
                                            </p>
                                        </div>
                                    )
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Case Detail Overlay */}
            <AnimatePresence>
                {selectedCaseDetail && (
                    <CaseDetailView
                        caseItem={selectedCaseDetail}
                        onClose={() => setSelectedCaseDetail(null)}
                        onCopyCitation={() => copyCitation(selectedCaseDetail.citation)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

const PrecedentCard = ({ caseItem, onClick, onCopyCitation }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4, shadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)" }}
            className="group bg-white border border-slate-200 rounded-2xl overflow-hidden cursor-pointer shadow-sm transition-all"
            onClick={onClick}
        >
            <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                        <h3 className="text-base font-black text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
                            {caseItem.case_name}
                        </h3>
                        <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                            <span className="flex items-center gap-1"><Gavel size={12} /> {caseItem.court}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1"><Calendar size={12} /> {caseItem.year}</span>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <div className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-[10px] font-black">
                            {caseItem.relevance_score}% Relevance
                        </div>
                    </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 mb-4 font-medium italic">
                    "{caseItem.summary}"
                </p>

                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 mb-4">
                    <div className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                        <Shield size={10} /> Ratio Decidendi
                    </div>
                    <p className="text-[11px] text-slate-800 font-bold leading-relaxed">
                        {caseItem.ratio_decidendi}
                    </p>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1.5">
                        {caseItem.tags?.slice(0, 3).map((tag, i) => (
                            <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md text-[9px] font-bold uppercase tracking-tight">
                                {tag}
                            </span>
                        ))}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={(e) => { e.stopPropagation(); onCopyCitation(); }}
                            className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-indigo-600 transition-all"
                            title="Copy Citation"
                        >
                            <Copy size={16} />
                        </button>
                        <motion.div
                            whileHover={{ x: 4 }}
                            className="flex items-center gap-1 text-[10px] font-black text-indigo-600 uppercase tracking-widest"
                        >
                            View Details <ChevronRight size={14} />
                        </motion.div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const CaseDetailView = ({ caseItem, onClose, onCopyCitation }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10"
        >
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="relative w-full max-w-4xl max-h-full bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col"
            >
                {/* Modal Header */}
                <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-start">
                    <div className="flex-1 pr-10">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="px-3 py-1 bg-indigo-600 text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                                Legal Precedent
                            </div>
                            <div className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-[10px] font-black">
                                {caseItem.relevance_score}% Match
                            </div>
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 leading-tight mb-2 uppercase italic tracking-tight">
                            {caseItem.case_name}
                        </h2>
                        <div className="flex items-center gap-4 text-xs text-slate-400 font-bold uppercase tracking-widest">
                            <span className="flex items-center gap-1.5"><Gavel size={14} className="text-slate-300" /> {caseItem.court}</span>
                            <span className="flex items-center gap-1.5"><Calendar size={14} className="text-slate-300" /> {caseItem.year}</span>
                            <span className="flex items-center gap-1.5"><FileText size={14} className="text-slate-300" /> {caseItem.citation}</span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 hover:bg-slate-100 rounded-2xl transition-colors text-slate-400 hover:text-slate-600"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Modal Content */}
                <div className="flex-1 overflow-y-auto px-10 py-8 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        <div className="md:col-span-2 space-y-10">
                            <Section title="Facts" content={caseItem.facts} icon={<FileText size={18} />} />
                            <Section title="Legal Issue" content={caseItem.issue} icon={<AlertCircle size={18} />} />
                            <Section title="Reasoning" content={caseItem.reasoning} icon={<Brain size={18} />} />
                            <Section title="Decision" content={caseItem.decision} icon={<Gavel size={18} />} highlight />
                        </div>

                        <div className="space-y-8">
                            <div className="bg-indigo-600 rounded-[24px] p-6 text-white shadow-xl shadow-indigo-200">
                                <div className="text-[10px] font-black uppercase tracking-[0.2em] mb-3 opacity-80 flex items-center gap-2">
                                    <Shield size={14} /> Ratio Decidendi
                                </div>
                                <p className="text-sm font-bold leading-relaxed italic">
                                    "{caseItem.ratio_decidendi}"
                                </p>
                            </div>

                            <div className="bg-slate-50 border border-slate-100 rounded-[24px] p-6">
                                <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Zap size={14} className="text-amber-500" /> Key Takeaways
                                </h4>
                                <ul className="space-y-3">
                                    {caseItem.key_takeaways?.map((item, i) => (
                                        <li key={i} className="flex gap-3 text-xs text-slate-600 font-medium leading-relaxed">
                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {caseItem.tags?.map((tag, i) => (
                                    <span key={i} className="px-3 py-1 bg-white border border-slate-200 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-tight">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="px-10 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <button
                        onClick={onCopyCitation}
                        className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 hover:text-indigo-600 transition-all"
                    >
                        <Copy size={16} /> Copy Citation
                    </button>

                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 transition-all">
                            <Bookmark size={16} /> Save to Case
                        </button>
                        <button className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 shadow-lg shadow-slate-200 transition-all">
                            Use in Argument <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

const Section = ({ title, content, icon, highlight = false }) => (
    <div className={`space-y-3 ${highlight ? 'bg-amber-50/50 p-6 rounded-3xl border border-amber-100' : ''}`}>
        <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2 opacity-60">
            {icon} {title}
        </h4>
        <p className={`text-sm leading-relaxed text-slate-700 ${highlight ? 'font-bold' : 'font-medium'}`}>
            {content || "No information available."}
        </p>
    </div>
);


export default LegalPrecedents;
