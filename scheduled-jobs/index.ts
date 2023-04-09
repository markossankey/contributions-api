import { schedule } from "node-cron";
import updateContributions from "./update-contributions";

export default function () {
  // const jobsRanEvery5Seconds = schedule("*/5 * * * * *", () => {
  //   updateContributions();
  // });

  // const jobsRanEvery10Seconds = schedule("*/10 * * * * *", () => {
  // updateContributions();
  // });

  const jobsRanEveryMinute = schedule("*/1 * * * *", () => {
    updateContributions();
  });

  // const jobsRanEvery12Hours = schedule("0 */12 * * *", () => {
  //   updateContributions();
  // });

  // start jobs
  jobsRanEveryMinute.start();
}
