import classNames from "classnames";
import { useGroomingRoom } from "../../contexts/GroomingRoomContext";
import { Fragment } from "react";
import { IconCheck, IconChessRookFilled, IconPlugX } from "@tabler/icons-react";

const GroomingBoardParticipants = () => {
  const { groomingInfo } = useGroomingRoom();
  return (
    <ul className="grooming-board-participants">
      {Object.keys(groomingInfo.participants || {}).map((participantKey) => (
        <li key={participantKey}>
          <div className="grooming-board-participants__nickname-container">
            <label
              className={classNames("grooming-board-participants__nickname", {
                "connection-lost":
                  !groomingInfo.participants[participantKey].sockets.length,
              })}
            >
              {groomingInfo.participants[participantKey].nickname}
            </label>
            {!groomingInfo.participants[participantKey].sockets.length && (
              <IconPlugX
                className="grooming-board-participants__icon-plug"
                width={16}
              />
            )}
            {groomingInfo.participants[participantKey].isAdmin && (
              <IconChessRookFilled
                className="grooming-board-participants__icon-crown"
                width={16}
              />
            )}
          </div>
          <div className="grooming-board-participants__point-cards-container">
            {groomingInfo.metrics.map((metric) => (
              <Fragment key={metric.id}>
                {groomingInfo.participants[participantKey].votes && (
                  <div
                    key={metric.id}
                    className="grooming-board-participants__point-card"
                  >
                    {groomingInfo.isResultShown && (
                      <p>
                        {
                          groomingInfo.participants[participantKey].votes[
                            metric.name
                          ]
                        }
                      </p>
                    )}
                    {!groomingInfo.isResultShown &&
                      groomingInfo.participants[participantKey].votes[
                        metric.name
                      ] && (
                        <div className="grooming-board-participants__check-icon-container">
                          <IconCheck width={16} />
                        </div>
                      )}
                  </div>
                )}
                {!groomingInfo.participants[participantKey].votes && (
                  <div
                    key={metric.id}
                    className="grooming-board-participants__point-card"
                  >
                    <p></p>
                  </div>
                )}
              </Fragment>
            ))}
          </div>
        </li>
      ))}
    </ul>
  );
};

export default GroomingBoardParticipants;
