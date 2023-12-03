"use client";

import { SetStateAction, useEffect, useRef, useState } from "react";
import { RoomService } from "../../services/roomService";
import Image from "next/image";
import classNames from "classnames";

interface IProps {
  joinMode?: boolean;
  roomId?: string;
}

const NicknameForm = ({ joinMode, roomId }: IProps) => {
  const [nickname, setNickname] = useState("");
  const [groomingType, setGroomingType] = useState<null | string>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [showInfoMessage, setShowInfoMessage] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const isPlanningOptionSelected = groomingType === "0";
  const roomService = new RoomService(process.env.NEXT_PUBLIC_API_URL || "");

  const handleNicknameChange = (e: {
    target: { value: SetStateAction<string> };
  }) => {
    if (e.target.value.length < 17) {
      setNickname((e.target.value as string).trim());
    }
  };

  const handleCreateRoomButtonClick = async () => {
    setShowInfoMessage(true);
    if (groomingType === null) {
      setErrorMessage("Please select a grooming type.");
      return;
    }
    const trimmedNickName = nickname.trim();
    if (trimmedNickName === "") {
      return;
    }

    const payload = { nickName: trimmedNickName, groomingType };
    const response = await roomService.createRoom(payload);
    const nicknameData = JSON.parse(localStorage.getItem("nickname") || "[]");
    nicknameData.push({
      roomId: response.roomID,
      nickname: trimmedNickName,
    });
    localStorage.setItem("nickname", JSON.stringify(nicknameData));

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
    setShowInfoMessage(true);
    const trimmedNickName = nickname.trim();
    if (trimmedNickName === "" || !roomId) {
      return;
    }
    const nicknameData = JSON.parse(localStorage.getItem("nickname") || "[]");
    nicknameData.push({
      roomId,
      nickname: trimmedNickName,
    });
    localStorage.setItem("nickname", JSON.stringify(nicknameData));
    const payload = { nickName: trimmedNickName };
    const response = await roomService.join(roomId, payload);

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

  const handleOptionClick = (typeNumber: string) => {
    setErrorMessage("");
    setGroomingType(typeNumber);
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

  return (
    <div className="nickname-form">
      <h1 className="nickname-form__title">Welcome to Gurubu</h1>
      <div className="nickname-form__action-wrapper">
        <div className="nickname-form__input-wrapper">
          <label htmlFor="nickname-input" className="nickname-form__label">
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
        {!joinMode && (
          <label className="nickname-form__label">
            And select a grooming type.
          </label>
        )}
        {!joinMode && (
          <div className="nickname-form__grooming-options">
            <div
              className={classNames("nickname-form__grooming-option", {
                selected: isPlanningOptionSelected,
              })}
              onClick={() => handleOptionClick("0")}
            >
              <Image
                priority
                src="/planning.svg"
                alt="planning"
                width={100}
                height={100}
              />
              <p>Planning Poker</p>
            </div>
            <div
              className={classNames("nickname-form__grooming-option", {
                selected: !isPlanningOptionSelected && groomingType !== null,
              })}
              onClick={() => handleOptionClick("1")}
            >
              <Image
                priority
                src="/gamepad.svg"
                alt="hammer"
                width={100}
                height={100}
              />
              <p>Score Grooming</p>
            </div>
          </div>
        )}
        {errorMessage && (
          <p className="nickname-form__error-message">{errorMessage}</p>
        )}
        <button
          className="nickname-form__button"
          onClick={
            joinMode ? handleJoinRoomButtonClick : handleCreateRoomButtonClick
          }
        >
          {joinMode ? "Join Room" : "Create Room"}
        </button>
        {showInfoMessage && (
          <p className="nickname-form__info-message">
            {joinMode ? "Joining Room..." : "Creating Room..."}
          </p>
        )}
      </div>
    </div>
  );
};

export default NicknameForm;
