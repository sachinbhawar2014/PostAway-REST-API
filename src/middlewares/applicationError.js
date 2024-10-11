export class ApplicationError extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
  }
}

export const errorHandlerMiddleware = (err, req, res, next) => {
  if (err instanceof ApplicationError) {
    return res.status(err.code).send(err.message);
  }
  console.log(err);
  res.status(500).send("Oops! Something went wrong... Please try again later!");
};
