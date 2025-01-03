import React from "react";
import { IconSkateboarding } from "@tabler/icons-react";

const Loading = () => {
  return (
    <div className="loading">
      <div className="loading__content">
        <IconSkateboarding className="loading__icon" size={48} />
      </div>
    </div>
  );
};

export default Loading;
