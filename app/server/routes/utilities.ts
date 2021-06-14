import express from "express";

import {
  getGitInfo,
  isValidPath,
  updateRunningTaskCount,
} from "../controllers/utilities";
const router = express.Router();

router.post("/is-valid-path", isValidPath);
router.post("/git-info", getGitInfo);
router.put("/running-task-count", updateRunningTaskCount);

export default router;
