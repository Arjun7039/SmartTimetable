import React from 'react';
import { ChevronRight, School, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { deleteBranch } from '../api';

const BranchSelector = ({ branches, selectedBranch, onSelect, onNext, onRefresh }) => {
  const handleDelete = async (e, branch) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete "${branch}"? This will remove all its semesters and subjects.`)) {
      try {
        await deleteBranch(branch);
        if (onRefresh) onRefresh();
      } catch (err) {
        console.error("Failed to delete branch", err);
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass p-8 rounded-3xl max-w-2xl mx-auto"
    >
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-primary-500/10 rounded-2xl">
          <School className="text-primary-400 w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Select Department</h2>
          <p className="text-white/40 text-sm">Choose an existing branch or add a new one</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-3">
          {branches.length > 0 ? (
            branches.map((branch) => (
              <div key={branch} className="relative group">
                <button
                  onClick={() => onSelect(branch)}
                  className={`w-full flex items-center justify-between p-5 rounded-2xl transition-all duration-300 pr-12 ${
                    selectedBranch === branch 
                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' 
                    : 'bg-white/5 hover:bg-white/10 text-white/80 border border-white/5 hover:border-white/20'
                  }`}
                >
                  <span className="font-semibold">{branch}</span>
                  {selectedBranch === branch && <div className="w-2 h-2 rounded-full bg-white animate-pulse" />}
                </button>
                <button 
                  onClick={(e) => handleDelete(e, branch)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-white/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          ) : (
             <div className="text-center py-8 text-white/20 italic border border-dashed border-white/10 rounded-2xl">
               No branches found. Add one below.
             </div>
          )}
        </div>

        <div className="pt-4 space-y-4">
           <div className="space-y-2">
             <label className="text-[10px] font-black text-primary-400 uppercase tracking-[0.2em] ml-1">Add New Branch</label>
             <input 
               type="text" 
               placeholder="e.g. Mechanical Engineering" 
               className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-primary-500/50 transition-all focus:bg-white/[0.08]"
               onChange={(e) => onSelect(e.target.value.trim())}
             />
           </div>
          
          <button
            onClick={onNext}
            disabled={!selectedBranch}
            className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 shadow-2xl ${
              selectedBranch 
              ? 'bg-white text-black hover:bg-primary-50 hover:shadow-white/10' 
              : 'bg-white/5 text-white/10 cursor-not-allowed border border-white/5'
            }`}
          >
            Continue
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default BranchSelector;
