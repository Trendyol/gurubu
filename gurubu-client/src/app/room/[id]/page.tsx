"use client";

import classnames from "classnames";
import { useEffect, useState } from "react";

import ConnectingInfo from "@/components/room/grooming-board/connecting-info";
import GroomingBoard from "@/components/room/grooming-board/grooming-board";
import NicknameForm from "@/components/room/grooming-board/nickname-form";
import GroomingNavbar from "@/components/room/grooming-navbar/grooming-navbar";
import ThemeLayout from "theme-layout";
import GroomingFooter from "@/components/room/grooming-footer/grooming-footer";
import toast, { Toaster } from "react-hot-toast";
import { SocketProvider } from "@/contexts/SocketContext";
import {
  GroomingRoomProvider,
  useGroomingRoom,
} from "@/contexts/GroomingRoomContext";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import { useSearchParams } from "next/navigation";
import { IconX } from "@tabler/icons-react";
import { TourProvider, useTour } from "@/contexts/TourContext";
import "@/styles/room/style.scss";
import { ROOM_STATUS } from "./enums";

const GroomingRoom = ({ params }: { params: { id: string } }) => {
  return (
    <GroomingRoomProvider roomId={params.id}>
      <SocketProvider>
        <ThemeProvider>
          <TourProvider>
            <GroomingRoomContent params={params} />
          </TourProvider>
        </ThemeProvider>
      </SocketProvider>
    </GroomingRoomProvider>
  );
};

const GroomingRoomContent = ({ params }: { params: { id: string } }) => {
  const [showNickNameForm, setShowNickNameForm] = useState(false);
  const { currentTheme, isThemeActive } = useTheme();
  const { startTour, showTour } = useTour();
  const { roomStatus, userInfo, groomingInfo } = useGroomingRoom();
  const searchParams = useSearchParams();

  const isGroomingInfoLoaded = Boolean(Object.keys(groomingInfo).length);

  useEffect(() => {
    document.body.classList.add(`${currentTheme}-active`);
    return () => {
      document.body.classList.remove(`${currentTheme}-active`);
    };
  }, [currentTheme]);

  useEffect(() => {
    const isFastJoin = searchParams.get("isFastJoin");
    if (isFastJoin === "true") {
      toast.success(
        <div className="fast-join-toaster">
          <span className="Toastify__toast-icon" />
          <div>
            <h4 className="fast-join-toaster-title">Fast Join Success</h4>
            <p className="fast-join-toaster-description">
              You can change your nickname from your profile if you want
            </p>
          </div>
          <button
            className="fast-join-toaster-close"
            onClick={() => toast.dismiss()}
          >
            <IconX />
          </button>
        </div>,
        {
          position: "top-center",
          duration: 5000,
        }
      );
    }
  }, [searchParams]);

  useEffect(() => {
    if (
      showTour &&
      userInfo.nickname &&
      roomStatus === ROOM_STATUS.FOUND &&
      isGroomingInfoLoaded
    ) {
      const timeoutId = setTimeout(() => {
        startTour();
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [showTour, startTour, roomStatus, userInfo, isGroomingInfoLoaded]);

  return (
    <>
      <Toaster />
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
