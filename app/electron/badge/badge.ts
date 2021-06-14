/**
 * Displays badge on taskbar with total running task count.
 * Based on https://github.com/ThreadKM/electron-windows-badge
 */

import { captureException } from "@sentry/electron";
import { app, BrowserWindow, nativeImage } from "electron";

import { logger } from "../logger";

export class Badge {
  ctx: CanvasRenderingContext2D | null;
  window: BrowserWindow;
  constructor(window: BrowserWindow) {
    this.window = window;
  }

  generate(count = 0) {
    return this.window.webContents.executeJavaScript(
      `window.createBadge = function ${this.createBadge}; window.createBadge(${count});`
    );
  }

  public createBadge(count = 0) {
    if (count === 0) {
      return null;
    }
    const canvas = document.createElement("canvas");
    canvas.height = 16;
    canvas.width = 16;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }
    ctx.fillStyle = "#CC1757";
    ctx.beginPath();
    ctx.arc(8, 8, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = "normal bolder 11px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "white";
    ctx.fillText(count > 99 ? "99+" : count + "", 8, 8);

    return canvas.toDataURL();
  }

  public update(count = 0) {
    if (!this.window || this.window.isDestroyed()) {
      return;
    }

    const os = process.platform;

    if (["linux", "darwin"].includes(os)) {
      app.setBadgeCount(count);
      return;
    }

    if (count === 0) {
      this.window.setOverlayIcon(null, "No tasks running.");
      return;
    }
    this.generate(count)
      ?.then((dataURL: string) => {
        if (!dataURL) {
          this.window.setOverlayIcon(null, "Total running tasks.");
          return;
        }

        const image = nativeImage.createFromDataURL(dataURL);

        if (!image) {
          return;
        }

        this.window.setOverlayIcon(
          image,
          "Badge to display count of running tasks."
        );
      })
      .catch((error) => {
        logger.error(
          `error setting task count badge: ${JSON.stringify(error)}`
        );

        captureException(error);
      });
  }
}
