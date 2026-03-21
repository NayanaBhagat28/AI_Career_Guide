import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Map, Star, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: <Sparkles className="w-8 h-8 text-primary" />,
    title: "AI-Powered Analysis",
    description: "Our advanced models analyze your interests to find the perfect career match."
  },
  {
    icon: <Map className="w-8 h-8 text-blue-400" />,
    title: "Personalized Roadmaps",
    description: "Get step-by-step guidance on exactly what to learn and when."
  },
  {
    icon: <Star className="w-8 h-8 text-amber-400" />,
    title: "Beginner Friendly",
    description: "No prior experience needed. We tailor the path to your current skill level."
  },
  {
    icon: <Zap className="w-8 h-8 text-emerald-400" />,
    title: "Instant Results",
    description: "Stop researching for weeks. Get your customized career plan in seconds."
  }
];

export function Features() {
  return (
    <section className="py-24 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-display font-bold mb-4"
          >
            Why use <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">AI Career Guide</span>?
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-lg max-w-2xl mx-auto"
          >
            Everything you need to launch a new career, minus the endless Google searches and confusion.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <Card className="h-full hover:-translate-y-2 transition-transform duration-300 bg-card/40 hover:bg-card/60">
                <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold font-display">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
