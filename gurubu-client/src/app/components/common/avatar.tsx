import React from "react";
import parse from "html-react-parser";

interface Props {
  svg: string;
}

const Avatar = ({ svg }: Props) => {
  return <div className="avatar-container">{parse(svg ?? "")}</div>;
};

export default Avatar;
