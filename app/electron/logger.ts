import { Logger } from "just-enough-logger";
import { join } from "path";

import { CONFIG_FILES, CONFIG_FILES_DIR } from "../shared/config";

export const logger = new Logger({
  transports: ["file", "console"],
  file: CONFIG_FILES.logFile,
});

export const stream = logger.getLogStream();

export const devLogger = new Logger({
  transports: ["file", "console"],
  file: join(CONFIG_FILES_DIR, "requests.log"),
});
