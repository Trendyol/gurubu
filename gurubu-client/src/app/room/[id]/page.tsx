"use client";

import classnames from "classnames";
import { useState } from "react";

import ConnectingInfo from "@/components/room/connecting-info";
import GroomingBoard from "@/components/room/grooming-board";
import NicknameForm from "@/components/room/nickname-form";
import GroomingNavbar from "@/components/room/grooming-navbar";
import SnowToggleButton from "@/components/room/snow-toggle-button";
import SnowAnimation from "@/components/room/snow-animation";
import { SocketProvider } from "@/contexts/SocketContext";
import { GroomingRoomProvider } from "@/contexts/GroomingRoomContext";
import "@/styles/room/style.scss";
import { Issue } from "@/shared/interfaces";

const GroomingRoom = ({ params }: { params: { id: string }}) => {
  const [showNickNameForm, setShowNickNameForm] = useState(false);
  const [isSnowActive, setIsSnowActive] = useState(false);

  const toggleSnow = () => {
    setIsSnowActive(!isSnowActive);
  };

  return (
    <GroomingRoomProvider roomId={params.id}>
      <SocketProvider>
        <main
          className={classnames("grooming-room", {
            "nickname-form-active": showNickNameForm,
            "snow-active": isSnowActive,
          })}
        >
          <SnowAnimation isActive={isSnowActive} />
          <ConnectingInfo roomId={params.id} />
          <GroomingNavbar showNickNameForm={showNickNameForm} roomId={params.id} />
          <GroomingBoard
            roomId={params.id}
            showNickNameForm={showNickNameForm}
            setShowNickNameForm={setShowNickNameForm}
          />
          {showNickNameForm && <NicknameForm roomId={params.id} />}
          <SnowToggleButton isActive={isSnowActive} onToggle={toggleSnow} />
        </main>
      </SocketProvider>
    </GroomingRoomProvider>
  );
};

export default GroomingRoom;