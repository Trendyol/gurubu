"use client";

import classnames from "classnames";
import { useState } from "react";

import ConnectingInfo from "@/components/room/connecting-info";
import GroomingBoard from "@/components/room/grooming-board";
import NicknameForm from "@/components/room/nickname-form";
import GroomingNavbar from "@/components/room/grooming-navbar";
import { SocketProvider } from "@/contexts/SocketContext";
import { GroomingRoomProvider } from "@/contexts/GroomingRoomContext";

import "@/styles/room/style.scss";
import { Issue } from "@/shared/interfaces";

const GroomingRoom = ({ params }: { params: { id: string }}) => {
  const [showNickNameForm, setShowNickNameForm] = useState(false);

  return (
    <GroomingRoomProvider roomId={params.id}>
      <SocketProvider>
        <main
          className={classnames("grooming-room", {
            "nickname-form-active": showNickNameForm,
          })}>
          <ConnectingInfo roomId={params.id} />
          <GroomingNavbar showNickNameForm={showNickNameForm} roomId={params.id} />
          <GroomingBoard
            roomId={params.id}
            showNickNameForm={showNickNameForm}
            setShowNickNameForm={setShowNickNameForm}
          />
          {showNickNameForm && <NicknameForm roomId={params.id} />}
        </main>
      </SocketProvider>
    </GroomingRoomProvider>
  );
};

export default GroomingRoom;
