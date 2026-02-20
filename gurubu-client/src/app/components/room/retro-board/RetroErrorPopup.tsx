"use client";

import { useRetroRoom } from "@/contexts/RetroRoomContext";
import { useRetroSocket } from "@/contexts/RetroSocketContext";
import { getCurrentRetroLobby } from "@/shared/helpers/lobbyStorage";
import { sanitizeHTML } from "@/shared/utils/sanitizeHTML";
import "@/styles/room/retro-board/retro-error-popup.scss";

interface IProps {
  title: string;
  retroId: string;
}

const RetroErrorPopup = ({ title, retroId }: IProps) => {
  const socket = useRetroSocket();
  const { showErrorPopup, setShowErrorPopup } = useRetroRoom();

  const handleReconnect = () => {
    setShowErrorPopup(false);
    const retroNickname = localStorage.getItem("retroNickname");
    const lobby = getCurrentRetroLobby(retroId);

    if (retroNickname && lobby) {
      socket.emit("joinRetro", {
        nickname: retroNickname,
        retroId: retroId,
        lobby,
        avatarSeed: lobby.avatarSeed || "",
      });
    }
  };

  if (!showErrorPopup) {
    return null;
  }

  return (
    <>
      <div className="retro-error-popup active">
        <div className="retro-error-popup__icon">⚠️</div>
        <div className="retro-error-popup__header">
          <h4 dangerouslySetInnerHTML={{ __html: sanitizeHTML(title) }} />
        </div>
        <p className="retro-error-popup__body">
          Connection lost. Please click reconnect to continue your retro session.
        </p>
        <button
          className="retro-error-popup__button"
          onClick={handleReconnect}
        >
          Reconnect 🔄
        </button>
      </div>
      <div className="retro-error-popup__overlay active"></div>
    </>
  );
};

export default RetroErrorPopup;
