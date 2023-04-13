import express from "express";
import startScheduledJobs from "../scheduled-jobs";
import routes from "./routes";
import cors from "cors"
const app = express();

app.use(express.json());
app.use(cors())
app.use((req, _res, next) => {
  console.log(req.method, req.url);
  return next();
});
app.get("/", (_req, res) => {
  res.status(200).send("Healthy World");
});

app.use("/api", routes);

startScheduledJobs();

export default app;
