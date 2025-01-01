import VoteCard from "./vote-card";

interface IProps {
  id: number;
  name: string;
  displayName: string;
  points: string[];
}

const VotingStick = ({ id, name, points, displayName }: IProps) => {
  return (
    <div className="voting-stick">
      <label className="voting-stick__label">{displayName}:</label>
      <div className="voting-stick__vote-cards">
        {points.map((point) => (
          <VoteCard key={`${point}${name}`} id={point} name={name} point={point} />
        ))}
      </div>
    </div>
  );
};

export default VotingStick;
