import { Alert, Button, Collapse, H5 } from "@blueprintjs/core";
import Axios from "axios";
import React from "react";
import styled from "styled-components";
import { useConfig } from "../shared/Config";
import { useJobs } from "../shared/Jobs";
import JobTerminalManager from "../shared/JobTerminalManager";
import { useProjects } from "../shared/Projects";
import { useTheme } from "../shared/Themes";
import CommandOutputXterm from "./CommandOutputXterm";

const Container = styled.div`
    display: flex;
    flex-direction: column;
`;

const CommandTitleActions = styled.div`
    display: flex;
    max-width: 100%;
    justify-content: space-between;
    align-items: center;

    & > h5 {
        margin: 0 0 4px;
    }
    & > * {
        margin-left: 1rem;
    }
`;

const CommandOutputButtonsContainer = styled.div`
    display: flex;
    justify-content: space-around;
    width: 15%;
`;

const CommandHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

interface ICommandProps {
    command: IProjectCommand;
    socket: any;
    projectPath: string;
}

function getJobData(state, room: string) {
    return state[room] || "";
}

const Command: React.FC<ICommandProps> = React.memo(({ command, socket, projectPath }) => {
    const [isOutputOpen, setOutputOpen] = React.useState(true);
    const [isDeleteAlertOpen, setDeleteAlertOpen] = React.useState(false);
    const { theme } = useTheme();
    const room = command._id;
    const terminalManager = JobTerminalManager.getInstance();
    const { state: jobState, dispatch, ACTION_TYPES } = useJobs();
    const { config } = useConfig();
    const { updateProjects, activeProject, setActiveProject, deleteTask } = useProjects();

    const deleteCommand = React.useCallback(
        async shouldDelete => {
            try {
                if (shouldDelete) {
                    await deleteTask(activeProject._id!, room);
                    setDeleteAlertOpen(false);
                }
            } catch (error) {
                console.error(`Error deleting project: `, error);
            }
        },
        [activeProject, room],
    );

    const updateJobProcess = (room, jobProcess) => {
        dispatch({
            room,
            type: ACTION_TYPES.UPDATE_JOB_PROCESS,
            process: jobProcess,
        });
    };

    const clearJobOutput = room => {
        dispatch({
            type: ACTION_TYPES.CLEAR_OUTPUT,
            room,
        });
        terminalManager.clearTerminalInRoom(room);
    };

    const startJob = () => {
        clearJobOutput(room);
        socket.emit("subscribe", {
            room,
            command,
            projectPath,
        });
    };

    const stopJob = () => {
        const process = getJobData(jobState, room).process;
        const { pid } = process;

        socket.emit("unsubscribe", {
            room: command._id,
            pid,
        });
        updateJobProcess(room, {
            pid: -1,
        });
    };

    const isProcessRunning = (): boolean => {
        return getJobData(jobState, room).isRunning || false;
    };

    return (
        <>
            <Container>
                <CommandHeader>
                    <CommandTitleActions>
                        <H5 data-testid="command-name">{command.name}</H5>
                        <Button
                            data-testid="start-task-button"
                            icon="play"
                            intent="success"
                            minimal={true}
                            disabled={isProcessRunning()}
                            onClick={startJob}
                        />
                        <Button
                            data-testid="stop-task-button"
                            intent="danger"
                            icon="stop"
                            minimal={true}
                            disabled={!isProcessRunning()}
                            onClick={stopJob}
                        />
                    </CommandTitleActions>
                    <span data-testid="command-cmd">{command.cmd}</span>

                    <CommandOutputButtonsContainer>
                        <Button
                            onClick={() => clearJobOutput(room)}
                            icon="eraser"
                            minimal={true}
                            title="Clear Output"
                        />
                        <Button
                            onClick={() => setOutputOpen(!isOutputOpen)}
                            icon={isOutputOpen ? "eye-off" : "eye-open"}
                            minimal={true}
                            title={isOutputOpen ? "Hide Output" : "Show Output"}
                        />
                        <Button
                            onClick={() => setDeleteAlertOpen(true)}
                            icon="trash"
                            minimal={true}
                            intent="danger"
                            title="Delete Task"
                        />
                    </CommandOutputButtonsContainer>
                </CommandHeader>
                <Collapse isOpen={isOutputOpen} keepChildrenMounted={true}>
                    <CommandOutputXterm room={room} />
                </Collapse>
            </Container>
            <Alert
                cancelButtonText="Cancel"
                confirmButtonText="Yes, Delete"
                className={theme}
                icon="trash"
                intent="danger"
                isOpen={isDeleteAlertOpen}
                onCancel={() => setDeleteAlertOpen(false)}
                onConfirm={() => deleteCommand(true)}
            >
                <p>
                    Are you sure you want to delete command <b>{command.name || ""}</b> ?
                </p>
            </Alert>
        </>
    );
});

export default Command;
