import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { Sparkles, ArrowRight, Loader2, Download, User, Check, Bookmark } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useGenerateCareerPath, useSavedResult } from "@/hooks/use-career-guide";
import { CareerResultCard } from "@/components/CareerResultCard";
import { Features } from "@/components/Features";
import { Footer } from "@/components/Footer";
import type { GenerateParams, Goal, SkillLevel } from "@/hooks/use-career-guide";

export default function Home() {
  const [interests, setInterests] = useState("");
  const [skillLevel, setSkillLevel] = useState<SkillLevel>("beginner");
  const [goal, setGoal] = useState<Goal>("job");
  
  const [nameInput, setNameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [showSavedMsg, setShowSavedMsg] = useState(false);

  const { mutate: generatePath, isPending, data: result, error } = useGenerateCareerPath();
  const { savedResult, saveResult, userProfile, saveUser } = useSavedResult();
  
  const resultsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLDivElement>(null);

  const handleGenerate = () => {
    if (!interests.trim()) return;
    
    generatePath({ interests, skillLevel, goal }, {
      onSuccess: () => {
        setTimeout(() => {
          resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    });
  };

  const scrollToInput = () => {
    inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleDownloadPDF = async () => {
    if (!resultsRef.current) return;
    try {
      const element = resultsRef.current;
      const canvas = await html2canvas(element, { 
        scale: 2, 
        backgroundColor: '#0a0a0f', // Match our dark theme
        windowWidth: 1200 
      });
      const data = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgProps = pdf.getImageProperties(data);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(data, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('Career_Path_Report.pdf');
    } catch (e) {
      console.error("PDF generation failed", e);
    }
  };

  const handleSaveAccount = () => {
    if (nameInput && emailInput) {
      saveUser(nameInput, emailInput);
      if (result) saveResult(result);
      setShowSavedMsg(true);
      setTimeout(() => setShowSavedMsg(false), 3000);
    }
  };

  const displayResult = result || savedResult;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Hero Image/Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[800px] opacity-40 pointer-events-none z-0">
        <img 
          src={`${import.meta.env.BASE_URL}images/hero-glow.png`} 
          alt="Abstract Glow" 
          className="w-full h-full object-cover mix-blend-screen"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/80 to-background" />
      </div>

      {/* Navbar */}
      <nav className="relative z-50 w-full py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" />
          <span className="text-xl font-display font-bold text-white tracking-tight">Career Guide</span>
        </div>
        <div>
          {userProfile ? (
            <div className="flex items-center gap-3 text-sm font-medium">
              <User className="w-5 h-5 text-muted-foreground" />
              <span>{userProfile.name}</span>
            </div>
          ) : (
            <Button variant="ghost" className="hidden md:flex" onClick={() => document.getElementById('account')?.scrollIntoView({behavior:'smooth'})}>
              Sign In
            </Button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-primary/30 text-primary-foreground mb-8 text-sm font-medium">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>AI-Powered Career Discovery 2.0</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-display font-extrabold tracking-tight mb-6 max-w-4xl mx-auto leading-tight">
              Confused About Your Career? Let <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-400 to-blue-400 text-glow">AI Guide You 🚀</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Personalized career paths, skills requirements, and actionable roadmaps generated in seconds based on your unique interests.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" onClick={scrollToInput} className="w-full sm:w-auto font-bold text-lg group">
                Get Started
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              {savedResult && !result && (
                <Button variant="outline" size="lg" onClick={() => resultsRef.current?.scrollIntoView({behavior: 'smooth'})} className="w-full sm:w-auto">
                  View Last Result
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </main>

      {/* Input Section */}
      <section ref={inputRef} className="py-20 relative z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <Card className="glass-card shadow-2xl shadow-primary/10 overflow-visible border-t-primary/20">
            <CardHeader className="text-center pb-8 pt-10">
              <CardTitle className="text-3xl">Design Your Future</CardTitle>
              <CardDescription className="text-base">Tell us what you like, and we'll map out your perfect career.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 px-6 sm:px-10 pb-10">
              <div className="space-y-3">
                <label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  What are you interested in?
                </label>
                <Input 
                  placeholder="e.g., coding, design, business, analyzing data, talking to people..." 
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                  className="h-14 text-lg bg-black/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Current Skill Level</label>
                  <select 
                    className="flex h-14 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
                    value={skillLevel}
                    onChange={(e) => setSkillLevel(e.target.value as SkillLevel)}
                  >
                    <option value="beginner" className="bg-secondary text-white">Beginner (No experience)</option>
                    <option value="intermediate" className="bg-secondary text-white">Intermediate (Some basics)</option>
                    <option value="advanced" className="bg-secondary text-white">Advanced (Can build things)</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Primary Goal</label>
                  <select 
                    className="flex h-14 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value as Goal)}
                  >
                    <option value="job" className="bg-secondary text-white">Get a Full-Time Job</option>
                    <option value="freelancing" className="bg-secondary text-white">Go Freelance</option>
                    <option value="startup" className="bg-secondary text-white">Start a Business / Startup</option>
                  </select>
                </div>
              </div>

              <Button 
                size="lg" 
                className="w-full h-16 text-lg mt-4 shadow-xl shadow-primary/20"
                onClick={handleGenerate}
                disabled={isPending || !interests.trim()}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-3 w-6 h-6 animate-spin" />
                    Analyzing your future...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-3 w-6 h-6" />
                    Generate My Career Path
                  </>
                )}
              </Button>
              
              {error && (
                <p className="text-red-400 text-sm text-center bg-red-400/10 py-2 rounded-lg border border-red-400/20">
                  Something went wrong. But don't worry, we loaded a fallback mapping.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Loading State Overlay */}
      <AnimatePresence>
        {isPending && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          >
            <div className="flex flex-col items-center p-8 glass rounded-3xl max-w-sm text-center">
              <div className="w-20 h-20 mb-6 relative">
                <div className="absolute inset-0 rounded-full border-t-4 border-primary animate-spin" />
                <div className="absolute inset-2 rounded-full border-r-4 border-blue-400 animate-spin animation-delay-150" style={{ animationDirection: 'reverse' }} />
                <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-primary animate-pulse" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Analyzing your future</h3>
              <p className="text-muted-foreground">Running ML models against industry data to find your perfect fit<span className="typing-cursor"></span></p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Section */}
      <AnimatePresence>
        {displayResult && !isPending && (
          <motion.section 
            id="results-container"
            ref={resultsRef}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="py-20 relative z-10"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                <div>
                  <Badge variant="outline" className="mb-4 bg-primary/10 border-primary/20 text-primary">Analysis Complete</Badge>
                  <h2 className="text-3xl md:text-5xl font-display font-bold">Your Best Career Options</h2>
                  <p className="text-muted-foreground mt-2 text-lg">Based on your interest in "{interests || 'technology'}"</p>
                </div>
                <Button variant="outline" onClick={handleDownloadPDF} className="glass">
                  <Download className="w-4 h-4 mr-2" />
                  Download Report (PDF)
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {displayResult.careers.map((career, i) => (
                  <CareerResultCard key={i} career={career} index={i} />
                ))}
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Features */}
      <Features />

      {/* User Save System (No backend) */}
      <section id="account" className="py-24 relative z-10 border-t border-white/5 bg-white/[0.02]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <Card className="glass-card">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                <Bookmark className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">Save Your Results</CardTitle>
              <CardDescription>Create a local profile to access your career paths anytime without an account.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input 
                placeholder="Full Name" 
                value={nameInput} 
                onChange={(e) => setNameInput(e.target.value)} 
                className="bg-black/30 h-12"
              />
              <Input 
                placeholder="Email Address" 
                type="email"
                value={emailInput} 
                onChange={(e) => setEmailInput(e.target.value)} 
                className="bg-black/30 h-12"
              />
              <Button 
                className="w-full h-12" 
                onClick={handleSaveAccount}
                disabled={!nameInput || !emailInput}
              >
                Save to Account
              </Button>
              
              <AnimatePresence>
                {showSavedMsg && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center gap-2 text-emerald-400 text-sm font-medium mt-4"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Profile & results saved locally!
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}
