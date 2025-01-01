"use client";

import classnames from "classnames";
import { useEffect, useState } from "react";

import ConnectingInfo from "@/components/room/grooming-board/connecting-info";
import GroomingBoard from "@/components/room/grooming-board/grooming-board";
import NicknameForm from "@/components/room/grooming-board/nickname-form";
import GroomingNavbar from "@/components/room/grooming-navbar/grooming-navbar";
import { SocketProvider } from "@/contexts/SocketContext";
import { GroomingRoomProvider } from "@/contexts/GroomingRoomContext";
import "@/styles/room/style.scss";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import ThemeLayout from "theme-layout";
import GroomingFooter from "@/components/room/grooming-footer/grooming-footer";
import toast, { Toaster } from "react-hot-toast";
import { useSearchParams } from "next/navigation";
import { IconX } from "@tabler/icons-react";

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
  const searchParams = useSearchParams();

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
          <button className="fast-join-toaster-close" onClick={() => toast.dismiss()}><IconX/></button>
        </div>,
        {
          position: "top-center",
          duration: 5000,
        }
      );
    }
  }, [searchParams]);

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
