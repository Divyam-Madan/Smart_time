const fs = require("fs");
const readline = require("readline-sync");

const MAX = 100;

class Event {
  constructor(name, day, start_time, end_time, is_deadline) {
    this.name = name;
    this.day = day;
    this.start_time = start_time;
    this.end_time = end_time;
    this.is_deadline = is_deadline;
  }
}

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function getDay(d) {
  return days[d];
}

function sortEvents(events) {
  events.sort((a, b) => {
    if (a.day !== b.day) return a.day - b.day;
    if (a.start_time === -1) return 1;
    if (b.start_time === -1) return -1;
    return a.start_time - b.start_time;
  });
}

function detectClashes(events) {
  console.log("\nChecking for schedule conflicts...");
  let found = false;
  for (let i = 0; i < events.length - 1; i++) {
    const e1 = events[i];
    const e2 = events[i + 1];
    if (!e1.is_deadline && !e2.is_deadline && e1.day === e2.day && e1.end_time > e2.start_time) {
      console.log(`⚠️  Clash: '${e1.name}' overlaps with '${e2.name}' on ${getDay(e1.day)}`);
      found = true;
    }
  }
  if (!found) console.log("No clashes found.");
}

function findFreeSlots(events) {
  console.log("\nSuggested Free Slots:");
  let found = false;
  for (let i = 0; i < events.length - 1; i++) {
    const e1 = events[i];
    const e2 = events[i + 1];
    if (!e1.is_deadline && !e2.is_deadline && e1.day === e2.day && e1.end_time < e2.start_time) {
      console.log(`${getDay(e1.day)}: ${formatTime(e1.end_time)} - ${formatTime(e2.start_time)}`);
      found = true;
    }
  }
  if (!found) console.log("No free slots available.");
}

function formatTime(time) {
  const h = Math.floor(time / 100);
  const m = time % 100;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function printTimetable(events) {
  console.log("\n==============================================");
  console.log("WEEKLY TIMETABLE");
  console.log("==============================================");
  console.log(`${"Day".padEnd(10)} ${"Event Name".padEnd(25)} ${"Time".padEnd(20)}`);
  console.log("--------------------------------------------------------------");

  for (let e of events) {
    if (e.is_deadline)
      console.log(`${getDay(e.day).padEnd(10)} ${e.name.padEnd(25)} By 23:59 (End of Day)`);
    else
      console.log(
        `${getDay(e.day).padEnd(10)} ${e.name.padEnd(25)} ${formatTime(e.start_time)} - ${formatTime(e.end_time)}`
      );
  }
  console.log("--------------------------------------------------------------");
}

function exportToJSON(events) {
  const filename = "schedule.json";
  const data = events.map(e => {
    if (e.is_deadline) {
      return {
        day: getDay(e.day),
        event: e.name,
        deadline: "23:59",
        type: "deadline",
      };
    } else {
      return {
        day: getDay(e.day),
        event: e.name,
        start: formatTime(e.start_time),
        end: formatTime(e.end_time),
        type: "fixed",
      };
    }
  });

  fs.writeFileSync(filename, JSON.stringify(data, null, 2));
  console.log(`\nData exported successfully to '${filename}'`);
}

function parseTime(input) {
  if (input.includes(":")) {
    const [h, m] = input.split(":").map(Number);
    return h * 100 + m;
  } else {
    return parseInt(input) * 100;
  }
}

function displayDayOptions() {
  console.log("\nChoose a day for this event by typing its number:");
  days.forEach((day, index) => console.log(`  [${index}] ${day}`));
}

function main() {
  let events = [];

  console.log("\n==============================================");
  console.log("SMART TIMETABLE & ACTIVITY PLANNER");
  console.log("==============================================\n");

  console.log("1. Create new timetable");
  console.log("2. Edit existing timetable (append new events)");
  const choice = readline.questionInt("Enter your choice: ");

  if (choice === 2 && fs.existsSync("schedule.json")) {
    console.log("\nExisting 'schedule.json' detected. New events will be added.");
    const existing = JSON.parse(fs.readFileSync("schedule.json"));
    events = existing.map(e => {
      const day = days.indexOf(e.day);
      const is_deadline = e.type === "deadline";
      const start_time = is_deadline ? -1 : parseInt(e.start.replace(":", ""));
      const end_time = is_deadline ? 2359 : parseInt(e.end.replace(":", ""));
      return new Event(e.event, day, start_time, end_time, is_deadline);
    });
  }

  const addCount = readline.questionInt("\nHow many new events/activities do you want to add now? ");

  for (let i = 0; i < addCount; i++) {
    console.log("\n----------------------------------------------");
    console.log(`EVENT ${i + 1} DETAILS`);
    console.log("----------------------------------------------");

    const name = readline.question("Enter Event Name: ");

    displayDayOptions();
    const day = readline.questionInt("Enter day number: ");

    console.log("\nIs this a deadline-based task (due by end of day)?");
    console.log("  [1] Yes (no specific start time)");
    console.log("  [0] No (enter start and end times)");
    const is_deadline = readline.questionInt("Enter your choice: ");

    let start_time, end_time;
    if (is_deadline) {
      start_time = -1;
      end_time = 2359;
      console.log(`Deadline recorded for ${getDay(day)} by 23:59 (End of Day)`);
    } else {
      const startInput = readline.question("Enter Start Time (24-hour, e.g., 09:00 or 14:30): ");
      start_time = parseTime(startInput);
      const endInput = readline.question("Enter End Time (24-hour, e.g., 10:30 or 16:00): ");
      end_time = parseTime(endInput);
    }

    events.push(new Event(name, day, start_time, end_time, is_deadline));
  }

  sortEvents(events);
  printTimetable(events);
  detectClashes(events);
  findFreeSlots(events);
  exportToJSON(events);

  console.log("\nTimetable successfully created and exported.");
  console.log("You can now view it visually on the webpage for confirmation.\n");
}

main();
