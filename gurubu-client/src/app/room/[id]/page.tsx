"use client";

import classnames from "classnames";
import { useEffect, useState } from "react";

import ConnectingInfo from "@/components/room/grooming-board/connecting-info";
import GroomingBoard from "@/components/room/grooming-board/grooming-board";
import NicknameForm from "@/components/room/grooming-board/nickname-form";
import GroomingNavbar from "@/components/room/grooming-navbar/grooming-navbar";
import ThemeLayout from "theme-layout";
import GroomingFooter from "@/components/room/grooming-footer/grooming-footer";
import JiraSidebar from "@/components/room/jira-sidebar";
import { Toaster } from "react-hot-toast";
import { SocketProvider } from "@/contexts/SocketContext";
import {
  GroomingRoomProvider,
  useGroomingRoom,
} from "@/contexts/GroomingRoomContext";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import { useSearchParams } from "next/navigation";
import { TourProvider, useTour } from "@/contexts/TourContext";
import { ROOM_STATUS } from "./enums";
import { LoaderProvider } from "@/contexts/LoaderContext";
import { ToastProvider, useToast } from "@/contexts/ToastContext";
import { AvatarProvider } from "@/contexts/AvatarContext";
import "@/styles/room/style.scss";

const GroomingRoom = ({ params }: { params: { id: string } }) => {
  return (
    <GroomingRoomProvider roomId={params.id}>
      <SocketProvider>
        <ThemeProvider>
          <TourProvider>
            <LoaderProvider>
              <ToastProvider>
                <AvatarProvider>
                  <GroomingRoomContent params={params} />
                </AvatarProvider>
              </ToastProvider>
            </LoaderProvider>
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
  const { showSuccessToast } = useToast();
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
      showSuccessToast(
        "Fast Join Success",
        "You can change your nickname from your profile if you want",
        "top-center"
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
  }, [showTour, roomStatus, isGroomingInfoLoaded]);

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
        <JiraSidebar roomId={params.id} />
      </main>
    </>
  );
};

export default GroomingRoom;
