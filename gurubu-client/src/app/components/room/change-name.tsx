import { SetStateAction, useState } from "react";
import Image from "next/image";
import { useSocket } from "@/contexts/SocketContext";
import { useGroomingRoom } from "@/contexts/GroomingRoomContext";

type Props = {
  closeModal: () => void;
};

export const ChangeNameForm = ({ closeModal }: Props) => {
  const { userInfo, setUserinfo } = useGroomingRoom();

  const socket = useSocket();
  const [newNickname, setNewNickname] = useState(userInfo.nickname);

  const handleNicknameInputChange = (e: { target: { value: SetStateAction<string> } }) => {
    if (e.target.value.length < 17) {
      setNewNickname((e.target.value as string).trim());
    }
  };

  const handleSubmit = (
    e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    if (newNickname.trim()) {
      socket.emit("updateNickName", userInfo.lobby.roomID, newNickname, userInfo.lobby.credentials);
      setUserinfo({ ...userInfo, nickname: newNickname.trim() });
      localStorage.setItem("nickname", newNickname.trim());
      closeModal();
    }
  };
  return (
    <form onSubmit={handleSubmit} className="change-name-container">
      <div className="change-name-container__logo">
        <Image src="/logo.svg" width={24} height={24} alt="Gurubu Logo" priority />
        <h4>GuruBu</h4>
      </div>
      <h5>Choose your nickname.</h5>
      <label htmlFor="nickname">
        <input
          placeholder="Enter your nickname"
          id="nickname"
          name="nickname"
          onChange={handleNicknameInputChange}
          value={newNickname}
        />
      </label>
      <button type="submit" onClick={handleSubmit}>
        Update your nickname
      </button>
    </form>
  );
};
