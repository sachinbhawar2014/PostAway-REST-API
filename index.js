// import modules and liabraries
import express, { json } from "express";
import cookieParcer from "cookie-parser";
import swagger from "swagger-ui-express";

import { ApplicationError, errorHandlerMiddleware } from "./src/middlewares/applicationError.js";
import jwtAuth from "./src/middlewares/jwtAuth.js";
import apiDocs from "./swagger.json" assert { type: "json" };

// import routers
import usersRouter from "./src/features/users/users.routes.js";
import postsRouter from "./src/features/posts/posts.routes.js";
import commentsRouter from "./src/features/comments/comments.routes.js";
import likesRouter from "./src/features/likes/likes.routes.js";
import otpRouter from "./src/features/otp/otp.routes.js";
import friendsRouter from "./src/features/friends/friends.routes.js";

// rest api
const app = express();

// middlewares
app.use(express.json());
app.use(cookieParcer());
// app.use(loggerMiddleware);

//routes
app.use("/api/users", usersRouter);
app.use("/api/otp", otpRouter);
app.use("/api/comments", jwtAuth, commentsRouter);
app.use("/api/posts", jwtAuth, postsRouter);
app.use("/api/likes", jwtAuth, likesRouter);
app.use("/api/friends", jwtAuth, friendsRouter);
app.use("/api-docs", swagger.serve, swagger.setup(apiDocs));

// error handler middlewares
app.use(errorHandlerMiddleware);

// app.use((err, req, res, next) => {
//   if (err instanceof ApplicationError) {
//     res.status(err.code).send(err.message);
//   }
//   res.status(500).send("Something went wrong please try again later.");
// });

app.all("*", (req, res) => {
  res.status(404).send({
    success: false,
    msg: "This route is not Supported by this app. For referece please check documentation at /api-docs",
  });
});
export default app;
