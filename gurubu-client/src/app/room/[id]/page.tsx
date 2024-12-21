"use client";

import classnames from "classnames";
import { useEffect, useState } from "react";

import ConnectingInfo from "@/components/room/connecting-info";
import GroomingBoard from "@/components/room/grooming-board";
import NicknameForm from "@/components/room/nickname-form";
import GroomingNavbar from "@/components/room/grooming-navbar";
import { SocketProvider } from "@/contexts/SocketContext";
import { GroomingRoomProvider } from "@/contexts/GroomingRoomContext";
import "@/styles/room/style.scss";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import ThemeLayout from "theme-layout";
import GroomingFooter from "@/components/room/grooming-footer";

const GroomingRoom = ({ params }: { params: { id: string } }) => {
  return (
    <GroomingRoomProvider roomId={params.id}>
      <SocketProvider>
        <ThemeProvider>
          <GroomingRoomContent params={params} />
        </ThemeProvider>
      </SocketProvider>
    </GroomingRoomProvider>
  );
};

const GroomingRoomContent = ({ params }: { params: { id: string } }) => {
  const [showNickNameForm, setShowNickNameForm] = useState(false);
  const { currentTheme, isThemeActive } = useTheme();

  useEffect(() => {
    document.body.classList.add(`${currentTheme}-active`);
    return () => {
      document.body.classList.remove(`${currentTheme}-active`);
    };
  }, [currentTheme]);

  return (
    <>
      <ThemeLayout />
      <main
        className={classnames("grooming-room", {
          "nickname-form-active": showNickNameForm,
          [`${currentTheme}-active`]: isThemeActive,
        })}
      >
        <ConnectingInfo roomId={params.id} />
        <GroomingNavbar
          showNickNameForm={showNickNameForm}
          roomId={params.id}
        />
        <GroomingBoard
          roomId={params.id}
          showNickNameForm={showNickNameForm}
          setShowNickNameForm={setShowNickNameForm}
        />
        {showNickNameForm && <NicknameForm roomId={params.id} />}
        <GroomingFooter />
      </main>
    </>
  );
};

export default GroomingRoom;
