import GroomingFooter from "@/components/room/grooming-footer";
import NicknameForm from "@/components/room/nickname-form";
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
