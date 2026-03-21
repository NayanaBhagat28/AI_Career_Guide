import { Router, type IRouter } from "express";
import { db, skillsTable, projectsTable, applicationsTable, profileTable } from "@workspace/db";
import { GetResumeFeedbackBody, GetSkillGapAnalysisBody } from "@workspace/api-zod";
import { openai } from "@workspace/integrations-openai-ai-server";

const router: IRouter = Router();

router.post("/advisor/resume-feedback", async (req, res) => {
  try {
    const parsed = GetResumeFeedbackBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.message });

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const systemPrompt = `You are an expert resume reviewer and career coach specializing in helping students land internships at top tech companies. Provide detailed, actionable feedback structured as:
1. **Overall Impression** (2-3 sentences)
2. **Strengths** (bullet points)
3. **Areas for Improvement** (bullet points with specific suggestions)
4. **Action Items** (numbered list of concrete next steps)
5. **ATS Optimization Tips** (keywords and formatting suggestions)

Be specific, constructive, and encouraging.`;

    const userMessage = `Please review this resume${parsed.data.targetRole ? ` for a ${parsed.data.targetRole} role` : ""}:\n\n${parsed.data.resumeText}`;

    const stream = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 8192,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    req.log.error({ err }, "Failed to get resume feedback");
    if (!res.headersSent) {
      return res.status(500).json({ error: "Internal server error" });
    }
    res.end();
  }
});

router.post("/advisor/skill-gap", async (req, res) => {
  try {
    const parsed = GetSkillGapAnalysisBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.message });

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const systemPrompt = `You are a technical career advisor who specializes in skill gap analysis for students seeking internships. Provide a thorough skill gap analysis structured as:
1. **Role Overview** - What this role typically requires
2. **Your Current Strengths** - Skills you already have that are relevant
3. **Critical Gaps** - Most important skills to develop immediately
4. **Nice-to-Have Skills** - Secondary skills that would make you more competitive
5. **Learning Roadmap** - Specific resources and timeline (courses, projects, certifications)
6. **Timeline Estimate** - How long to close the gap

Be specific with resources (mention actual courses, tools, or certifications).`;

    const userMessage = `Target role: ${parsed.data.targetRole}\nCurrent skills: ${parsed.data.currentSkills.join(", ")}\n\nPlease provide a detailed skill gap analysis.`;

    const stream = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 8192,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    req.log.error({ err }, "Failed to get skill gap analysis");
    if (!res.headersSent) {
      return res.status(500).json({ error: "Internal server error" });
    }
    res.end();
  }
});

router.get("/advisor/recommendations", async (req, res) => {
  try {
    const [skills, projects, applications, profiles] = await Promise.all([
      db.select().from(skillsTable),
      db.select().from(projectsTable),
      db.select().from(applicationsTable),
      db.select().from(profileTable).limit(1),
    ]);

    const profile = profiles[0];
    const skillNames = skills.map((s) => `${s.name} (${s.proficiency})`).join(", ");
    const projectTitles = projects.map((p) => p.title).join(", ");
    const appliedCompanies = applications.map((a) => a.company).join(", ");

    const prompt = `You are a career advisor specializing in internship placement for students. Based on the student profile below, recommend 5 specific internship opportunities.

Student Profile:
- Name: ${profile?.name || "Student"}
- Major: ${profile?.major || "Computer Science"}
- School: ${profile?.school || "University"}
- Target Role: ${profile?.targetRole || "Software Engineer Intern"}
- Skills: ${skillNames || "Python, JavaScript"}
- Projects: ${projectTitles || "Personal projects"}
- Companies already applied to: ${appliedCompanies || "None"}

Respond ONLY with valid JSON in this exact format:
{
  "recommendations": [
    {
      "company": "Company Name",
      "role": "Specific Role Title",
      "matchScore": 85,
      "reasoning": "Brief explanation of why this is a good match",
      "requiredSkills": ["Skill1", "Skill2", "Skill3"],
      "applicationTip": "Specific tip for applying to this company/role"
    }
  ]
}

Make recommendations for real, well-known companies. Match score should be between 60-98 based on skill alignment.`;

    const response = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    });

    const content = response.choices[0]?.message?.content || "{}";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(500).json({ error: "Failed to parse recommendations" });
    }
    const data = JSON.parse(jsonMatch[0]);
    return res.json(data);
  } catch (err) {
    req.log.error({ err }, "Failed to get recommendations");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
