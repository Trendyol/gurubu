"use client";

import { useState } from "react";
import { RetroService } from "@/services/retroService";
import { useRetroRoom } from "@/contexts/RetroRoomContext";

interface IProps {
  retroId: string;
  onJoinSuccess?: () => void;
}

const RetroNicknameForm = ({ retroId, onJoinSuccess }: IProps) => {
  const { setUserInfo } = useRetroRoom();
  const [nickname, setNickname] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleJoinRetro = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nickname.trim()) {
      alert("Please enter a nickname");
      return;
    }

    setIsLoading(true);
    try {
      const retroService = new RetroService(process.env.NEXT_PUBLIC_API_URL || "");
      const response = await retroService.joinRetro(retroId, { nickName: nickname });
      
      if (response) {
        const { retroId: joinedRetroId, userID, credentials, expiredAt } = response;
        
        // Save to retroLobby
        const retroLobby = {
          version: 1,
          state: {
            retros: {
              [joinedRetroId]: {
                userID,
                credentials,
                expiredAt,
              },
            },
          },
        };
        
        localStorage.setItem("retroLobby", JSON.stringify(retroLobby));
        localStorage.setItem("retroNickname", nickname);
        
        // Update context immediately
        setUserInfo({
          nickname,
          lobby: {
            userID,
            credentials,
            expiredAt,
          },
        });
        
        // Trigger parent component to re-render
        if (onJoinSuccess) {
          onJoinSuccess();
        }
      }
    } catch (error) {
      console.error("Error joining retro:", error);
      alert("Failed to join retrospective. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="retro-nickname-wrapper">
      <div className="retro-nickname-background">
        <div className="retro-nickname-background__gradient retro-nickname-background__gradient--1"></div>
        <div className="retro-nickname-background__gradient retro-nickname-background__gradient--2"></div>
        <div className="retro-nickname-background__gradient retro-nickname-background__gradient--3"></div>
        <div className="retro-nickname-background__gradient retro-nickname-background__gradient--4"></div>
      </div>
      
      <div className="retro-nickname-form">
        <div className="retro-nickname-form__container">
          <div className="retro-nickname-form__icon">🎯</div>
          <h1 className="retro-nickname-form__title">Join Retrospective</h1>
          <p className="retro-nickname-form__subtitle">Enter your nickname to join the retro session</p>
          
          <form onSubmit={handleJoinRetro} className="retro-nickname-form__form">
            <input
              type="text"
              className="retro-nickname-form__input"
              placeholder="Your nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              disabled={isLoading}
              autoFocus
            />
            
            <button
              type="submit"
              className="retro-nickname-form__submit"
              disabled={isLoading || !nickname.trim()}
            >
              {isLoading ? "Joining..." : "Join Retro 🚀"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RetroNicknameForm;
