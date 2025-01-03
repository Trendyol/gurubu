import VoteCardV2 from "./vote-card-v2";

interface IProps {
  name: string;
  points: string[];
}

const VotingStickV2 = ({ name, points }: IProps) => {
  return (
    <div className="voting-stick-v2">
      <div className="voting-stick-v2__vote-cards">
        {points.map((point) => (
          <VoteCardV2 key={`${point}${name}`} name={name} point={point} />
        ))}
      </div>
    </div>
  );
};

export default VotingStickV2;
