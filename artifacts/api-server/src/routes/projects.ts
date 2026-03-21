import { Router, type IRouter } from "express";
import { db, projectsTable } from "@workspace/db";
import { CreateProjectBody, UpdateProjectBody, UpdateProjectParams, DeleteProjectParams } from "@workspace/api-zod";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/projects", async (req, res) => {
  try {
    const projects = await db.select().from(projectsTable).orderBy(projectsTable.createdAt);
    return res.json(projects);
  } catch (err) {
    req.log.error({ err }, "Failed to list projects");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/projects", async (req, res) => {
  try {
    const parsed = CreateProjectBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.message });
    }
    const [project] = await db.insert(projectsTable).values(parsed.data).returning();
    return res.status(201).json(project);
  } catch (err) {
    req.log.error({ err }, "Failed to create project");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/projects/:id", async (req, res) => {
  try {
    const params = UpdateProjectParams.safeParse(req.params);
    if (!params.success) return res.status(400).json({ error: "Invalid id" });
    const parsed = UpdateProjectBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.message });
    const [project] = await db.update(projectsTable)
      .set(parsed.data)
      .where(eq(projectsTable.id, params.data.id))
      .returning();
    if (!project) return res.status(404).json({ error: "Not found" });
    return res.json(project);
  } catch (err) {
    req.log.error({ err }, "Failed to update project");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/projects/:id", async (req, res) => {
  try {
    const params = DeleteProjectParams.safeParse(req.params);
    if (!params.success) return res.status(400).json({ error: "Invalid id" });
    await db.delete(projectsTable).where(eq(projectsTable.id, params.data.id));
    return res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete project");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
