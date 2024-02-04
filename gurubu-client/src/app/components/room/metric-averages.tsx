import { useGroomingRoom } from "@/contexts/GroomingRoomContext";

const MetricAverages = () => {
  const { groomingInfo } = useGroomingRoom();

  if (!groomingInfo.metricAverages || !groomingInfo.isResultShown) {
    return null;
  }

  return (
    <ul className="metric-averages">
      {Object.keys(groomingInfo.metricAverages).map((key) => {
        return (
          <li key={key}>
            <label>{key}:</label>
            <p>{groomingInfo.metricAverages[key].average}</p>
          </li>
        );
      })}
    </ul>
  );
};

export default MetricAverages;
