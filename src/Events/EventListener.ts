import eventEmitter from "./EventEmitter.ts";
import ProcessUserMatch from "./ProcessUserMatch.ts";

export default function EventListener() {
  eventEmitter.on("processUserMatch", ProcessUserMatch);
}
