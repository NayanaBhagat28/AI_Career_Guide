import { Router, type IRouter } from "express";
import { db, applicationsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

const VALID_STATUSES = ["wishlist", "applied", "phone_screen", "interview", "offer", "rejected", "accepted"];

function validateApplicationBody(body: Record<string, unknown>) {
  const errors: string[] = [];
  if (body.company !== undefined && typeof body.company !== "string") errors.push("company must be a string");
  if (body.role !== undefined && typeof body.role !== "string") errors.push("role must be a string");
  if (body.status !== undefined && !VALID_STATUSES.includes(body.status as string)) errors.push("invalid status");
  return errors;
}

router.get("/applications", async (req, res) => {
  try {
    const applications = await db.select().from(applicationsTable).orderBy(applicationsTable.createdAt);
    return res.json(applications);
  } catch (err) {
    req.log.error({ err }, "Failed to list applications");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/applications", async (req, res) => {
  try {
    const body = req.body as Record<string, unknown>;
    const errors = validateApplicationBody(body);
    if (!body.company || !body.role || !body.status) {
      return res.status(400).json({ error: "company, role, and status are required" });
    }
    if (errors.length > 0) return res.status(400).json({ error: errors.join(", ") });

    const [application] = await db.insert(applicationsTable).values({
      company: body.company as string,
      role: body.role as string,
      location: body.location as string | undefined,
      status: body.status as string,
      appliedDate: body.appliedDate as string | undefined,
      notes: body.notes as string | undefined,
      jobUrl: body.jobUrl as string | undefined,
    }).returning();
    return res.status(201).json(application);
  } catch (err) {
    req.log.error({ err }, "Failed to create application");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/applications/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });
    const body = req.body as Record<string, unknown>;
    const errors = validateApplicationBody(body);
    if (errors.length > 0) return res.status(400).json({ error: errors.join(", ") });
    const updateData: Record<string, unknown> = {};
    if (body.company !== undefined) updateData.company = body.company;
    if (body.role !== undefined) updateData.role = body.role;
    if (body.location !== undefined) updateData.location = body.location;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.appliedDate !== undefined) updateData.appliedDate = body.appliedDate;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.jobUrl !== undefined) updateData.jobUrl = body.jobUrl;

    const [application] = await db.update(applicationsTable)
      .set(updateData as { company?: string; role?: string; location?: string; status?: string; appliedDate?: string; notes?: string; jobUrl?: string })
      .where(eq(applicationsTable.id, id))
      .returning();
    if (!application) return res.status(404).json({ error: "Not found" });
    return res.json(application);
  } catch (err) {
    req.log.error({ err }, "Failed to update application");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/applications/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });
    await db.delete(applicationsTable).where(eq(applicationsTable.id, id));
    return res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete application");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
