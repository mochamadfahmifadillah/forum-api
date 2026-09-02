import request from "supertest";
import pool from "../../database/postgres/pool.js";
import UsersTableTestHelper from "../../../../tests/UsersTableTestHelper.js";
import AuthenticationsTableTestHelper from "../../../../tests/AuthenticationsTableTestHelper.js";
import container from "../../container.js";
import createServer from "../createServer.js";
import AuthenticationTokenManager from "../../../Applications/security/AuthenticationTokenManager.js";

describe("HTTP server", () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
  });

  it("should response 404 when request unregistered route", async () => {
    // Arrange
    const app = await createServer({});

    // Action
    const response = await request(app).get("/unregisteredRoute");

    // Assert
    expect(response.status).toEqual(404);
  });

  describe("when POST /users", () => {
    it("should response 201 and persisted user", async () => {
      // Arrange
      const requestPayload = {
        username: "dicoding",
        password: "secret",
        fullname: "Dicoding Indonesia",
      };
      const app = await createServer(container);

      // Action
      const response = await request(app).post("/users").send(requestPayload);

      // Assert
      expect(response.status).toEqual(201);
      expect(response.body.status).toEqual("success");
      expect(response.body.data.addedUser).toBeDefined();
    });

    it("should response 400 when request payload not contain needed property", async () => {
      // Arrange
      const requestPayload = {
        fullname: "Dicoding Indonesia",
        password: "secret",
      };
      const app = await createServer(container);

      // Action
      const response = await request(app).post("/users").send(requestPayload);

      // Assert
      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual("fail");
      expect(response.body.message).toEqual(
        "tidak dapat membuat user baru karena properti yang dibutuhkan tidak ada",
      );
    });

    it("should response 400 when request payload not meet data type specification", async () => {
      // Arrange
      const requestPayload = {
        username: "dicoding",
        password: "secret",
        fullname: ["Dicoding Indonesia"],
      };
      const app = await createServer(container);

      // Action
      const response = await request(app).post("/users").send(requestPayload);

      // Assert
      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual("fail");
      expect(response.body.message).toEqual(
        "tidak dapat membuat user baru karena tipe data tidak sesuai",
      );
    });

    it("should response 400 when username more than 50 character", async () => {
      // Arrange
      const requestPayload = {
        username: "dicodingindonesiadicodingindonesiadicodingindonesiadicoding",
        password: "secret",
        fullname: "Dicoding Indonesia",
      };
      const app = await createServer(container);

      // Action
      const response = await request(app).post("/users").send(requestPayload);

      // Assert
      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual("fail");
      expect(response.body.message).toEqual(
        "tidak dapat membuat user baru karena karakter username melebihi batas limit",
      );
    });

    it("should response 400 when username contain restricted character", async () => {
      // Arrange
      const requestPayload = {
        username: "dicoding indonesia",
        password: "secret",
        fullname: "Dicoding Indonesia",
      };
      const app = await createServer(container);

      // Action
      const response = await request(app).post("/users").send(requestPayload);

      // Assert
      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual("fail");
      expect(response.body.message).toEqual(
        "tidak dapat membuat user baru karena username mengandung karakter terlarang",
      );
    });

    it("should response 400 when username unavailable", async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ username: "dicoding" });

      const requestPayload = {
        username: "dicoding",
        fullname: "Dicoding Indonesia",
        password: "super_secret",
      };

      const app = await createServer(container);

      // Action
      const response = await request(app).post("/users").send(requestPayload);

      // Assert
      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual("fail");
      expect(response.body.message).toEqual("username tidak tersedia");
    });
  });

  describe("when POST /authentications", () => {
    it("should response 201 and new authentication", async () => {
      const requestPayload = {
        username: "dicoding",
        password: "secret",
      };

      const app = await createServer(container);

      await request(app).post("/users").send({
        username: "dicoding",
        password: "secret",
        fullname: "Dicoding Indonesia",
      });

      const response = await request(app)
        .post("/authentications")
        .send(requestPayload);

      expect(response.status).toEqual(201);
      expect(response.body.status).toEqual("success");
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
    });

    it("should response 400 if username not found", async () => {
      const requestPayload = {
        username: "dicoding",
        password: "secret",
      };

      const app = await createServer(container);

      const response = await request(app)
        .post("/authentications")
        .send(requestPayload);

      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual("fail");
      expect(response.body.message).toEqual("username tidak ditemukan");
    });

    it("should response 401 if password wrong", async () => {
      const requestPayload = {
        username: "dicoding",
        password: "wrong_password",
      };

      const app = await createServer(container);

      await request(app).post("/users").send({
        username: "dicoding",
        password: "secret",
        fullname: "Dicoding Indonesia",
      });

      const response = await request(app)
        .post("/authentications")
        .send(requestPayload);

      expect(response.status).toEqual(401);
      expect(response.body.status).toEqual("fail");
      expect(response.body.message).toEqual(
        "kredensial yang Anda masukkan salah",
      );
    });

    it("should response 400 if login payload not contain needed property", async () => {
      const requestPayload = {
        username: "dicoding",
      };

      const app = await createServer(container);

      const response = await request(app)
        .post("/authentications")
        .send(requestPayload);

      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual("fail");
      expect(response.body.message).toEqual(
        "harus mengirimkan username dan password",
      );
    });

    it("should response 400 if login payload wrong data type", async () => {
      const requestPayload = {
        username: 123,
        password: "secret",
      };

      const app = await createServer(container);

      const response = await request(app)
        .post("/authentications")
        .send(requestPayload);

      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual("fail");
      expect(response.body.message).toEqual(
        "username dan password harus string",
      );
    });
  });

  describe("when PUT /authentications", () => {
    it("should return 200 and new access token", async () => {
      const app = await createServer(container);

      await request(app).post("/users").send({
        username: "dicoding",
        password: "secret",
        fullname: "Dicoding Indonesia",
      });

      const loginResponse = await request(app).post("/authentications").send({
        username: "dicoding",
        password: "secret",
      });

      const { refreshToken } = loginResponse.body.data;

      const response = await request(app)
        .put("/authentications")
        .send({ refreshToken });

      expect(response.status).toEqual(200);
      expect(response.body.status).toEqual("success");
      expect(response.body.data.accessToken).toBeDefined();
    });

    it("should return 400 payload not contain refresh token", async () => {
      const app = await createServer(container);

      const response = await request(app).put("/authentications").send({});

      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual("fail");
      expect(response.body.message).toEqual("harus mengirimkan token refresh");
    });

    it("should return 400 if refresh token not string", async () => {
      const app = await createServer(container);

      const response = await request(app)
        .put("/authentications")
        .send({ refreshToken: 123 });

      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual("fail");
      expect(response.body.message).toEqual("refresh token harus string");
    });

    it("should return 400 if refresh token not valid", async () => {
      const app = await createServer(container);

      const response = await request(app).put("/authentications").send({
        refreshToken: "invalid_refresh_token",
      });

      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual("fail");
      expect(response.body.message).toEqual("refresh token tidak valid");
    });

    it("should return 400 if refresh token not registered in database", async () => {
      const app = await createServer(container);

      const refreshToken = await container
        .getInstance(AuthenticationTokenManager.name)
        .createRefreshToken({
          username: "dicoding",
        });

      const response = await request(app)
        .put("/authentications")
        .send({ refreshToken });

      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual("fail");
      expect(response.body.message).toEqual(
        "refresh token tidak ditemukan di database",
      );
    });
  });

  describe("when DELETE /authentications", () => {
    it("should response 200 if refresh token valid", async () => {
      const app = await createServer(container);
      const refreshToken = "refresh_token";

      await AuthenticationsTableTestHelper.addToken(refreshToken);

      const response = await request(app)
        .delete("/authentications")
        .send({ refreshToken });

      expect(response.status).toEqual(200);
      expect(response.body.status).toEqual("success");
    });

    it("should response 400 if refresh token not registered in database", async () => {
      const app = await createServer(container);
      const refreshToken = "refresh_token";

      const response = await request(app)
        .delete("/authentications")
        .send({ refreshToken });

      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual("fail");
      expect(response.body.message).toEqual(
        "refresh token tidak ditemukan di database",
      );
    });

    it("should response 400 if payload not contain refresh token", async () => {
      const app = await createServer(container);

      const response = await request(app).delete("/authentications").send({});

      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual("fail");
      expect(response.body.message).toEqual("harus mengirimkan token refresh");
    });
  });

  // ============================================================
  // THREADS FUNCTIONAL TEST
  // ============================================================

  describe("when GET /threads", () => {
    it("should response 200 and return threads", async () => {
      // Arrange
      const app = await createServer(container);

      await request(app).post("/users").send({
        username: "dicoding",
        password: "secret",
        fullname: "Dicoding Indonesia",
      });

      const loginResponse = await request(app).post("/authentications").send({
        username: "dicoding",
        password: "secret",
      });

      const { accessToken } = loginResponse.body.data;

      await request(app)
        .post("/threads")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          title: "Sebuah thread",
          body: "Sebuah body thread",
        });

      // Action
      const response = await request(app).get("/threads");

      // Assert
      expect(response.status).toEqual(200);
      expect(response.body.status).toEqual("success");
      expect(response.body.data.threads).toBeDefined();
      expect(response.body.data.threads).toHaveLength(1);
      expect(response.body.data.threads[0]).toMatchObject({
        title: "Sebuah thread",
        body: "Sebuah body thread",
        username: "dicoding",
      });
    });
  });

  describe("when GET /threads/:threadId", () => {
    it("should response 200 and return thread detail", async () => {
      // Arrange
      const app = await createServer(container);

      await request(app).post("/users").send({
        username: "dicoding",
        password: "secret",
        fullname: "Dicoding Indonesia",
      });

      const loginResponse = await request(app).post("/authentications").send({
        username: "dicoding",
        password: "secret",
      });

      const { accessToken } = loginResponse.body.data;

      const threadResponse = await request(app)
        .post("/threads")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          title: "Sebuah thread",
          body: "Sebuah body thread",
        });

      const threadId = threadResponse.body.data.addedThread.id;

      // Action
      const response = await request(app).get(`/threads/${threadId}`);

      // Assert
      expect(response.status).toEqual(200);
      expect(response.body.status).toEqual("success");
      expect(response.body.data.thread).toBeDefined();
      expect(response.body.data.thread).toMatchObject({
        id: threadId,
        title: "Sebuah thread",
        body: "Sebuah body thread",
        username: "dicoding",
      });
      expect(response.body.data.thread.comments).toEqual([]);
    });

    it("should response 404 when thread not found", async () => {
      // Arrange
      const app = await createServer(container);

      // Action
      const response = await request(app).get("/threads/thread-not-found");

      // Assert
      expect(response.status).toEqual(404);
      expect(response.body.status).toEqual("fail");
    });
  });

  describe("when POST /threads", () => {
    it("should response 401 when request without authentication", async () => {
      // Arrange
      const app = await createServer(container);

      // Action
      const response = await request(app).post("/threads").send({
        title: "Sebuah thread",
        body: "Sebuah body thread",
      });

      // Assert
      expect(response.status).toEqual(401);
      expect(response.body.status).toEqual("fail");
    });

    it("should response 201 and persist new thread", async () => {
      // Arrange
      const app = await createServer(container);

      await request(app).post("/users").send({
        username: "dicoding",
        password: "secret",
        fullname: "Dicoding Indonesia",
      });

      const loginResponse = await request(app).post("/authentications").send({
        username: "dicoding",
        password: "secret",
      });

      const { accessToken } = loginResponse.body.data;

      // Action
      const response = await request(app)
        .post("/threads")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          title: "Sebuah thread",
          body: "Sebuah body thread",
        });

      // Assert
      expect(response.status).toEqual(201);
      expect(response.body.status).toEqual("success");
      expect(response.body.data.addedThread).toBeDefined();
      expect(response.body.data.addedThread.title).toEqual("Sebuah thread");
      expect(response.body.data.addedThread.owner).toBeDefined();
      expect(response.body.data.addedThread.id).toMatch(/^thread-/);

      const threadId = response.body.data.addedThread.id;

      const detailResponse = await request(app).get(`/threads/${threadId}`);

      expect(detailResponse.status).toEqual(200);
      expect(detailResponse.body.data.thread.id).toEqual(threadId);
      expect(detailResponse.body.data.thread.title).toEqual("Sebuah thread");
      expect(detailResponse.body.data.thread.body).toEqual(
        "Sebuah body thread",
      );
    });

    it("should response 400 when payload does not contain needed property", async () => {
      // Arrange
      const app = await createServer(container);

      await request(app).post("/users").send({
        username: "dicoding",
        password: "secret",
        fullname: "Dicoding Indonesia",
      });

      const loginResponse = await request(app).post("/authentications").send({
        username: "dicoding",
        password: "secret",
      });

      const { accessToken } = loginResponse.body.data;

      // Action
      const response = await request(app)
        .post("/threads")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          title: "Sebuah thread",
        });

      // Assert
      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual("fail");
    });

    it("should response 400 when payload does not meet data type specification", async () => {
      // Arrange
      const app = await createServer(container);

      await request(app).post("/users").send({
        username: "dicoding",
        password: "secret",
        fullname: "Dicoding Indonesia",
      });

      const loginResponse = await request(app).post("/authentications").send({
        username: "dicoding",
        password: "secret",
      });

      const { accessToken } = loginResponse.body.data;

      // Action
      const response = await request(app)
        .post("/threads")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          title: ["Sebuah thread"],
          body: "Sebuah body thread",
        });

      // Assert
      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual("fail");
    });
  });

  // ============================================================
  // COMMENTS FUNCTIONAL TEST
  // ============================================================

  describe("when POST /threads/:threadId/comments", () => {
    it("should response 401 when request without authentication", async () => {
      // Arrange
      const app = await createServer(container);

      await request(app).post("/users").send({
        username: "dicoding",
        password: "secret",
        fullname: "Dicoding Indonesia",
      });

      const loginResponse = await request(app).post("/authentications").send({
        username: "dicoding",
        password: "secret",
      });

      const { accessToken } = loginResponse.body.data;

      const threadResponse = await request(app)
        .post("/threads")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          title: "Sebuah thread",
          body: "Sebuah body thread",
        });

      const threadId = threadResponse.body.data.addedThread.id;

      // Action
      const response = await request(app)
        .post(`/threads/${threadId}/comments`)
        .send({
          content: "Sebuah komentar",
        });

      // Assert
      expect(response.status).toEqual(401);
      expect(response.body.status).toEqual("fail");
    });

    it("should response 201 and persist new comment", async () => {
      // Arrange
      const app = await createServer(container);

      await request(app).post("/users").send({
        username: "dicoding",
        password: "secret",
        fullname: "Dicoding Indonesia",
      });

      const loginResponse = await request(app).post("/authentications").send({
        username: "dicoding",
        password: "secret",
      });

      const { accessToken } = loginResponse.body.data;

      const threadResponse = await request(app)
        .post("/threads")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          title: "Sebuah thread",
          body: "Sebuah body thread",
        });

      const threadId = threadResponse.body.data.addedThread.id;

      // Action
      const response = await request(app)
        .post(`/threads/${threadId}/comments`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          content: "Sebuah komentar",
        });

      // Assert
      expect(response.status).toEqual(201);
      expect(response.body.status).toEqual("success");
      expect(response.body.data.addedComment).toBeDefined();
      expect(response.body.data.addedComment.content).toEqual(
        "Sebuah komentar",
      );
      expect(response.body.data.addedComment.owner).toEqual("dicoding");
      expect(response.body.data.addedComment.id).toBeDefined();

      const detailResponse = await request(app).get(`/threads/${threadId}`);

      expect(detailResponse.status).toEqual(200);
      expect(detailResponse.body.data.thread.comments).toHaveLength(1);
      expect(detailResponse.body.data.thread.comments[0].content).toEqual(
        "Sebuah komentar",
      );
      expect(detailResponse.body.data.thread.comments[0].username).toEqual(
        "dicoding",
      );
    });

    it("should response 400 when comment payload does not contain needed property", async () => {
      // Arrange
      const app = await createServer(container);

      await request(app).post("/users").send({
        username: "dicoding",
        password: "secret",
        fullname: "Dicoding Indonesia",
      });

      const loginResponse = await request(app).post("/authentications").send({
        username: "dicoding",
        password: "secret",
      });

      const { accessToken } = loginResponse.body.data;

      const threadResponse = await request(app)
        .post("/threads")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          title: "Sebuah thread",
          body: "Sebuah body thread",
        });

      const threadId = threadResponse.body.data.addedThread.id;

      // Action
      const response = await request(app)
        .post(`/threads/${threadId}/comments`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({});

      // Assert
      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual("fail");
    });

    it("should response 400 when comment payload does not meet data type specification", async () => {
      // Arrange
      const app = await createServer(container);

      await request(app).post("/users").send({
        username: "dicoding",
        password: "secret",
        fullname: "Dicoding Indonesia",
      });

      const loginResponse = await request(app).post("/authentications").send({
        username: "dicoding",
        password: "secret",
      });

      const { accessToken } = loginResponse.body.data;

      const threadResponse = await request(app)
        .post("/threads")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          title: "Sebuah thread",
          body: "Sebuah body thread",
        });

      const threadId = threadResponse.body.data.addedThread.id;

      // Action
      const response = await request(app)
        .post(`/threads/${threadId}/comments`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          content: 123,
        });

      // Assert
      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual("fail");
    });
  });

  describe("when DELETE /threads/:threadId/comments/:commentId", () => {
    it("should response 200 when comment successfully deleted", async () => {
      // Arrange
      const app = await createServer(container);

      await request(app).post("/users").send({
        username: "dicoding",
        password: "secret",
        fullname: "Dicoding Indonesia",
      });

      const loginResponse = await request(app).post("/authentications").send({
        username: "dicoding",
        password: "secret",
      });

      const { accessToken } = loginResponse.body.data;

      const threadResponse = await request(app)
        .post("/threads")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          title: "Sebuah thread",
          body: "Sebuah body thread",
        });

      const threadId = threadResponse.body.data.addedThread.id;

      const commentResponse = await request(app)
        .post(`/threads/${threadId}/comments`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          content: "Komentar yang akan dihapus",
        });

      const commentId = commentResponse.body.data.addedComment.id;

      // Action
      const response = await request(app)
        .delete(`/threads/${threadId}/comments/${commentId}`)
        .set("Authorization", `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toEqual(200);
      expect(response.body.status).toEqual("success");

      const detailResponse = await request(app).get(`/threads/${threadId}`);

      expect(detailResponse.status).toEqual(200);
      expect(detailResponse.body.data.thread.comments).toHaveLength(1);

      expect(detailResponse.body.data.thread.comments[0]).toMatchObject({
        id: commentId,
        username: "dicoding",
        content: "**komentar telah dihapus**",
      });
    });

    it("should response 401 when delete comment without authentication", async () => {
      // Arrange
      const app = await createServer(container);

      await request(app).post("/users").send({
        username: "dicoding",
        password: "secret",
        fullname: "Dicoding Indonesia",
      });

      const loginResponse = await request(app).post("/authentications").send({
        username: "dicoding",
        password: "secret",
      });

      const { accessToken } = loginResponse.body.data;

      const threadResponse = await request(app)
        .post("/threads")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          title: "Sebuah thread",
          body: "Sebuah body thread",
        });

      const threadId = threadResponse.body.data.addedThread.id;

      const commentResponse = await request(app)
        .post(`/threads/${threadId}/comments`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          content: "Komentar yang akan dihapus",
        });

      const commentId = commentResponse.body.data.addedComment.id;

      // Action
      const response = await request(app).delete(
        `/threads/${threadId}/comments/${commentId}`,
      );

      // Assert
      expect(response.status).toEqual(401);
    });

    it("should response 403 when delete comment by another user", async () => {
      // Arrange
      const app = await createServer(container);

      await request(app).post("/users").send({
        username: "dicoding",
        password: "secret",
        fullname: "Dicoding Indonesia",
      });

      await request(app).post("/users").send({
        username: "user2",
        password: "secret",
        fullname: "User Two",
      });

      const loginResponse = await request(app).post("/authentications").send({
        username: "dicoding",
        password: "secret",
      });

      const loginResponseUser2 = await request(app)
        .post("/authentications")
        .send({
          username: "user2",
          password: "secret",
        });

      const { accessToken } = loginResponse.body.data;
      const { accessToken: accessTokenUser2 } = loginResponseUser2.body.data;

      const threadResponse = await request(app)
        .post("/threads")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          title: "Sebuah thread",
          body: "Sebuah body thread",
        });

      const threadId = threadResponse.body.data.addedThread.id;

      const commentResponse = await request(app)
        .post(`/threads/${threadId}/comments`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          content: "Komentar milik dicoding",
        });

      const commentId = commentResponse.body.data.addedComment.id;

      // Action
      const response = await request(app)
        .delete(`/threads/${threadId}/comments/${commentId}`)
        .set("Authorization", `Bearer ${accessTokenUser2}`);

      // Assert
      expect(response.status).toEqual(403);
      expect(response.body.status).toEqual("fail");
    });
  });

  describe("when DELETE /threads/:threadId/comments/:commentId/replies/:replyId", () => {
    it("should response 200 when reply successfully deleted", async () => {
      // Arrange
      const app = await createServer(container);

      await request(app).post("/users").send({
        username: "dicoding",
        password: "secret",
        fullname: "Dicoding Indonesia",
      });

      const loginResponse = await request(app).post("/authentications").send({
        username: "dicoding",
        password: "secret",
      });

      const { accessToken } = loginResponse.body.data;

      const threadResponse = await request(app)
        .post("/threads")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          title: "Sebuah thread",
          body: "Sebuah body thread",
        });

      const threadId = threadResponse.body.data.addedThread.id;

      const commentResponse = await request(app)
        .post(`/threads/${threadId}/comments`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          content: "Sebuah komentar",
        });

      const commentId = commentResponse.body.data.addedComment.id;

      const replyResponse = await request(app)
        .post(`/threads/${threadId}/comments/${commentId}/replies`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          content: "Sebuah balasan",
        });

      const replyId = replyResponse.body.data.addedReply.id;

      // Action
      const response = await request(app)
        .delete(`/threads/${threadId}/comments/${commentId}/replies/${replyId}`)
        .set("Authorization", `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toEqual(200);
      expect(response.body.status).toEqual("success");

      const detailResponse = await request(app).get(`/threads/${threadId}`);

      expect(detailResponse.status).toEqual(200);

      const comments = detailResponse.body.data.thread.comments;

      expect(comments).toHaveLength(1);
      expect(comments[0].replies).toHaveLength(1);

      expect(comments[0].replies[0]).toMatchObject({
        id: replyId,
        username: "dicoding",
        content: "**balasan telah dihapus**",
      });
    });

    it("should response 401 when delete reply without authentication", async () => {
      // Arrange
      const app = await createServer(container);

      await request(app).post("/users").send({
        username: "dicoding",
        password: "secret",
        fullname: "Dicoding Indonesia",
      });

      const loginResponse = await request(app).post("/authentications").send({
        username: "dicoding",
        password: "secret",
      });

      const { accessToken } = loginResponse.body.data;

      const threadResponse = await request(app)
        .post("/threads")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          title: "Sebuah thread",
          body: "Sebuah body thread",
        });

      const threadId = threadResponse.body.data.addedThread.id;

      const commentResponse = await request(app)
        .post(`/threads/${threadId}/comments`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          content: "Sebuah komentar",
        });

      const commentId = commentResponse.body.data.addedComment.id;

      const replyResponse = await request(app)
        .post(`/threads/${threadId}/comments/${commentId}/replies`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          content: "Sebuah balasan",
        });

      const replyId = replyResponse.body.data.addedReply.id;

      // Action
      const response = await request(app).delete(
        `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
      );

      // Assert
      expect(response.status).toEqual(401);
    });

    it("should response 403 when delete reply by another user", async () => {
      // Arrange
      const app = await createServer(container);

      await request(app).post("/users").send({
        username: "dicoding",
        password: "secret",
        fullname: "Dicoding Indonesia",
      });

      await request(app).post("/users").send({
        username: "user2",
        password: "secret",
        fullname: "User Two",
      });

      const loginResponse = await request(app).post("/authentications").send({
        username: "dicoding",
        password: "secret",
      });

      const loginResponseUser2 = await request(app)
        .post("/authentications")
        .send({
          username: "user2",
          password: "secret",
        });

      const { accessToken } = loginResponse.body.data;
      const { accessToken: accessTokenUser2 } = loginResponseUser2.body.data;

      const threadResponse = await request(app)
        .post("/threads")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          title: "Sebuah thread",
          body: "Sebuah body thread",
        });

      const threadId = threadResponse.body.data.addedThread.id;

      const commentResponse = await request(app)
        .post(`/threads/${threadId}/comments`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          content: "Sebuah komentar",
        });

      const commentId = commentResponse.body.data.addedComment.id;

      const replyResponse = await request(app)
        .post(`/threads/${threadId}/comments/${commentId}/replies`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          content: "Reply milik dicoding",
        });

      const replyId = replyResponse.body.data.addedReply.id;

      // Action
      const response = await request(app)
        .delete(`/threads/${threadId}/comments/${commentId}/replies/${replyId}`)
        .set("Authorization", `Bearer ${accessTokenUser2}`);

      // Assert
      expect(response.status).toEqual(403);
      expect(response.body.status).toEqual("fail");
    });
  });

  // ============================================================
  // REPLIES FUNCTIONAL TEST
  // ============================================================

  describe("when POST /threads/:threadId/comments/:commentId/replies", () => {
    it("should response 401 when request without authentication", async () => {
      // Arrange
      const app = await createServer(container);

      await request(app).post("/users").send({
        username: "dicoding",
        password: "secret",
        fullname: "Dicoding Indonesia",
      });

      const loginResponse = await request(app).post("/authentications").send({
        username: "dicoding",
        password: "secret",
      });

      const { accessToken } = loginResponse.body.data;

      const threadResponse = await request(app)
        .post("/threads")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          title: "Sebuah thread",
          body: "Sebuah body thread",
        });

      const threadId = threadResponse.body.data.addedThread.id;

      const commentResponse = await request(app)
        .post(`/threads/${threadId}/comments`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          content: "Sebuah komentar",
        });

      const commentId = commentResponse.body.data.addedComment.id;

      // Action
      const response = await request(app)
        .post(`/threads/${threadId}/comments/${commentId}/replies`)
        .send({
          content: "Sebuah balasan",
        });

      // Assert
      expect(response.status).toEqual(401);
      expect(response.body.status).toEqual("fail");
    });

    it("should response 201 and persist new reply", async () => {
      // Arrange
      const app = await createServer(container);

      await request(app).post("/users").send({
        username: "dicoding",
        password: "secret",
        fullname: "Dicoding Indonesia",
      });

      const loginResponse = await request(app).post("/authentications").send({
        username: "dicoding",
        password: "secret",
      });

      const { accessToken } = loginResponse.body.data;

      const threadResponse = await request(app)
        .post("/threads")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          title: "Sebuah thread",
          body: "Sebuah body thread",
        });

      const threadId = threadResponse.body.data.addedThread.id;

      const commentResponse = await request(app)
        .post(`/threads/${threadId}/comments`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          content: "Sebuah komentar",
        });

      const commentId = commentResponse.body.data.addedComment.id;

      // Action
      const response = await request(app)
        .post(`/threads/${threadId}/comments/${commentId}/replies`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          content: "Sebuah balasan",
        });

      // Assert
      expect(response.status).toEqual(201);
      expect(response.body.status).toEqual("success");
      expect(response.body.data.addedReply).toBeDefined();
      expect(response.body.data.addedReply.content).toEqual("Sebuah balasan");
      expect(response.body.data.addedReply.owner).toEqual("dicoding");
      expect(response.body.data.addedReply.id).toMatch(/^reply-/);

      const detailResponse = await request(app).get(`/threads/${threadId}`);

      expect(detailResponse.status).toEqual(200);
      expect(detailResponse.body.data.thread.comments).toHaveLength(1);
      expect(detailResponse.body.data.thread.comments[0].replies).toHaveLength(
        1,
      );

      expect(
        detailResponse.body.data.thread.comments[0].replies[0],
      ).toMatchObject({
        id: response.body.data.addedReply.id,
        content: "Sebuah balasan",
        username: "dicoding",
      });
    });

    it("should response 400 when reply payload does not contain needed property", async () => {
      // Arrange
      const app = await createServer(container);

      await request(app).post("/users").send({
        username: "dicoding",
        password: "secret",
        fullname: "Dicoding Indonesia",
      });

      const loginResponse = await request(app).post("/authentications").send({
        username: "dicoding",
        password: "secret",
      });

      const { accessToken } = loginResponse.body.data;

      const threadResponse = await request(app)
        .post("/threads")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          title: "Sebuah thread",
          body: "Sebuah body thread",
        });

      const threadId = threadResponse.body.data.addedThread.id;

      const commentResponse = await request(app)
        .post(`/threads/${threadId}/comments`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          content: "Sebuah komentar",
        });

      const commentId = commentResponse.body.data.addedComment.id;

      // Action
      const response = await request(app)
        .post(`/threads/${threadId}/comments/${commentId}/replies`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({});

      // Assert
      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual("fail");
    });

    it("should response 400 when reply content does not meet data type specification", async () => {
      // Arrange
      const app = await createServer(container);

      await request(app).post("/users").send({
        username: "dicoding",
        password: "secret",
        fullname: "Dicoding Indonesia",
      });

      const loginResponse = await request(app).post("/authentications").send({
        username: "dicoding",
        password: "secret",
      });

      const { accessToken } = loginResponse.body.data;

      const threadResponse = await request(app)
        .post("/threads")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          title: "Sebuah thread",
          body: "Sebuah body thread",
        });

      const threadId = threadResponse.body.data.addedThread.id;

      const commentResponse = await request(app)
        .post(`/threads/${threadId}/comments`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          content: "Sebuah komentar",
        });

      const commentId = commentResponse.body.data.addedComment.id;

      // Action
      const response = await request(app)
        .post(`/threads/${threadId}/comments/${commentId}/replies`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          content: ["Sebuah balasan"],
        });

      // Assert
      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual("fail");
    });

    it("should response 404 when comment not found", async () => {
      // Arrange
      const app = await createServer(container);

      await request(app).post("/users").send({
        username: "dicoding",
        password: "secret",
        fullname: "Dicoding Indonesia",
      });

      const loginResponse = await request(app).post("/authentications").send({
        username: "dicoding",
        password: "secret",
      });

      const { accessToken } = loginResponse.body.data;

      const threadResponse = await request(app)
        .post("/threads")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          title: "Sebuah thread",
          body: "Sebuah body thread",
        });

      const threadId = threadResponse.body.data.addedThread.id;

      // Action
      const response = await request(app)
        .post(`/threads/${threadId}/comments/comment-not-found/replies`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          content: "Sebuah balasan",
        });

      // Assert
      expect(response.status).toEqual(404);
      expect(response.body.status).toEqual("fail");
    });
  });

  // ============================================================
  // COMMENT LIKES FUNCTIONAL TEST
  // ============================================================

  describe("when PUT /threads/:threadId/comments/:commentId/likes", () => {
    it("should response 401 when request without authentication", async () => {
      // Arrange
      const app = await createServer(container);

      await request(app).post("/users").send({
        username: "dicoding",
        password: "secret",
        fullname: "Dicoding Indonesia",
      });

      const loginResponse = await request(app).post("/authentications").send({
        username: "dicoding",
        password: "secret",
      });

      const { accessToken } = loginResponse.body.data;

      const threadResponse = await request(app)
        .post("/threads")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          title: "Sebuah thread",
          body: "Sebuah body thread",
        });

      const threadId = threadResponse.body.data.addedThread.id;

      const commentResponse = await request(app)
        .post(`/threads/${threadId}/comments`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          content: "Sebuah komentar",
        });

      const commentId = commentResponse.body.data.addedComment.id;

      // Action
      const response = await request(app).put(
        `/threads/${threadId}/comments/${commentId}/likes`,
      );

      // Assert
      expect(response.status).toEqual(401);
      expect(response.body.status).toEqual("fail");
    });

    it("should response 200 when user likes a comment", async () => {
      // Arrange
      const app = await createServer(container);

      await request(app).post("/users").send({
        username: "dicoding",
        password: "secret",
        fullname: "Dicoding Indonesia",
      });

      const loginResponse = await request(app).post("/authentications").send({
        username: "dicoding",
        password: "secret",
      });

      const { accessToken } = loginResponse.body.data;

      const threadResponse = await request(app)
        .post("/threads")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          title: "Sebuah thread",
          body: "Sebuah body thread",
        });

      const threadId = threadResponse.body.data.addedThread.id;

      const commentResponse = await request(app)
        .post(`/threads/${threadId}/comments`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          content: "Sebuah komentar",
        });

      const commentId = commentResponse.body.data.addedComment.id;

      // Action
      const response = await request(app)
        .put(`/threads/${threadId}/comments/${commentId}/likes`)
        .set("Authorization", `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toEqual(200);
      expect(response.body.status).toEqual("success");
    });

    it("should response 200 when user unlikes a comment", async () => {
      // Arrange
      const app = await createServer(container);

      await request(app).post("/users").send({
        username: "dicoding",
        password: "secret",
        fullname: "Dicoding Indonesia",
      });

      const loginResponse = await request(app).post("/authentications").send({
        username: "dicoding",
        password: "secret",
      });

      const { accessToken } = loginResponse.body.data;

      const threadResponse = await request(app)
        .post("/threads")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          title: "Sebuah thread",
          body: "Sebuah body thread",
        });

      const threadId = threadResponse.body.data.addedThread.id;

      const commentResponse = await request(app)
        .post(`/threads/${threadId}/comments`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          content: "Sebuah komentar",
        });

      const commentId = commentResponse.body.data.addedComment.id;

      const likeResponse = await request(app)
        .put(`/threads/${threadId}/comments/${commentId}/likes`)
        .set("Authorization", `Bearer ${accessToken}`);

      expect(likeResponse.status).toEqual(200);

      // Action
      const response = await request(app)
        .put(`/threads/${threadId}/comments/${commentId}/likes`)
        .set("Authorization", `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toEqual(200);
      expect(response.body.status).toEqual("success");
    });

    it("should persist like count in thread detail", async () => {
      // Arrange
      const app = await createServer(container);

      await request(app).post("/users").send({
        username: "dicoding",
        password: "secret",
        fullname: "Dicoding Indonesia",
      });

      const loginResponse = await request(app).post("/authentications").send({
        username: "dicoding",
        password: "secret",
      });

      const { accessToken } = loginResponse.body.data;

      const threadResponse = await request(app)
        .post("/threads")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          title: "Sebuah thread",
          body: "Sebuah body thread",
        });

      const threadId = threadResponse.body.data.addedThread.id;

      const commentResponse = await request(app)
        .post(`/threads/${threadId}/comments`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          content: "Sebuah komentar",
        });

      const commentId = commentResponse.body.data.addedComment.id;

      // Like
      await request(app)
        .put(`/threads/${threadId}/comments/${commentId}/likes`)
        .set("Authorization", `Bearer ${accessToken}`);

      // Action
      const response = await request(app).get(`/threads/${threadId}`);

      // Assert
      expect(response.status).toEqual(200);
      expect(response.body.status).toEqual("success");
      expect(response.body.data.thread.comments).toHaveLength(1);
      expect(response.body.data.thread.comments[0]).toMatchObject({
        id: commentId,
        username: "dicoding",
        content: "Sebuah komentar",
        likeCount: 1,
      });
    });

    it("should return likeCount 0 after user unlikes a comment", async () => {
      // Arrange
      const app = await createServer(container);

      await request(app).post("/users").send({
        username: "dicoding",
        password: "secret",
        fullname: "Dicoding Indonesia",
      });

      const loginResponse = await request(app).post("/authentications").send({
        username: "dicoding",
        password: "secret",
      });

      const { accessToken } = loginResponse.body.data;

      const threadResponse = await request(app)
        .post("/threads")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          title: "Sebuah thread",
          body: "Sebuah body thread",
        });

      const threadId = threadResponse.body.data.addedThread.id;

      const commentResponse = await request(app)
        .post(`/threads/${threadId}/comments`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          content: "Sebuah komentar",
        });

      const commentId = commentResponse.body.data.addedComment.id;

      const likeEndpoint = `/threads/${threadId}/comments/${commentId}/likes`;

      // Like
      await request(app)
        .put(likeEndpoint)
        .set("Authorization", `Bearer ${accessToken}`);

      // Unlike
      await request(app)
        .put(likeEndpoint)
        .set("Authorization", `Bearer ${accessToken}`);

      // Action
      const response = await request(app).get(`/threads/${threadId}`);

      // Assert
      expect(response.status).toEqual(200);
      expect(response.body.data.thread.comments[0].likeCount).toEqual(0);
    });

    it("should response 404 when comment does not belong to thread", async () => {
      // Arrange
      const app = await createServer(container);

      await request(app).post("/users").send({
        username: "dicoding",
        password: "secret",
        fullname: "Dicoding Indonesia",
      });

      const loginResponse = await request(app).post("/authentications").send({
        username: "dicoding",
        password: "secret",
      });

      const { accessToken } = loginResponse.body.data;

      const threadResponse = await request(app)
        .post("/threads")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          title: "Sebuah thread",
          body: "Sebuah body thread",
        });

      const threadId = threadResponse.body.data.addedThread.id;

      // Action
      const response = await request(app)
        .put(`/threads/${threadId}/comments/comment-not-found/likes`)
        .set("Authorization", `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toEqual(404);
      expect(response.body.status).toEqual("fail");
    });
  });
});
