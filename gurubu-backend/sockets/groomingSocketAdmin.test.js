const {
  generateNewRoom,
  handleJoinRoom,
  getGrooming,
} = require("../utils/groomings");
const groomingSocket = require("./groomingSocket");

const buildSocket = (id) => ({
  id,
  sent: [],
  handlers: {},
  join() {},
  on(event, handler) {
    this.handlers[event] = handler;
  },
  emit(event, payload, extra) {
    this.sent.push({ event, payload, extra });
  },
  send(event, ...args) {
    this.handlers[event](...args);
  },
});

const buildIo = () => ({
  adapter: { rooms: new Map() },
  handlers: {},
  broadcasts: [],
  to(roomID) {
    return {
      emit: (event, payload, extra) =>
        this.broadcasts.push({ roomID, event, payload, extra }),
    };
  },
  on(event, handler) {
    this.handlers[event] = handler;
  },
});

const lastOf = (entries, event) =>
  entries.filter((entry) => entry.event === event).pop();

describe("grooming socket authorizes admin actions on the server (#32)", () => {
  let io;
  let admin;
  let voter;
  let roomID;

  const connect = (id) => {
    // Socket ids have to be unique per test: `users` is module state and a
    // reused id would resolve to a participant of an earlier room.
    const socket = buildSocket(`${id}-${roomID}`);
    io.handlers.connection(socket);
    return socket;
  };

  const join = (socket, lobby) => {
    socket.send("joinRoom", { nickname: lobby.nickname, roomID, lobby });
    return socket;
  };

  const lastError = (lobbySocket) => lastOf(io.broadcasts, "encounteredError");

  beforeEach(() => {
    io = buildIo();
    groomingSocket(io);
    admin = generateNewRoom("admin", "0");
    roomID = admin.roomID;
    voter = handleJoinRoom("voter", roomID);
  });

  const adminOnlyEvents = [
    ["showResults", [roomID]],
    ["resetVotes", [roomID]],
    ["setIssues", [roomID, [{ name: "issue" }]]],
    ["setGurubuAI", [roomID, { apiKey: "sk-test" }]],
    ["updateTimer", [roomID, { timeLeft: 10, isRunning: true }]],
  ];

  test.each(adminOnlyEvents)(
    "a regular participant cannot %s",
    (event, payload) => {
      const socket = join(connect("voter-socket"), voter);

      socket.send(event, ...payload, voter.credentials);

      expect(lastError()).toMatchObject({ payload: { id: 2, isSuccess: false } });
      expect(lastOf(io.broadcasts, event)).toBeUndefined();
    }
  );

  test("a tampered isAdmin flag in the lobby payload is not trusted", () => {
    const socket = join(connect("voter-socket"), {
      ...voter,
      isAdmin: true,
    });

    socket.send("showResults", roomID, voter.credentials);

    expect(lastError()).toMatchObject({ payload: { id: 2, isSuccess: false } });
    expect(getGrooming(roomID).isResultShown).toBe(false);
  });

  test.each(adminOnlyEvents)("the real admin can still %s", (event, payload) => {
    const socket = join(connect("admin-socket"), admin);

    socket.send(event, ...payload, admin.credentials);

    expect(lastOf(io.broadcasts, "encounteredError")).toBeUndefined();
    expect(lastOf(io.broadcasts, event)).toBeDefined();
  });

  test("the room admin can still reveal and reset the votes", () => {
    const socket = join(connect("admin-socket"), admin);

    socket.send("showResults", roomID, admin.credentials);
    expect(getGrooming(roomID).isResultShown).toBe(true);

    socket.send("resetVotes", roomID, admin.credentials);
    expect(getGrooming(roomID).isResultShown).toBe(false);
  });

  test("a participant rejection changes no room state", () => {
    const socket = join(connect("voter-socket"), voter);
    const before = JSON.stringify(getGrooming(roomID));

    socket.send("showResults", roomID, voter.credentials);
    socket.send("setIssues", roomID, [{ name: "issue" }], voter.credentials);
    socket.send("setGurubuAI", roomID, { apiKey: "sk-test" }, voter.credentials);
    socket.send(
      "updateTimer",
      roomID,
      { timeLeft: 10, isRunning: true },
      voter.credentials
    );

    expect(JSON.stringify(getGrooming(roomID))).toBe(before);
  });
});
