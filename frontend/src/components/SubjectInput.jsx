import React, { useState } from 'react';
import { Plus, Trash2, BookOpen, FlaskConical, ChevronRight, ChevronLeft, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SubjectInput = ({ subjects, setSubjects, onGenerate, onBack }) => {
  const [activeTab, setActiveTab] = useState('theory');

  const addSubject = (type) => {
    setSubjects([...subjects, { 
      id: Date.now(),
      subject: '', 
      teacher: '', 
      hours: 4, 
      type: type 
    }]);
  };

  const removeSubject = (id) => {
    setSubjects(subjects.filter(s => s.id !== id));
  };

  const updateSubject = (id, field, value) => {
    setSubjects(subjects.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const theorySubjects = subjects.filter(s => s.type === 'theory');
  const labSubjects = subjects.filter(s => s.type === 'lab');

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass p-8 rounded-3xl"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary-500/10 rounded-2xl">
            <BookOpen className="text-primary-400 w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Subject Details</h2>
            <p className="text-white/50">Configure your weekly curriculum</p>
          </div>
        </div>

        <div className="flex p-1 bg-white/5 rounded-xl border border-white/5">
          <button 
            onClick={() => setActiveTab('theory')}
            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'theory' ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' : 'text-white/50 hover:text-white'}`}
          >
            Theory ({theorySubjects.length})
          </button>
          <button 
            onClick={() => setActiveTab('lab')}
            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'lab' ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' : 'text-white/50 hover:text-white'}`}
          >
            Labs ({labSubjects.length})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <AnimatePresence mode="popLayout">
          {(activeTab === 'theory' ? theorySubjects : labSubjects).map((subj, idx) => (
            <motion.div
              key={subj.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass relative group overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-primary-500" />
              <button 
                onClick={() => removeSubject(subj.id)}
                className="absolute top-3 right-3 text-white/20 hover:text-red-400 transition-colors p-2 hover:bg-red-500/10 rounded-lg"
              >
                <Trash2 size={16} />
              </button>

              <div className="p-6 space-y-5">
                <div>
                  <label className="text-[10px] font-black text-primary-400 uppercase tracking-[0.2em] block mb-2">Course Name</label>
                  <input 
                    type="text"
                    value={subj.subject}
                    onChange={(e) => updateSubject(subj.id, 'subject', e.target.value)}
                    placeholder="e.g. Advanced Algorithms"
                    className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm focus:border-primary-500/50 focus:bg-white/[0.08] focus:outline-none transition-all placeholder:text-white/20"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-primary-400 uppercase tracking-[0.2em] block mb-2">Instructor</label>
                    <input 
                      type="text"
                      value={subj.teacher}
                      onChange={(e) => updateSubject(subj.id, 'teacher', e.target.value)}
                      placeholder="Name"
                      className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm focus:border-primary-500/50 focus:outline-none transition-all placeholder:text-white/20"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-primary-400 uppercase tracking-[0.2em] block mb-2">Weekly Load</label>
                    <input 
                      type="number"
                      value={subj.hours}
                      onChange={(e) => updateSubject(subj.id, 'hours', parseInt(e.target.value))}
                      className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm focus:border-primary-500/50 focus:outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        <button 
          onClick={() => addSubject(activeTab)}
          className="border-2 border-dashed border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 text-white/30 hover:border-primary-500/50 hover:text-primary-400 hover:bg-primary-500/5 transition-all group"
        >
          <div className="p-3 bg-white/5 rounded-full group-hover:bg-primary-500/10 transition-colors">
            <Plus size={24} />
          </div>
          <span className="font-semibold">Add New {activeTab === 'theory' ? 'Subject' : 'Lab'}</span>
        </button>
      </div>

      <div className="flex gap-4 pt-6 border-t border-white/5">
        <button
          onClick={onBack}
          className="flex-1 py-4 rounded-2xl font-bold bg-white/5 text-white/60 hover:bg-white/10 flex items-center justify-center gap-2 transition-all"
        >
          <ChevronLeft size={20} />
          Back
        </button>
        <button
          onClick={onGenerate}
          disabled={subjects.length === 0}
          className={`flex-[2] py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${
            subjects.length > 0 
            ? 'bg-primary-500 text-white shadow-xl shadow-primary-500/30 hover:scale-[1.02] active:scale-[0.98]' 
            : 'bg-white/10 text-white/20 cursor-not-allowed'
          }`}
        >
          <Save size={20} />
          Generate Timetable
        </button>
      </div>
    </motion.div>
  );
};

export default SubjectInput;
