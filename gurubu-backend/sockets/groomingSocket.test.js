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

describe("grooming socket keeps votes private until reveal (#413)", () => {
  let io;
  let admin;
  let voter;
  let roomID;

  const key = (lobby) => String(lobby.userID);

  // Socket ids have to be unique per test: `users` is module state and a
  // reused id would resolve to a participant of an earlier room.
  const connect = (id) => {
    const socket = buildSocket(`${id}-${roomID}`);
    io.handlers.connection(socket);
    return socket;
  };

  const join = (socket, lobby) => {
    socket.send("joinRoom", { nickname: lobby.nickname, roomID, lobby });
    return socket;
  };

  const setVotes = (lobby, votes) => {
    getGrooming(roomID).participants[key(lobby)].votes = votes;
  };

  beforeEach(() => {
    io = buildIo();
    groomingSocket(io);
    admin = generateNewRoom("admin", "0");
    roomID = admin.roomID;
    voter = handleJoinRoom("voter", roomID);
  });

  test("the room-wide initialize never carries vote values", () => {
    setVotes(admin, { storyPoint: "8" });

    join(connect("voter-socket"), voter);
    const initialize = lastOf(io.broadcasts, "initialize");

    expect(initialize.payload.participants[key(admin)].votes).toEqual({
      storyPoint: true,
    });
    expect(JSON.stringify(initialize.payload)).not.toContain('"storyPoint":"8"');
  });

  test("the joiner receives their own real vote so a refresh keeps it", () => {
    setVotes(voter, { storyPoint: "13" });

    const socket = join(connect("voter-socket"), voter);
    const ownInitialize = lastOf(socket.sent, "initialize");

    expect(ownInitialize.payload.participants[key(voter)].votes).toEqual({
      storyPoint: "13",
    });
  });

  test("voteSent is masked for the whole room", () => {
    const socket = join(connect("voter-socket"), voter);

    socket.send("userVote", { storyPoint: "5" }, roomID, voter.credentials);
    const voteSent = lastOf(io.broadcasts, "voteSent");

    expect(voteSent.payload.participants[key(voter)].votes).toEqual({
      storyPoint: true,
    });
    expect(JSON.stringify(voteSent.payload)).not.toContain('"storyPoint":"5"');
  });

  test("every other broadcast of the grooming is masked too", () => {
    setVotes(voter, { storyPoint: "5" });

    const socket = join(connect("voter-socket"), voter);

    socket.send("updateTimer", roomID, { timeLeft: 10, isRunning: true }, voter.credentials);
    expect(
      lastOf(io.broadcasts, "updateTimer").payload.participants[key(voter)].votes
    ).toEqual({ storyPoint: true });

    socket.send("setIssues", roomID, [{ name: "issue" }], voter.credentials);
    expect(
      lastOf(io.broadcasts, "setIssues").payload.participants[key(voter)].votes
    ).toEqual({ storyPoint: true });

    socket.send("disconnect");
    expect(
      lastOf(io.broadcasts, "userDisconnected").payload.participants[key(voter)].votes
    ).toEqual({ storyPoint: true });
  });

  test("showResults still reveals every real vote", () => {
    const socket = join(connect("admin-socket"), admin);

    socket.send("userVote", { storyPoint: "3" }, roomID, admin.credentials);
    socket.send("showResults", roomID, admin.credentials);

    expect(
      lastOf(io.broadcasts, "showResults").payload.participants[key(admin)].votes
    ).toEqual({ storyPoint: "3" });
  });
});
