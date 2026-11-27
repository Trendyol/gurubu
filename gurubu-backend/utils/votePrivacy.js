// Votes must stay private until the room reveals its results (#413):
// the payloads below are broadcast to the whole room and were readable from
// the browser's network tab before reveal.
const redactVotes = (votes) => {
  if (!votes) {
    return votes;
  }

  return Object.entries(votes).reduce((redacted, [metric, value]) => {
    redacted[metric] = Boolean(value);
    return redacted;
  }, {});
};

const toPublicGrooming = (grooming, viewerUserID) => {
  if (!grooming || grooming.isResultShown) {
    return grooming;
  }

  const participants = Object.entries(grooming.participants || {}).reduce(
    (publicParticipants, [participantID, participant]) => {
      const isViewer = String(participantID) === String(viewerUserID);
      publicParticipants[participantID] = isViewer
        ? participant
        : { ...participant, votes: redactVotes(participant.votes) };
      return publicParticipants;
    },
    {}
  );

  return { ...grooming, participants };
};

module.exports = { toPublicGrooming, redactVotes };
