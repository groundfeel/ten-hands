import { Icon } from "@blueprintjs/core";
import React from "react";
import { Draggable, DraggableProps, DraggableProvided } from "react-beautiful-dnd";
import styled from "styled-components";

interface ICommandsOrderListItemProps {
    command: IProjectCommand;
    index: number;
}

const CommandItem = styled.div`
    padding: 1em;
    display: flex;
    justify-content: space-between;
    user-select: none;
    &:hover {
        border: 1px dotted gray;
    }
`;

const CommandsOrderListItem: React.FC<ICommandsOrderListItemProps> = React.memo(({ command, index }) => {
    return (
        <Draggable draggableId={command._id} index={index}>
            {(provided: DraggableProvided) => (
                <CommandItem {...provided.draggableProps} {...provided.dragHandleProps} ref={provided.innerRef}>
                    {command.name}
                    <Icon icon={"drag-handle-horizontal"} />
                </CommandItem>
            )}
        </Draggable>
    );
});

export default CommandsOrderListItem;
