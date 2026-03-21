import { Router, type IRouter } from "express";
import { db, conversations, messages } from "@workspace/db";
import {
  CreateOpenaiConversationBody,
  SendOpenaiMessageBody,
  GetOpenaiConversationParams,
  DeleteOpenaiConversationParams,
  ListOpenaiMessagesParams,
  SendOpenaiMessageParams,
} from "@workspace/api-zod";
import { eq } from "drizzle-orm";
import { openai } from "@workspace/integrations-openai-ai-server";

const router: IRouter = Router();

router.get("/openai/conversations", async (req, res) => {
  try {
    const all = await db.select().from(conversations).orderBy(conversations.createdAt);
    return res.json(all);
  } catch (err) {
    req.log.error({ err }, "Failed to list conversations");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/openai/conversations", async (req, res) => {
  try {
    const parsed = CreateOpenaiConversationBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.message });
    const [conv] = await db.insert(conversations).values({ title: parsed.data.title }).returning();
    return res.status(201).json(conv);
  } catch (err) {
    req.log.error({ err }, "Failed to create conversation");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/openai/conversations/:id", async (req, res) => {
  try {
    const params = GetOpenaiConversationParams.safeParse(req.params);
    if (!params.success) return res.status(400).json({ error: "Invalid id" });
    const [conv] = await db.select().from(conversations).where(eq(conversations.id, params.data.id));
    if (!conv) return res.status(404).json({ error: "Not found" });
    const msgs = await db.select().from(messages).where(eq(messages.conversationId, params.data.id)).orderBy(messages.createdAt);
    return res.json({ ...conv, messages: msgs });
  } catch (err) {
    req.log.error({ err }, "Failed to get conversation");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/openai/conversations/:id", async (req, res) => {
  try {
    const params = DeleteOpenaiConversationParams.safeParse(req.params);
    if (!params.success) return res.status(400).json({ error: "Invalid id" });
    const result = await db.delete(conversations).where(eq(conversations.id, params.data.id)).returning();
    if (result.length === 0) return res.status(404).json({ error: "Not found" });
    return res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete conversation");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/openai/conversations/:id/messages", async (req, res) => {
  try {
    const params = ListOpenaiMessagesParams.safeParse(req.params);
    if (!params.success) return res.status(400).json({ error: "Invalid id" });
    const msgs = await db.select().from(messages).where(eq(messages.conversationId, params.data.id)).orderBy(messages.createdAt);
    return res.json(msgs);
  } catch (err) {
    req.log.error({ err }, "Failed to list messages");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/openai/conversations/:id/messages", async (req, res) => {
  try {
    const params = SendOpenaiMessageParams.safeParse(req.params);
    if (!params.success) return res.status(400).json({ error: "Invalid id" });
    const parsed = SendOpenaiMessageBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.message });

    const convId = params.data.id;

    await db.insert(messages).values({
      conversationId: convId,
      role: "user",
      content: parsed.data.content,
    });

    const allMessages = await db.select().from(messages).where(eq(messages.conversationId, convId)).orderBy(messages.createdAt);

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const chatMessages = allMessages.map((m) => ({
      role: m.role as "user" | "assistant" | "system",
      content: m.content,
    }));

    chatMessages.unshift({
      role: "system",
      content: `You are an expert AI Career Advisor for students. You help with:
- Internship and job search strategies
- Resume and cover letter tips
- Technical interview preparation
- Career planning and skill development
- Networking advice
- Industry insights

Be encouraging, specific, and actionable. Ask clarifying questions when needed. Format your responses clearly with bullet points or numbered lists when appropriate.`,
    });

    let fullResponse = "";

    const stream = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 8192,
      messages: chatMessages,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        fullResponse += content;
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    await db.insert(messages).values({
      conversationId: convId,
      role: "assistant",
      content: fullResponse,
    });

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    req.log.error({ err }, "Failed to send message");
    if (!res.headersSent) {
      return res.status(500).json({ error: "Internal server error" });
    }
    res.end();
  }
});

export default router;
