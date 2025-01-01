import GroomingFooter from "@/components/room/grooming-footer/grooming-footer";
import NicknameForm from "@/components/room/grooming-board/nickname-form";
import "@/styles/room/style.scss";

const CreateRoom = () => {
  return (
    <main className="create-room">
      <NicknameForm />
      <GroomingFooter />
    </main>
  );
};

export default CreateRoom;
