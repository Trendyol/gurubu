import React from "react";
import { IconMessagePlus } from "@tabler/icons-react";

const Feedback = () => {
  const feedbackText = "We'd love to hear your thoughts!";
  const feedbackSheetLink = process.env.NEXT_PUBLIC_FEEDBACK_SHEET_LINK;

  if(!feedbackSheetLink){
    return null;
  }

  return (
    <div className="feedback-container">
      <div className="feedback-content">
        <p>{feedbackText}</p>
        <a href={feedbackSheetLink} className="feedback-content__link" target="_blank">
          <p>Give Feedback</p>
          <IconMessagePlus width={20} height={20} />
        </a>
      </div>
    </div>
  );
};

export default Feedback;
