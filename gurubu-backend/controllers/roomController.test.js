const { createRoom } = require("./roomController");
const { GroomingType } = require("../enums/groomingType");

describe("roomController.createRoom", () => {
  const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  test("creates room successfully with GroomingType enum", async () => {
    const req = {
      body: {
        nickName: "Alice",
        groomingType: GroomingType.PlanningPoker,
      },
    };
    const res = mockResponse();

    await createRoom(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        roomID: expect.any(String),
        isAdmin: true,
      })
    );
  });

  test("creates room successfully with legacy groomingType '0'", async () => {
    const req = {
      body: {
        nickName: "Bob",
        groomingType: "0",
      },
    };
    const res = mockResponse();

    await createRoom(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
  });

  test("returns 400 if nickName is missing", async () => {
    const req = {
      body: {
        groomingType: GroomingType.PlanningPoker,
      },
    };
    const res = mockResponse();

    await createRoom(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "nickName is required" });
  });

  test("returns 400 if groomingType is missing", async () => {
    const req = {
      body: {
        nickName: "Alice",
      },
    };
    const res = mockResponse();

    await createRoom(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "groomingType is required" });
  });

  test("returns 400 if groomingType is invalid", async () => {
    const req = {
      body: {
        nickName: "Alice",
        groomingType: "UnsupportedType",
      },
    };
    const res = mockResponse();

    await createRoom(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "invalid groomingType" });
  });
});
