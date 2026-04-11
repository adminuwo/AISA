import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Sparkles, Wand2, Star, Clock, Image as ImageIcon, Camera, Palette, Zap, Globe, Heart, ChevronRight } from 'lucide-react';

const CATEGORIES = [
    { id: 'All', icon: Globe },
    { id: 'Art', icon: Palette },
    { id: 'Photography', icon: Camera },
    { id: 'Anime', icon: Zap },
    { id: 'Logo', icon: ImageIcon },
];

const DEFAULT_PROMPTS = [
    {
        id: 1,
        title: "Ultra Realistic Portrait",
        prompt: "Ultra realistic portrait, 8K, cinematic lighting, highly detailed face, pores visible, sharp focus, professional studio photography, masterpiece.",
        category: "Photography",
    },
    {
        id: 2,
        title: "Cyberpunk Metropolis",
        prompt: "Cyberpunk city at night, neon lights, futuristic environment, ultra detailed, rainy streets with reflections, cinematic atmosphere, 8K resolution.",
        category: "Art",
    },
    {
        id: 3,
        title: "Vibrant Anime Vibe",
        prompt: "Beautiful anime character, soft lighting, vibrant colors, highly detailed, Makoto Shinkai style background, masterpiece, high quality.",
        category: "Anime",
    },
    {
        id: 4,
        title: "Fantasy Dragon Peak",
        prompt: "Majestic dragon perched on a mountain peak, fantasy landscape, magical forest below, glowing lights, epic scenery, volumetric lighting.",
        category: "Art",
    },
    {
        id: 5,
        title: "Modern Tech Logo",
        prompt: "Minimalist modern tech logo, clean lines, professional branding, flat vector design, high contrast, studio white background.",
        category: "Logo",
    },
    {
        id: 6,
        title: "Surreal Dreamscape",
        prompt: "Surreal dreamscape with floating islands, purple clouds, golden waterfall, ethereal lighting, Salvador Dali inspired, ultra-detailed.",
        category: "Art",
    },
    {
        id: 7,
        title: "Architectural Marvel",
        prompt: "Modern architectural building, futuristic design, glass and steel, sunset lighting, professional architectural photography, 8k.",
        category: "Photography",
    },
    {
        id: 8,
        title: "Cute Chibi Mascot",
        prompt: "Cute chibi character mascot, big eyes, soft fur, bright colors, 3D render style, octane render, high detail, white background.",
        category: "Anime",
    }
];

const PromptLibraryModal = ({ isOpen, onClose, onSelect }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [favorites, setFavorites] = useState(() => {
        const saved = localStorage.getItem('aisa_favorite_prompts');
        return saved ? JSON.parse(saved) : [];
    });

    const toggleFavorite = (id) => {
        const newFavorites = favorites.includes(id) 
            ? favorites.filter(fid => fid !== id)
            : [...favorites, id];
        setFavorites(newFavorites);
        localStorage.setItem('aisa_favorite_prompts', JSON.stringify(newFavorites));
    };

    const filteredPrompts = useMemo(() => {
        return DEFAULT_PROMPTS.filter(p => {
            const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                 p.prompt.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
            return matchesSearch && matchesCategory;
        });
    }, [searchQuery, activeCategory]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xl">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-2xl h-[80vh] bg-white/80 rounded-[32px] shadow-2xl overflow-hidden border border-white/40 flex flex-col"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-black/5 bg-white/40 backdrop-blur-md">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-slate-900 leading-none mb-1">Prompt Library</h2>
                                    <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Curated AI Masterpieces</p>
                                </div>
                            </div>
                            <button 
                                onClick={onClose}
                                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
                            >
                                <X size={18} className="text-slate-600" />
                            </button>
                        </div>

                        {/* Search Bar */}
                        <div className="relative mb-6">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input 
                                type="text"
                                placeholder="Search creative prompts..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-11 pr-4 py-3.5 bg-white/60 border border-white/80 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-slate-400"
                            />
                        </div>

                        {/* Categories */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
                            {CATEGORIES.map((cat) => {
                                const Icon = cat.icon;
                                const isActive = activeCategory === cat.id;
                                return (
                                    <button
                                        key={cat.id}
                                        onClick={() => setActiveCategory(cat.id)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
                                            isActive 
                                            ? 'bg-primary text-white shadow-lg shadow-primary/30' 
                                            : 'bg-white/60 text-slate-600 hover:bg-white/80 border border-white/60'
                                        }`}
                                    >
                                        <Icon size={14} />
                                        {cat.id}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-slate-50/30">
                        {filteredPrompts.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {filteredPrompts.map((p) => (
                                    <motion.div
                                        key={p.id}
                                        layout
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="group relative bg-white/70 hover:bg-white rounded-3xl p-5 border border-white/60 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full"
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <span className="px-3 py-1 bg-slate-100 rounded-lg text-[9px] font-black uppercase tracking-wider text-slate-500">
                                                {p.category}
                                            </span>
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleFavorite(p.id);
                                                }}
                                                className={`p-1.5 rounded-lg transition-colors ${favorites.includes(p.id) ? 'bg-red-50 text-red-500' : 'bg-slate-100 text-slate-400'}`}
                                            >
                                                <Heart size={14} fill={favorites.includes(p.id) ? "currentColor" : "none"} />
                                            </button>
                                        </div>
                                        <h4 className="font-black text-slate-800 text-[15px] mb-2 leading-tight">{p.title}</h4>
                                        <p className="text-[11px] text-slate-500 font-medium leading-relaxed mb-4 line-clamp-3">
                                            {p.prompt}
                                        </p>
                                        <div className="mt-auto">
                                            <button 
                                                onClick={() => onSelect(p.prompt)}
                                                className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-primary transition-all group-hover:shadow-lg"
                                            >
                                                Use Prompt
                                                <ChevronRight size={14} />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full py-10 opacity-40">
                                <Search size={48} className="text-slate-400 mb-4" />
                                <p className="font-black text-slate-900 uppercase tracking-widest text-sm text-center">No prompts found</p>
                                <p className="text-xs font-medium text-slate-500">Try a different keyword or category</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default PromptLibraryModal;
