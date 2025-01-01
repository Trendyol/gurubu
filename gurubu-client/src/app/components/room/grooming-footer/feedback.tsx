import React from "react";
import { IconMessagePlus } from "@tabler/icons-react";

const Feedback = () => {
  const feedbackSheetLink = process.env.NEXT_PUBLIC_FEEDBACK_SHEET_LINK;

  if(!feedbackSheetLink){
    return null;
  }

  return (
    <div className="feedback-container">
      <div className="feedback-content">
        <a href={feedbackSheetLink} className="feedback-content__link" target="_blank">
          <p>Give Feedback</p>
          <IconMessagePlus width={16} height={16} />
        </a>
      </div>
    </div>
  );
};

export default Feedback;
