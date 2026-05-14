import React from 'react';
import { Download, Share2, FileText, Table as TableIcon, RefreshCcw } from 'lucide-react';
import { motion } from 'framer-motion';

const TimetableDisplay = ({ data, onReset }) => {
  if (!data) return null;

  const { branch, semester, time_slots, timetable } = data;

  const handleDownloadPDF = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/download-pdf/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Timetable_${branch}_${semester}.pdf`;
      a.click();
    } catch (err) {
      console.error("Failed to download PDF", err);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-primary-400 font-bold tracking-widest text-xs uppercase mb-2">
            <div className="w-8 h-[2px] bg-primary-500" />
            Generated Timetable
          </div>
          <h2 className="text-4xl font-black tracking-tight">{branch}</h2>
          <p className="text-white/40 text-lg font-medium">{semester} • 2025-26 Academic Year</p>
        </div>

        <div className="flex gap-3">
          <button onClick={onReset} className="glass p-4 rounded-2xl hover:bg-white/10 transition-colors text-white/60 hover:text-white group" title="Start Over">
            <RefreshCcw size={20} className="group-hover:rotate-180 transition-transform duration-500" />
          </button>
          <button 
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 bg-primary-500 text-white px-8 py-4 rounded-2xl font-bold hover:bg-primary-600 transition-all shadow-xl shadow-primary-500/20 active:scale-95"
          >
            <Download size={20} />
            Export PDF
          </button>
        </div>
      </div>

      <div className="glass rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-white/5">
                <th className="p-6 text-left text-white/40 font-bold uppercase tracking-wider text-xs border-r border-white/5">Day</th>
                {time_slots.map((slot) => (
                  <th key={slot} className="p-6 text-center text-white/40 font-bold uppercase tracking-wider text-xs min-w-[140px]">
                    {slot}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timetable.map((row, idx) => (
                <tr key={row.day} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="p-6 font-black text-white/80 border-r border-white/5 bg-white/[0.01]">
                    {row.day}
                  </td>
                  {time_slots.map((slot) => {
                    const content = row.slots[slot] || "—";
                    const isLunch = content === "LUNCH";
                    const isLab = content.toLowerCase().includes("lab");
                    const isEmpty = content === "—";

                    return (
                      <td key={slot} className="p-2">
                        <div className={`h-full min-h-[90px] p-4 rounded-2xl flex flex-col items-center justify-center text-center transition-all shadow-lg ${
                          isLunch 
                          ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/10 text-amber-400 border border-amber-500/30 font-black tracking-widest text-[10px]' 
                          : isLab 
                          ? 'bg-gradient-to-br from-indigo-500/30 to-purple-500/20 text-white border border-indigo-500/40 shadow-indigo-500/10'
                          : isEmpty
                          ? 'text-white/5 border border-white/5'
                          : 'bg-gradient-to-br from-white/[0.08] to-white/[0.02] text-white border border-white/10 hover:border-primary-500/50 hover:shadow-primary-500/10'
                        }`}>
                          {isLunch ? (
                            "LUNCH BREAK"
                          ) : (
                            <>
                              <span className="text-sm font-bold leading-tight mb-1">{content.split('\n')[0]}</span>
                              {content.includes('(') && (
                                <span className="text-[10px] text-white/40 font-medium italic">
                                  {content.match(/\(([^)]+)\)/)?.[1]}
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default TimetableDisplay;
