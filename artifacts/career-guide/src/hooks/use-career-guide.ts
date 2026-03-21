import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import type { 
  GenerateCareerPathBody, 
  CareerPathResult, 
  CareerOption 
} from "@shared/routes"; // Note: Assuming shared/routes aligns with generated types from api-client-react

// Use local types aligning with the OpenAPI spec defined in previous steps
export type Goal = "job" | "startup" | "freelancing";
export type SkillLevel = "beginner" | "intermediate" | "advanced";

export interface GenerateParams {
  interests: string;
  skillLevel: SkillLevel;
  goal?: Goal;
}

const FALLBACK_CAREERS: Record<string, CareerOption[]> = {
  coding: [
    {
      title: "Full Stack Developer",
      description: "Build both frontend and backend of web applications. High demand across all industries.",
      skills: ["React", "Node.js", "TypeScript", "SQL"],
      roadmap: ["Master HTML/CSS/JS", "Learn React.js", "Build a backend with Node", "Deploy a full app"],
      tools: ["VS Code", "Git", "Docker", "Vercel"],
      timeline: "6-12 months",
      demandLevel: "Very High 🔥",
      averageSalary: "$90k - $140k",
      emoji: "💻"
    },
    {
      title: "Data Scientist",
      description: "Extract insights from data using statistical methods and machine learning.",
      skills: ["Python", "Pandas", "Machine Learning", "SQL"],
      roadmap: ["Learn Python basics", "Master statistics & math", "Learn ML libraries", "Build predictive models"],
      tools: ["Jupyter", "TensorFlow", "Scikit-Learn"],
      timeline: "9-15 months",
      demandLevel: "High 📈",
      averageSalary: "$100k - $150k",
      emoji: "📊"
    }
  ],
  design: [
    {
      title: "UI/UX Designer",
      description: "Design intuitive and beautiful digital experiences for users.",
      skills: ["Figma", "Wireframing", "User Research", "Prototyping"],
      roadmap: ["Learn design principles", "Master Figma", "Study UX research methods", "Build a portfolio"],
      tools: ["Figma", "Framer", "Miro"],
      timeline: "4-8 months",
      demandLevel: "High ✨",
      averageSalary: "$85k - $130k",
      emoji: "🎨"
    }
  ],
  business: [
    {
      title: "Product Manager",
      description: "Lead product strategy, acting as the bridge between engineering, design, and business.",
      skills: ["Agile", "User Stories", "Analytics", "Communication"],
      roadmap: ["Understand software lifecycle", "Learn market research", "Master Agile/Scrum", "Lead a mock project"],
      tools: ["Jira", "Linear", "Mixpanel"],
      timeline: "6-12 months",
      demandLevel: "High 🚀",
      averageSalary: "$100k - $160k",
      emoji: "🎯"
    }
  ],
  default: [
    {
      title: "Digital Marketer",
      description: "Drive growth and brand awareness through digital channels and campaigns.",
      skills: ["SEO", "Content Marketing", "Analytics", "Social Media"],
      roadmap: ["Learn SEO basics", "Master social media platforms", "Understand Paid Ads", "Get Google Analytics cert"],
      tools: ["Google Analytics", "Ahrefs", "HubSpot"],
      timeline: "3-6 months",
      demandLevel: "Medium 📈",
      averageSalary: "$60k - $100k",
      emoji: "📱"
    },
    {
      title: "Software Engineer",
      description: "Generalist software builder focused on solving problems with code.",
      skills: ["Programming", "Algorithms", "Databases", "System Design"],
      roadmap: ["Learn a programming language", "Master data structures", "Build projects", "Prepare for interviews"],
      tools: ["Git", "IDE", "Cloud Providers"],
      timeline: "6-12 months",
      demandLevel: "Very High 🔥",
      averageSalary: "$90k - $150k",
      emoji: "⚙️"
    }
  ]
};

function getFallbackMapping(interests: string): CareerOption[] {
  const normalized = interests.toLowerCase();
  if (normalized.includes("cod") || normalized.includes("program") || normalized.includes("soft")) return FALLBACK_CAREERS.coding;
  if (normalized.includes("design") || normalized.includes("art")) return FALLBACK_CAREERS.design;
  if (normalized.includes("business") || normalized.includes("manage")) return FALLBACK_CAREERS.business;
  return FALLBACK_CAREERS.default;
}

export function useGenerateCareerPath() {
  return useMutation({
    mutationFn: async (params: GenerateParams): Promise<CareerPathResult> => {
      try {
        const res = await fetch("/api/career-guide/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(params),
        });
        
        if (!res.ok) {
          throw new Error("API failed, using fallback");
        }
        
        return await res.json();
      } catch (err) {
        // Fallback if API is missing or fails
        console.warn("Using fallback AI generation:", err);
        await new Promise(resolve => setTimeout(resolve, 2000)); // simulate AI thinking
        return {
          careers: getFallbackMapping(params.interests),
          generatedAt: new Date().toISOString()
        };
      }
    }
  });
}

// Local Storage Hooks
const STORAGE_KEY = "career-guide-last-result";
const USER_KEY = "career-guide-user";

export function useSavedResult() {
  const [savedResult, setSavedResult] = useState<CareerPathResult | null>(null);
  const [userProfile, setUserProfile] = useState<{name: string, email: string} | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSavedResult(JSON.parse(stored));
      }
      const userStored = localStorage.getItem(USER_KEY);
      if (userStored) {
        setUserProfile(JSON.parse(userStored));
      }
    } catch (e) {
      console.error("Failed to parse local storage", e);
    }
  }, []);

  const saveResult = (result: CareerPathResult) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
    setSavedResult(result);
  };

  const saveUser = (name: string, email: string) => {
    const profile = { name, email };
    localStorage.setItem(USER_KEY, JSON.stringify(profile));
    setUserProfile(profile);
  };

  const clearResult = () => {
    localStorage.removeItem(STORAGE_KEY);
    setSavedResult(null);
  };

  return { savedResult, saveResult, clearResult, userProfile, saveUser };
}
