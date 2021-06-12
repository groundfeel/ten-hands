import { Button, Classes } from "@blueprintjs/core";
import React from "react";
import styled from "styled-components";

// import { useConfig } from "../shared/stores/ConfigStore";
import { isRunningInElectron } from "../../utils/electron";
import { useProjects } from "../shared/stores/ProjectStore";
import { useTheme } from "../shared/stores/ThemeStore";

const Container = styled.div`
  background: ${(props) =>
    props.theme === Classes.DARK ? "#293742" : "#BFCCD6"};
  z-index: 9999;
  width: 100%;
  height: 100%;
  font-size: 0.75em;
  padding: 0 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Statusbar: React.FC = () => {
  const { theme } = useTheme();
  const { totalRunningTaskCount, activeProject, projectsRunningTaskCount } =
    useProjects();
  const [isUpdateAvailable, setIsUpdateAvailable] =
    React.useState<boolean>(false);

  // const { changeConfigOption, config } = useConfig();
  // const changeTerminalView = () => {
  //   if (config.taskViewStyle === "rows") {
  //     changeConfigOption("taskViewStyle", "tabs");
  //   } else {
  //     changeConfigOption("taskViewStyle", "rows");
  //   }
  // };

  const checkUpdates = async (): Promise<any> => {
    try {
      if (isRunningInElectron()) {
        const { ipcRenderer } = require("electron");
        const update = ipcRenderer.sendSync("get-updates");
        // console.log("update:", update);
        if (update && !update.prerelease) {
          setIsUpdateAvailable(true);
        } else {
          setIsUpdateAvailable(false);
        }
      }
    } catch (error) {
      console.log(`checkUpdates error: `, error);
      setIsUpdateAvailable(false);
    }
  };

  const openDownloadsPage = (e) => {
    try {
      e.preventDefault();
      e.stopPropagation();
      if (isRunningInElectron()) {
        const { ipcRenderer } = require("electron");
        ipcRenderer.sendSync("open-downloads-page");
      }
    } catch (error) {
      console.log("error:", error);
    }
  };
  React.useEffect(() => {
    checkUpdates();
  }, []);

  const activeProjectRunningTaskCount =
    projectsRunningTaskCount[activeProject._id];

  return (
    <React.Fragment>
      <Container theme={theme}>
        <div className="left" data-testid="total-running-task-count">
          {isRunningInElectron() && isUpdateAvailable && (
            <Button
              data-testid="notifications-button"
              icon="download"
              minimal
              intent="success"
              onClick={openDownloadsPage}
            >
              Update Available
            </Button>
          )}
          Total running tasks: {totalRunningTaskCount}
          {/* For future release where you can swith terminals view from list to tabs. */}
          {/* <Button
            small
            minimal
            onClick={() => changeTerminalView()}
            style={{ fontSize: "1em", marginLeft: 10 }}
          >
            Switch Terminal View
          </Button> */}
        </div>
        <div className="right" data-testid="project-running-task-count">
          Tasks running in this project: {activeProjectRunningTaskCount ?? 0}
        </div>
      </Container>
    </React.Fragment>
  );
};

export default Statusbar;
