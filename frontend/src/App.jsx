import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import BranchSelector from './components/BranchSelector';
import SemesterSelector from './components/SemesterSelector';
import SubjectInput from './components/SubjectInput';
import TimetableDisplay from './components/TimetableDisplay';
import { getBranches, getSubjects, generateTimetable } from './api';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [step, setStep] = useState(1);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [timetableData, setTimetableData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchBranches = async () => {
    try {
      const data = await getBranches();
      setBranches(data);
    } catch (err) {
      console.error("Failed to fetch branches", err);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const handleSemesterSelect = async (semesterName) => {
    setSelectedSemester(semesterName);
    setSubjects([]); 
    setLoading(true);

    try {
      const branchName = selectedBranch;
      const data = await getSubjects(branchName, semesterName);
      
      if (data && data.length > 0) {
        const subjectsWithIds = data.map(s => ({ 
          ...s, 
          id: Math.random().toString(36).substr(2, 9) 
        }));
        setSubjects(subjectsWithIds);
      }
      setStep(3);
    } catch (err) {
      console.error("[BROWSER] ERROR:", err);
      setStep(3);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const result = await generateTimetable({
        branch: selectedBranch,
        semester: selectedSemester,
        subjects: subjects.map(({ subject, teacher, hours, type }) => ({
          subject, teacher, hours, type
        }))
      });
      setTimetableData(result);
      setStep(4);
    } catch (err) {
      // Improved error message to help debugging
      const errorMessage = err.response?.data?.error || err.message || "Unknown error";
      alert(`Backend Error: ${errorMessage}\n\nPlease check that you filled all fields and the database is connected.`);
      console.error("Full Error Object:", err);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep(1);
    setTimetableData(null);
    setSubjects([]);
  };

  return (
    <Layout>
      <AnimatePresence mode="wait">
        {loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
              <p className="font-bold text-lg tracking-widest text-primary-400 animate-pulse">LOADING DATA...</p>
            </div>
          </motion.div>
        )}

        {step === 1 && (
          <BranchSelector 
            key="step1"
            branches={branches} 
            selectedBranch={selectedBranch} 
            onSelect={setSelectedBranch} 
            onNext={() => setStep(2)} 
            onRefresh={fetchBranches}
          />
        )}
        
        {step === 2 && (
          <SemesterSelector 
            key="step2"
            selectedSemester={selectedSemester} 
            onSelect={setSelectedSemester} 
            onNext={() => handleSemesterSelect(selectedSemester)} 
            onBack={() => setStep(1)} 
          />
        )}

        {step === 3 && (
          <SubjectInput 
            key="step3"
            subjects={subjects} 
            setSubjects={setSubjects} 
            onGenerate={handleGenerate} 
            onBack={() => setStep(2)} 
          />
        )}

        {step === 4 && (
          <TimetableDisplay 
            key="step4"
            data={timetableData} 
            onReset={reset} 
          />
        )}
      </AnimatePresence>
    </Layout>
  );
}

export default App;
