import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, TrendingUp, DollarSign, Clock, Wrench } from "lucide-react";
import type { CareerOption } from "@/hooks/use-career-guide";

interface CareerResultCardProps {
  career: CareerOption;
  index: number;
}

export function CareerResultCard({ career, index }: CareerResultCardProps) {
  const [typedDesc, setTypedDesc] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  // Cool typing effect for the description
  useEffect(() => {
    let currentText = "";
    let i = 0;
    const timer = setInterval(() => {
      if (i < career.description.length) {
        currentText += career.description.charAt(i);
        setTypedDesc(currentText);
        i++;
      } else {
        setIsTyping(false);
        clearInterval(timer);
      }
    }, 20); // typing speed
    return () => clearInterval(timer);
  }, [career.description]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.2 }}
    >
      <Card className="hover:shadow-[0_0_30px_rgba(139,92,246,0.15)] transition-all duration-500 overflow-hidden relative group">
        {/* Decorative gradient blob */}
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-500" />
        
        <CardHeader className="pb-4 relative z-10">
          <div className="flex items-start justify-between">
            <CardTitle className="flex items-center gap-3 text-3xl">
              <span className="text-4xl drop-shadow-md">{career.emoji}</span>
              <span className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                {career.title}
              </span>
            </CardTitle>
          </div>
          <CardDescription className="text-base mt-3 min-h-[3rem]">
            {typedDesc}
            {isTyping && <span className="typing-cursor" />}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="glass p-3 rounded-xl flex items-center gap-3">
              <Clock className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold">Timeline</p>
                <p className="font-medium text-sm">{career.timeline}</p>
              </div>
            </div>
            <div className="glass p-3 rounded-xl flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold">Demand</p>
                <p className="font-medium text-sm">{career.demandLevel}</p>
              </div>
            </div>
            <div className="glass p-3 rounded-xl flex items-center gap-3 col-span-2 md:col-span-1">
              <DollarSign className="w-5 h-5 text-amber-400" />
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold">Avg Salary</p>
                <p className="font-medium text-sm">{career.averageSalary}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Required Skills</h4>
            <div className="flex flex-wrap gap-2">
              {career.skills.map((skill, i) => (
                <Badge key={i} variant="default" className="text-sm py-1.5 px-3">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Wrench className="w-4 h-4" /> Tools to Learn
            </h4>
            <div className="flex flex-wrap gap-2">
              {career.tools.map((tool, i) => (
                <Badge key={i} variant="outline" className="text-sm bg-white/5 py-1.5 px-3">
                  {tool}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Your Roadmap</h4>
            <div className="space-y-3 bg-black/20 p-5 rounded-xl border border-white/5">
              {career.roadmap.map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold mt-0.5">
                    {i + 1}
                  </div>
                  <p className="text-sm text-gray-200 pt-1">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
