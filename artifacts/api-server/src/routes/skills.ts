import { Router, type IRouter } from "express";
import { db, skillsTable } from "@workspace/db";
import { CreateSkillBody, UpdateSkillBody, UpdateSkillParams, DeleteSkillParams } from "@workspace/api-zod";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/skills", async (req, res) => {
  try {
    const skills = await db.select().from(skillsTable).orderBy(skillsTable.createdAt);
    return res.json(skills);
  } catch (err) {
    req.log.error({ err }, "Failed to list skills");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/skills", async (req, res) => {
  try {
    const parsed = CreateSkillBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.message });
    }
    const [skill] = await db.insert(skillsTable).values(parsed.data).returning();
    return res.status(201).json(skill);
  } catch (err) {
    req.log.error({ err }, "Failed to create skill");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/skills/:id", async (req, res) => {
  try {
    const params = UpdateSkillParams.safeParse(req.params);
    if (!params.success) return res.status(400).json({ error: "Invalid id" });
    const parsed = UpdateSkillBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.message });
    const [skill] = await db.update(skillsTable)
      .set(parsed.data)
      .where(eq(skillsTable.id, params.data.id))
      .returning();
    if (!skill) return res.status(404).json({ error: "Not found" });
    return res.json(skill);
  } catch (err) {
    req.log.error({ err }, "Failed to update skill");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/skills/:id", async (req, res) => {
  try {
    const params = DeleteSkillParams.safeParse(req.params);
    if (!params.success) return res.status(400).json({ error: "Invalid id" });
    await db.delete(skillsTable).where(eq(skillsTable.id, params.data.id));
    return res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete skill");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
