import { useState, useEffect, useRef } from "react";
import { useListOpenaiConversations, useCreateOpenaiConversation, useListOpenaiMessages } from "@workspace/api-client-react";
import { Card, CardContent, Button, Input, Textarea, Label } from "@/components/ui";
import { useSSEChat, useSSEAnalysis } from "@/hooks/use-sse";
import { Send, Bot, User, Sparkles, FileText, Target } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";

export default function AIMentor() {
  const [activeTab, setActiveTab] = useState<"chat" | "resume" | "skills">("chat");

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto h-[calc(100vh-80px)] flex flex-col">
      <div className="shrink-0">
        <h1 className="text-4xl font-display font-bold text-white flex items-center gap-3">
          <Bot className="text-primary w-10 h-10" /> AI Career Mentor
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">Get personalized advice, resume feedback, and interview prep.</p>
        
        <div className="flex gap-2 mt-6 bg-card/50 p-1.5 rounded-xl border border-border/50 inline-flex">
          {[
            { id: "chat", icon: Sparkles, label: "Career Chat" },
            { id: "resume", icon: FileText, label: "Resume Review" },
            { id: "skills", icon: Target, label: "Skill Gap Analysis" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id ? "bg-primary text-white shadow-md shadow-primary/20" : "text-muted-foreground hover:text-white hover:bg-white/5"
              }`}
            >
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-0 relative">
        <AnimatePresence mode="wait">
          {activeTab === "chat" && <ChatTab key="chat" />}
          {activeTab === "resume" && <ResumeTab key="resume" />}
          {activeTab === "skills" && <SkillsTab key="skills" />}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ChatTab() {
  const { data: conversations, refetch: refetchConvos } = useListOpenaiConversations();
  const createConvo = useCreateOpenaiConversation();
  const [activeConvoId, setActiveConvoId] = useState<number | null>(null);
  
  const { data: history, isLoading: historyLoading } = useListOpenaiMessages(activeConvoId || 0, { query: { enabled: !!activeConvoId } });
  const { messages, isStreaming, sendMessage, loadHistory } = useSSEChat();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Load latest conversation or create one
  useEffect(() => {
    if (conversations && conversations.length > 0 && !activeConvoId) {
      setActiveConvoId(conversations[0].id);
    } else if (conversations && conversations.length === 0 && !createConvo.isPending) {
      createConvo.mutateAsync({ data: { title: "Career Discussion" } }).then(res => {
        refetchConvos();
        setActiveConvoId(res.id);
      });
    }
  }, [conversations, activeConvoId, createConvo.isPending]);

  // Load history into chat state
  useEffect(() => {
    if (history && !isStreaming) {
      loadHistory(history.sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()));
    }
  }, [history, loadHistory]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !activeConvoId || isStreaming) return;
    sendMessage(activeConvoId, input);
    setInput("");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="h-full flex flex-col">
      <Card className="flex-1 flex flex-col min-h-0 bg-card/50">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
          {historyLoading && <div className="text-center text-muted-foreground">Loading chat...</div>}
          {messages.length === 0 && !historyLoading && (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
              <Bot className="w-16 h-16 mb-4" />
              <p className="text-lg font-medium">How can I help with your career today?</p>
              <p className="text-sm mt-1">Ask about interviews, negotiation, or networking.</p>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={msg.id || i} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-primary/20 text-primary' : 'bg-indigo-500/20 text-indigo-400'}`}>
                {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
              </div>
              <div className={`max-w-[80%] rounded-2xl p-4 ${
                msg.role === 'user' 
                  ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                  : 'bg-secondary/50 text-foreground border border-border/50 rounded-tl-sm prose prose-invert prose-p:leading-relaxed prose-pre:bg-black/50 prose-pre:border border-border/50'
              }`}>
                {msg.role === 'assistant' ? (
                  <ReactMarkdown>{msg.content || (isStreaming && i === messages.length - 1 ? '...' : '')}</ReactMarkdown>
                ) : (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-border/50 bg-card/80 backdrop-blur-md">
          <form onSubmit={handleSend} className="relative flex items-center">
            <Input 
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask anything..." 
              className="pr-12 bg-black/20 border-border/50 focus-visible:ring-primary/50"
              disabled={isStreaming || !activeConvoId}
            />
            <Button size="sm" type="submit" disabled={!input.trim() || isStreaming || !activeConvoId} className="absolute right-1 w-10 h-10 p-0 rounded-lg">
              <Send size={18} />
            </Button>
          </form>
        </div>
      </Card>
    </motion.div>
  );
}

function ResumeTab() {
  const [resumeText, setResumeText] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const { result, isAnalyzing, analyze } = useSSEAnalysis("/api/advisor/resume-feedback");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeText.trim()) return;
    analyze({ resumeText, targetRole });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="h-full flex gap-6 min-h-0">
      <Card className="w-1/2 flex flex-col">
        <form onSubmit={handleSubmit} className="p-6 flex flex-col h-full space-y-4">
          <h2 className="text-xl font-display font-semibold text-white">Input Resume</h2>
          <div className="space-y-2">
            <Label>Target Role (Optional)</Label>
            <Input value={targetRole} onChange={e => setTargetRole(e.target.value)} placeholder="e.g. Frontend Engineer" />
          </div>
          <div className="space-y-2 flex-1 flex flex-col min-h-0">
            <Label>Resume Content (Paste text)</Label>
            <Textarea 
              value={resumeText} 
              onChange={e => setResumeText(e.target.value)} 
              placeholder="Paste your resume text here..." 
              className="flex-1 resize-none font-mono text-xs"
            />
          </div>
          <Button type="submit" disabled={!resumeText.trim() || isAnalyzing} className="w-full">
            {isAnalyzing ? "Analyzing..." : "Get Feedback"}
          </Button>
        </form>
      </Card>
      <Card className="w-1/2 flex flex-col bg-indigo-950/20 border-indigo-500/20">
        <div className="p-6 h-full flex flex-col">
          <h2 className="text-xl font-display font-semibold text-indigo-400 mb-4 flex items-center gap-2"><Sparkles size={20}/> AI Feedback</h2>
          <div className="flex-1 overflow-y-auto prose prose-invert prose-indigo prose-sm max-w-none pr-4">
            {result ? (
              <ReactMarkdown>{result}</ReactMarkdown>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground opacity-50">
                Submit your resume to get line-by-line feedback.
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

function SkillsTab() {
  const [targetRole, setTargetRole] = useState("");
  const [currentSkills, setCurrentSkills] = useState("");
  const { result, isAnalyzing, analyze } = useSSEAnalysis("/api/advisor/skill-gap");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetRole.trim()) return;
    const skillsArray = currentSkills.split(",").map(s => s.trim()).filter(Boolean);
    analyze({ targetRole, currentSkills: skillsArray });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="h-full flex gap-6 min-h-0">
      <Card className="w-1/3 flex flex-col">
        <form onSubmit={handleSubmit} className="p-6 flex flex-col space-y-6">
          <div>
            <h2 className="text-xl font-display font-semibold text-white">Skill Gap Analysis</h2>
            <p className="text-sm text-muted-foreground mt-1">Discover what you need to learn for your dream job.</p>
          </div>
          <div className="space-y-2">
            <Label>Target Role</Label>
            <Input required value={targetRole} onChange={e => setTargetRole(e.target.value)} placeholder="e.g. Data Scientist" />
          </div>
          <div className="space-y-2">
            <Label>Current Skills (comma separated)</Label>
            <Textarea 
              value={currentSkills} 
              onChange={e => setCurrentSkills(e.target.value)} 
              placeholder="Python, SQL, Pandas..." 
              className="min-h-[150px]"
            />
          </div>
          <Button type="submit" disabled={!targetRole.trim() || isAnalyzing} className="w-full mt-auto">
            {isAnalyzing ? "Analyzing Gap..." : "Analyze"}
          </Button>
        </form>
      </Card>
      <Card className="w-2/3 flex flex-col bg-emerald-950/10 border-emerald-500/20">
        <div className="p-6 h-full flex flex-col">
          <h2 className="text-xl font-display font-semibold text-emerald-400 mb-4 flex items-center gap-2"><Target size={20}/> Learning Path & Gaps</h2>
          <div className="flex-1 overflow-y-auto prose prose-invert prose-emerald max-w-none pr-4">
            {result ? (
              <ReactMarkdown>{result}</ReactMarkdown>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground opacity-50 text-center">
                <p>Enter a target role to see what skills you're missing <br/>and get a personalized learning roadmap.</p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
