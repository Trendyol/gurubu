import React, { useEffect, useState } from "react";
import { createAvatar } from '@dicebear/core';
import { avataaars } from '@dicebear/collection';

const Avatar = () => {
  const [svg, setSvg] = useState("");

  useEffect(() => {
    const avatar = createAvatar(avataaars, {
      seed: Math.random().toString(36).substring(2),
    });
    setSvg(avatar.toString());
  }, []);

  return <div className="avatar-container" dangerouslySetInnerHTML={{ __html: svg }}></div>;
};

export default Avatar;
