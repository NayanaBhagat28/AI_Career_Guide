import { Router, type IRouter } from "express";
import { db, profileTable } from "@workspace/db";
import { UpdateProfileBody } from "@workspace/api-zod";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/profile", async (req, res) => {
  try {
    const profiles = await db.select().from(profileTable).limit(1);
    if (profiles.length === 0) {
      const [created] = await db.insert(profileTable).values({
        name: "Your Name",
        email: "you@example.com",
      }).returning();
      return res.json(created);
    }
    return res.json(profiles[0]);
  } catch (err) {
    req.log.error({ err }, "Failed to get profile");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/profile", async (req, res) => {
  try {
    const parsed = UpdateProfileBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.message });
    }
    const profiles = await db.select().from(profileTable).limit(1);
    if (profiles.length === 0) {
      const [created] = await db.insert(profileTable).values({
        name: "Your Name",
        email: "you@example.com",
        ...parsed.data,
      }).returning();
      return res.json(created);
    }
    const [updated] = await db.update(profileTable)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(profileTable.id, profiles[0].id))
      .returning();
    return res.json(updated);
  } catch (err) {
    req.log.error({ err }, "Failed to update profile");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
