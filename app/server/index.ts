import { captureException } from "@sentry/node";
import fixPath from "fix-path";
import { createServer } from "http";

import { getConfig } from "../shared/config";
import app from "./app";
import { JobManager } from "./services/job";
import SocketManager from "./services/socket";

/**
 * Starts Node server for ten-hands project.
 * This is the starting point of the backend.
 *
 * @export
 * @returns
 */
export async function startServer() {
  return new Promise((res, rej) => {
    try {
      // To fix /bin/sh: npm: command not found in macOS
      fixPath();
      const port = process.env.PORT || getConfig().port || 5010;
      app.set("port", port);
      const server = createServer(app);

      const socketManager: SocketManager = SocketManager.getInstance();
      JobManager.getInstance().bindSocketManager(socketManager);
      // Todo: ConfigManager

      socketManager.attachServer(server);

      server.listen(port, () => {
        console.log(`Server running on ${port}`);
        console.log(
          `Go to http://localhost:${port} in your browser if you started server from ten-hands cli.`
        );
        res(true);
      });
    } catch (error) {
      captureException(error);
      rej(error);
    }
  });
}

// startServer();
