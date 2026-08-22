import { formatNextChange } from "../src/lib/hours";

let failures = 0;

function expect(label: string, actual: string | null, wanted: RegExp | null) {
  const ok =
    wanted === null ? actual === null : actual !== null && wanted.test(actual);
  console.log(`${ok ? "PASS" : "FAIL"} ${label} => "${actual}"`);
  if (!ok) failures++;
}

expect("24/7", formatNextChange("24/7"), /^Open 24 hours$/);
expect("null hours", formatNextChange(null), null);
expect("unparseable", formatNextChange("sometimes"), null);

const weekday = "Mo-Fr 08:00-17:00";
expect("weekday rules parse", formatNextChange(weekday), /^(Open until|Opens)/);

const withMinutes = "Mo-Su 09:30-21:45";
expect(
  "minutes rendered",
  formatNextChange(withMinutes),
  /(9:30 AM|9:45 PM)/
);

console.log(failures === 0 ? "\nAll hour tests passed" : `\n${failures} failures`);
process.exit(failures === 0 ? 0 : 1);
