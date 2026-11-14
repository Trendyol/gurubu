import React from "react";
import { IconExternalLink } from "@tabler/icons-react";
import { SIDEHUB_GURUBU_URL } from "@/shared/sidehub";

const Feedback = () => {
  return (
    <div className="feedback-container">
      <div className="feedback-content">
        <a
          href={SIDEHUB_GURUBU_URL}
          className="feedback-content__link feedback-content__link--sidehub"
          target="_blank"
          rel="noopener noreferrer"
        >
          <p>Give Feedback on SideHub</p>
          <IconExternalLink width={16} height={16} />
        </a>
      </div>
    </div>
  );
};

export default Feedback;