import { Router, type IRouter } from "express";
import healthRouter from "./health";
import profileRouter from "./profile";
import skillsRouter from "./skills";
import projectsRouter from "./projects";
import applicationsRouter from "./applications";
import openaiRouter from "./openai";
import advisorRouter from "./advisor";

const router: IRouter = Router();

router.use(healthRouter);
router.use(profileRouter);
router.use(skillsRouter);
router.use(projectsRouter);
router.use(applicationsRouter);
router.use(openaiRouter);
router.use(advisorRouter);

export default router;
