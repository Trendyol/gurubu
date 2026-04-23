"use client";

import { useState, useRef, useEffect } from "react";
import { PresentationService } from "@/services/presentationService";
import { usePresentationRoom } from "@/contexts/PresentationRoomContext";
import { useRouter } from "next/navigation";

interface PresentationNicknameFormProps {
  presentationId: string;
  onJoinSuccess?: () => void;
}

export default function PresentationNicknameForm({ presentationId, onJoinSuccess }: PresentationNicknameFormProps) {
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);
  const [isViewer, setIsViewer] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { setUserInfo } = usePresentationRoom();
  const router = useRouter();

  const presentationService = new PresentationService(process.env.NEXT_PUBLIC_API_URL || "");

  useEffect(() => {
    const savedNickname = localStorage.getItem("presentationNickname");
    if (savedNickname) {
      setNickname(savedNickname);
    }

    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.length < 17) {
      setNickname(e.target.value.trim());
    }
  };

  const handleJoin = async () => {
    setLoading(true);

    const trimmedNickName = nickname.trim();
    if (trimmedNickName === "") {
      setLoading(false);
      return;
    }

    localStorage.setItem("presentationNickname", trimmedNickName);

    const response = await presentationService.joinPresentation(presentationId, {
      nickName: trimmedNickName,
      isViewer,
    });

    if (!response) {
      setLoading(false);
      return;
    }

    let lobby = JSON.parse(localStorage.getItem("presentationLobby") || "{}");

    if (!Object.keys(lobby).length) {
      const lobbyContent = {
        state: {
          presentations: {
            [presentationId]: response,
          },
        },
      };
      lobby = lobbyContent;
      localStorage.setItem("presentationLobby", JSON.stringify(lobbyContent));
    }

    if (!lobby.state) {
      lobby.state = {};
    }
    if (!lobby.state.presentations) {
      lobby.state.presentations = {};
    }

    lobby.state.presentations[presentationId] = response;
    localStorage.setItem("presentationLobby", JSON.stringify(lobby));

    setUserInfo({
      nickname: trimmedNickName,
      lobby: {
        userID: response.userID,
        credentials: response.credentials,
        expiredAt: response.expiredAt,
      },
    });

    if (onJoinSuccess) {
      onJoinSuccess();
    } else {
      router.refresh();
    }
  };

  return (
    <div className="presentation-nickname-wrapper">
      <div className="presentation-nickname-background">
        <div className="presentation-nickname-background__gradient presentation-nickname-background__gradient--1"></div>
        <div className="presentation-nickname-background__gradient presentation-nickname-background__gradient--2"></div>
        <div className="presentation-nickname-background__gradient presentation-nickname-background__gradient--3"></div>
        <div className="presentation-nickname-background__gradient presentation-nickname-background__gradient--4"></div>
      </div>

      <div className="presentation-nickname-form">
        <div className="presentation-nickname-form__container">
          <div className="presentation-nickname-form__icon">📊</div>
          <h1 className="presentation-nickname-form__title">Join Presentation</h1>
          <p className="presentation-nickname-form__subtitle">Enter your nickname to join</p>

          <div className="presentation-nickname-form__form">
            <input
              ref={inputRef}
              type="text"
              className="presentation-nickname-form__input"
              placeholder="Your nickname"
              value={nickname}
              onChange={handleNicknameChange}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !loading && nickname.trim()) {
                  handleJoin();
                }
              }}
              disabled={loading}
            />

            <label className="presentation-nickname-form__checkbox">
              <input
                type="checkbox"
                checked={isViewer}
                onChange={(e) => setIsViewer(e.target.checked)}
                disabled={loading}
              />
              <span>Join as viewer (read-only)</span>
            </label>

            <button
              className="presentation-nickname-form__submit"
              onClick={handleJoin}
              disabled={loading || !nickname.trim()}
            >
              {loading ? "Joining..." : "Join Presentation"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
