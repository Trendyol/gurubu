"use client";
import React from "react";
import { IconBrandGithub } from "@tabler/icons-react";
import { useGroomingRoom } from "@/contexts/GroomingRoomContext";
import Feedback from "./feedback";
import classNames from "classnames";

const GroomingFooter = () => {
  const currentDate = new Date().getFullYear();
  const { jiraSidebarExpanded } = useGroomingRoom();

  return (
    <footer className={classNames("grooming-footer", {"jira-sidebar-expanded": jiraSidebarExpanded})}>
      <div className="grooming-footer__content">
        <div className="grooming-footer__content-copyright">
          © 2023 - {currentDate} GuruBu
        </div>
        <a
          href="https://github.com/Trendyol/gurubu"
          target="_blank"
          className="grooming-footer__content-socials-container"
        >
          <p>Contribute!</p> <IconBrandGithub />
        </a>
        <Feedback />
      </div>
    </footer>
  );
};

export default GroomingFooter;
