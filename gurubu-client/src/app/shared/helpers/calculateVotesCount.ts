import { Participants } from "../interfaces";

export const calculateVotesOptimized = (
  points: string[],
  participants: Participants
): number[] | null => {
  if (!participants || !points?.length) {
    return null;
  }
  const fibonacciSeries = points;
  const voteCounts: number[] = Array(fibonacciSeries.length).fill(0);

  const fibonacciIndexMap: Record<string, number> = fibonacciSeries?.reduce(
    (map, point, index) => {
      map[point] = index;
      return map;
    },
    {} as Record<string, number>
  );

  for (const participant of Object.values(participants)) {
    const vote = participant.votes?.storyPoint;
    if (vote && fibonacciIndexMap[vote] !== undefined) {
      voteCounts[fibonacciIndexMap[vote]]++;
    }
  }

  return voteCounts;
};