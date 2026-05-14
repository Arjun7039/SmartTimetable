import React from 'react';
import { ChevronRight, CalendarDays, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const SemesterSelector = ({ selectedSemester, onSelect, onNext, onBack }) => {
  const semesters = ['1st Semester', '2nd Semester', '3rd Semester', '4th Semester', '5th Semester', '6th Semester', '7th Semester', '8th Semester'];

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass p-8 rounded-3xl max-w-2xl mx-auto"
    >
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-primary-500/10 rounded-2xl">
          <CalendarDays className="text-primary-400 w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Select Semester</h2>
          <p className="text-white/50">Organize subjects by term</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {semesters.map((sem) => (
          <button
            key={sem}
            onClick={() => onSelect(sem)}
            className={`p-4 rounded-2xl text-center transition-all duration-300 ${
              selectedSemester === sem 
              ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' 
              : 'bg-white/5 hover:bg-white/10 text-white/80 border border-white/5'
            }`}
          >
            <span className="font-medium">{sem}</span>
          </button>
        ))}
      </div>

      <div className="pt-8 flex gap-4">
        <button
          onClick={onBack}
          className="flex-1 py-4 rounded-2xl font-bold bg-white/5 text-white/60 hover:bg-white/10 flex items-center justify-center gap-2 transition-all"
        >
          <ChevronLeft size={20} />
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!selectedSemester}
          className={`flex-[2] py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${
            selectedSemester 
            ? 'bg-white text-black hover:bg-primary-50' 
            : 'bg-white/10 text-white/20 cursor-not-allowed'
          }`}
        >
          Continue
          <ChevronRight size={20} />
        </button>
      </div>
    </motion.div>
  );
};

export default SemesterSelector;
