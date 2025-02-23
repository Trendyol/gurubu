import React, { useEffect, useState } from "react";
import Sidebar from "@/components/common/sidebar";
import classNames from "classnames";
import GroomingBoardJiraTable from "../grooming-board/grooming-board-jira-table";
import { useGroomingRoom } from "@/contexts/GroomingRoomContext";
import { IconPlayerTrackNext, IconPlayerTrackPrev } from "@tabler/icons-react";

interface Props {
  roomId: string;
}

const JiraSidebar = ({ roomId }: Props) => {
  const { groomingInfo, jiraSidebarExpanded, setJiraSidebarExpanded } = useGroomingRoom();

  const isJiraSidebarExist =
    groomingInfo.issues && groomingInfo.issues.length > 0;

  const onClose = () => {
    setJiraSidebarExpanded(false);
  };

  const handleToggleJiraSidebar = () => {
    setJiraSidebarExpanded(!jiraSidebarExpanded);
  };

  useEffect(() => {
    if (isJiraSidebarExist) {
      document.body.classList.add("jira-padding-right");
    }
    return () => {
      document.body.classList.remove("jira-padding-right");
    };
  }, [isJiraSidebarExist]);

  return (
    <Sidebar
      position="right"
      width={jiraSidebarExpanded ? "800px" : "86px"}
      isOpen={isJiraSidebarExist}
      onClose={onClose}
      showCloseButton={false}
    >
      <div
        className={classNames("jira-sidebar-content", {
          expanded: jiraSidebarExpanded,
        })}
      >
        <div className="jira-sidebar-icon-container" onClick={handleToggleJiraSidebar}>
          {!jiraSidebarExpanded && (
            <IconPlayerTrackPrev
              className="jira-sidebar-icon"
            />
          )}
          {jiraSidebarExpanded && (
            <IconPlayerTrackNext
              className="jira-sidebar-icon"
            />
          )}
        </div>
        {!jiraSidebarExpanded && (
          <div
            className="jira-sidebar-shortened-text-container"
            onClick={handleToggleJiraSidebar}
          >
            <p className="jira-sidebar-shortened-text">Jira Table</p>
          </div>
        )}
        {jiraSidebarExpanded && <GroomingBoardJiraTable roomId={roomId} />}
      </div>
    </Sidebar>
  );
};

export default JiraSidebar;
