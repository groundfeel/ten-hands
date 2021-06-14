import * as SentryNode from "@sentry/node";
import * as Tracing from "@sentry/tracing";
import bodyParser from "body-parser";
import cors from "cors";
import express, { Request, Response } from "express";
import { existsSync } from "fs";
import morgan from "morgan";
import path from "path";
import handler from "serve-handler";

import { getConfig } from "../shared/config";
import projectRoutes from "./routes/projects";
import utilsRoutes from "./routes/utilities";

const __DEV__ = process.env.NODE_ENV !== "production";

const app = express();

if (getConfig().sendErrorReports) {
  SentryNode.init({
    dsn: "https://5b53cd34eebc4578b8264fae53ffd120@o443842.ingest.sentry.io/5418371",
    integrations: [
      // enable HTTP calls tracing
      new SentryNode.Integrations.Http({ tracing: true }),
      // enable Express.js middleware tracing
      new Tracing.Integrations.Express({ app }),
    ],
    tracesSampleRate: __DEV__ ? 1.0 : 0.5,
    beforeSend(event) {
      // Modify the event here
      if (event.user) {
        // Don't send user's email address
        delete event.user.email;
        delete event.user.ip_address;
      }
      return event;
    },
  });
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// RequestHandler creates a separate execution context using domains, so that every
// transaction/span/breadcrumb is attached to its own Hub instance
app.use(SentryNode.Handlers.requestHandler() as express.RequestHandler);
// TracingHandler creates a trace for every incoming request
app.use(SentryNode.Handlers.tracingHandler());

app.use(cors());
app.use(morgan("dev"));

app.use(express.static(path.join(__dirname, "public")));

app.use("/projects", projectRoutes);
app.use("/utils", utilsRoutes);

app.get("/___serve-ui", async (req, res) => {
  const publicPath = path.resolve(__dirname, "..", "ui");
  if (existsSync(publicPath)) {
    return await handler(req, res, {
      public: publicPath,
    });
  }
  res.status(400).send("Did not find UI files.");
});

// The error handler must be before any other error middleware and after all controllers
app.use(SentryNode.Handlers.errorHandler() as express.ErrorRequestHandler);

// Default Error Handler
app.use(function (error: Error, _req: Request, res: Response) {
  console.error(error.stack);
  SentryNode.captureException(error);
  return res.status(500).send({ error });
});

process.on("uncaughtException", function (err) {
  console.error(err);
  console.log("Node NOT Exiting...");
});

process.on("SIGINT", function (signal) {
  console.warn(`Server being killed with ${signal}`);
  process.exit(0);
});

process.on("exit", function (code) {
  console.warn("Ten Hands server exiting with code: " + code);
});

export default app;
