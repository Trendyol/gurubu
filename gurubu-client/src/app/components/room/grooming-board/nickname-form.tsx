"use client";

import { SetStateAction, useEffect, useRef, useState } from "react";
import { RoomService } from "@/services/roomService";
import Image from "next/image";
import classNames from "classnames";
import { GroomingType } from "@/shared/enums";
import { handleRoomJoin } from "@/shared/helpers/roomJoin";

interface IProps {
  roomId?: string;
}

const defaultNickname = () => {
  return (
    (typeof window !== "undefined" &&
      window.localStorage.getItem("nickname")) ||
    ""
  );
};

// If roomId is provided, then the user is joining a room.
const NicknameForm = ({ roomId }: IProps) => {
  const [nickname, setNickname] = useState(defaultNickname);
  const [groomingType, setGroomingType] = useState<GroomingType>(
    GroomingType.PlanningPoker
  );

  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const roomService = new RoomService(process.env.NEXT_PUBLIC_API_URL || "");
  const vercelInfo = process.env.NEXT_PUBLIC_VERCEL_INFO || "";

  const handleNicknameChange = (e: {
    target: { value: SetStateAction<string> };
  }) => {
    if (e.target.value.length < 17) {
      setNickname((e.target.value as string).trim());
    }
  };

  const handleCreateRoomButtonClick = async () => {
    setLoading(true);

    const trimmedNickName = nickname.trim();
    if (trimmedNickName === "") {
      return;
    }
    localStorage.setItem("nickname", trimmedNickName);

    const payload = {
      nickName: trimmedNickName,
      // TODO?: Actually, backend api should be accept string value for groomingType
      groomingType: groomingType === "PlanningPoker" ? "0" : "1",
    };
    const response = await roomService.createRoom(payload);

    if (!response) {
      return;
    }

    let lobby = JSON.parse(localStorage.getItem("lobby") || "{}");

    if (!Object.keys(lobby).length) {
      const lobbyContent = {
        state: {
          rooms: {
            [response.roomID]: response,
          },
        },
      };
      lobby = lobbyContent;
      localStorage.setItem("lobby", JSON.stringify(lobbyContent));
    }

    lobby.state.rooms[response.roomID] = response;
    localStorage.setItem("lobby", JSON.stringify(lobby));

    window.location.assign(`/room/${response.roomID}`);
  };

  const handleJoinRoomButtonClick = async () => {
    setLoading(true);
    await handleRoomJoin(nickname, false, roomId);
  };

  const handleFastJoin = async () => {
    if (!roomId || !defaultNickname()) {
      return;
    }
    setLoading(true);
    await handleRoomJoin(nickname, true, roomId); 
  };

  const connectionButtonText = () => {
    if (loading && roomId) {
      return "Joining Room...";
    }
    if (loading && !roomId) {
      return "Creating Room...";
    }
    return roomId ? "Join Room" : "Create Room";
  };

  useEffect(() => {
    if (!inputRef.current) {
      return;
    }

    inputRef.current.focus();

    inputRef.current.setSelectionRange(
      inputRef.current.value.length,
      inputRef.current.value.length
    );
  }, []);

  useEffect(() => {
    const executeFastJoin = async () => {
      await handleFastJoin();
    };
    executeFastJoin();
  }, []);

  if (defaultNickname() && roomId) {
    return null;
  }

  return (
    <div className="nickname-form">
      <h1 className="nickname-form__header">
        <Image priority src="/logo.svg" alt="logo" width={30} height={30} />
        GuruBu
      </h1>
      <h1 className="nickname-form__title">Welcome to GuruBu Planning Poker</h1>
      <div className="nickname-form__action-wrapper">
        <div className="nickname-form__input-wrapper">
          <label
            htmlFor="nickname-input"
            className="nickname-form__label-enter-room"
          >
            To enter the room, choose a nickname.
          </label>
          <input
            id="nickname-input"
            ref={inputRef}
            className="nickname-form__input"
            placeholder="Enter your nickname"
            value={nickname}
            onChange={handleNicknameChange}
          />
        </div>
        {!roomId && (
          <div className="nickname-form__divider">
            <label className="nickname-form__label-select-grooming">
              And select a grooming type.
            </label>
          </div>
        )}
        {!roomId && (
          <div className="nickname-form__grooming-options divider">
            <button
              className={classNames("nickname-form__grooming-option", {
                selected: groomingType === GroomingType.PlanningPoker,
              })}
              onClick={() => setGroomingType(GroomingType.PlanningPoker)}
            >
              <p>Planning Poker</p>
            </button>
            <button
              className={classNames("nickname-form__grooming-option", {
                selected: groomingType === GroomingType.ScoreGrooming,
              })}
              onClick={() => setGroomingType(GroomingType.ScoreGrooming)}
            >
              <p>Score Grooming</p>
            </button>
          </div>
        )}

        <button
          className="nickname-form__button"
          onClick={
            roomId ? handleJoinRoomButtonClick : handleCreateRoomButtonClick
          }
        >
          {connectionButtonText()}
        </button>
        {vercelInfo && (
          <p className="vercel-info">
            {vercelInfo.split("_")[0]}
            <a href="https://gurubu.trendyol.com" target="_blank">
              {vercelInfo.split("_")[1]}
            </a>
          </p>
        )}
      </div>
    </div>
  );
};

export default NicknameForm;
