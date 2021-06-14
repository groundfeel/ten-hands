import { MotionValue, useMotionValue } from "framer-motion";
import throttle from "lodash/throttle";
import React, { useEffect } from "react";
import { useRecoilValue } from "recoil";

import JobTerminal from "../shared/JobTerminal";
import JobTerminalManager from "../shared/JobTerminalManager";
import { configAtom } from "../shared/state/atoms";
import { useTheme } from "../shared/stores/ThemeStore";
import Resizable from "./Resizable";

interface ICommandProps {
  taskID: string;
  index: number;
  containerWidth: MotionValue;
}

const CommandOutputXterm: React.FC<ICommandProps> = React.memo(
  ({ taskID, index, containerWidth }) => {
    const elRef = React.useRef<HTMLDivElement>(null);
    const terminal = React.useRef<JobTerminal | null>(null);
    const { theme } = useTheme();
    const currentTheme = React.useRef<any>(null);
    const themeTimeout = React.useRef<any>(null);
    // const [height, setHeight] = useState<number>(400);
    // const [width, setWidth] = useState<number>(800);
    const height = useMotionValue(400);
    // const { config } = useConfig();

    const config = useRecoilValue(configAtom);

    const setTheme = () => {
      if (terminal && terminal.current) {
        terminal.current.setTheme(theme);
        if (currentTheme && currentTheme.current) {
          currentTheme.current = theme;
        }
      }
    };

    const removeTheme = () => {
      if (terminal && terminal.current) {
        terminal.current.removeTheme();
      }
    };

    /* eslint-disable react-hooks/exhaustive-deps */
    useEffect(() => {
      if (elRef && elRef.current) {
        // Set default dimensions based on parent.
        // First parent is a div from react-resize. So take grandparent.
        const parentWidth: number =
          elRef.current.parentElement?.parentElement?.getBoundingClientRect()
            .width ?? 800;
        const parentHeight: number =
          elRef.current.parentElement?.parentElement?.getBoundingClientRect()
            .height ?? 400;

        height.set(parentHeight);
        containerWidth.set(parentWidth);
        if (terminal.current === null) {
          terminal.current =
            JobTerminalManager.getInstance().createJobTerminal(taskID);
          terminal.current.attachTo(
            elRef.current,
            config.terminalRenderer ?? "canvas"
          );
        }
      }
    }, []);

    useEffect(() => {
      if (!config.enableTerminalTheme) {
        removeTheme();
      }

      setTheme();

      return () => {
        // Remove unmounting
        removeTheme();
        if (themeTimeout.current) {
          clearTimeout(themeTimeout.current);
        }
      };
    }, [theme, config, index]);

    const handleResize = React.useCallback(() => {
      if (!terminal || !terminal.current) {
        return;
      }
      // Fit in next callstack. fitAddon calculations are not keeping up with resize speed.
      setTimeout(() => {
        terminal.current?.fitAddon.fit();
      }, 0);
    }, []);

    // For some reason, the width set by ResizeSensor on parent doesn't work if not throttled
    const handleResizeThrottled = React.useCallback(
      throttle(handleResize, 50),
      []
    );

    useEffect(() => {
      return containerWidth.onChange(() => {
        handleResizeThrottled();
      });
    }, []);

    return (
      <Resizable onResize={handleResize} width={containerWidth} height={height}>
        <div
          ref={elRef}
          style={{
            marginTop: 10,
            width: "100%",
            height: "100%",
            whiteSpace: "pre-wrap",
          }}
        />
      </Resizable>
    );
  }
);

export default CommandOutputXterm;
