import { describe, expect, it } from "vitest";
import { driveFileId, parseRoster } from "@/lib/roster";

const FILE = "1AbCdEfGhIjKlMnOpQrStUvWxYz012345";

describe("driveFileId", () => {
  it("reads the common Drive link shapes", () => {
    expect(driveFileId(`https://drive.google.com/open?id=${FILE}`)).toBe(FILE);
    expect(driveFileId(`https://drive.google.com/file/d/${FILE}/view?usp=sharing`)).toBe(FILE);
    expect(driveFileId(FILE)).toBe(FILE);
    expect(driveFileId(`https://drive.google.com/open?id=${FILE}, https://drive.google.com/open?id=other`)).toBe(FILE);
    expect(driveFileId("not a link")).toBeUndefined();
    expect(driveFileId("")).toBeUndefined();
  });
});

describe("parseRoster", () => {
  it("finds columns by header in any order and keeps only what it needs", () => {
    const rows = [
      ["Timestamp", "Email Address", "Name", "Major", "Class year", "Subteam", "LinkedIn", "Share with sponsors", "Headshot", "Resume"],
      ["11/1", "JDoe@tamu.edu", "Jane Doe", "Mechanical Engineering", "Class of 2027", "Suspension", "https://www.linkedin.com/in/jane", "Yes", `https://drive.google.com/open?id=${FILE}`, ""],
      ["11/1", "bob@tamu.edu", "Bob Ray", "", "2028", "", "linkedin.com/in/bob", "No", "", ""],
    ];
    const [jane, bob] = parseRoster(rows);
    expect(jane).toMatchObject({
      id: "jane-doe",
      name: "Jane Doe",
      emails: ["jdoe@tamu.edu"],
      classYear: "2027",
      subteam: "Suspension",
      linkedin: "https://www.linkedin.com/in/jane",
      share: true,
      headshotFileId: FILE,
    });
    expect(jane.resumeFileId).toBeUndefined();
    // Not a full https:// link, so it's dropped rather than shown broken.
    expect(bob).toMatchObject({ share: false, linkedin: undefined, classYear: "2028" });
  });

  it("accepts a second sign-in email and loose question-style headers", () => {
    const rows = [
      ["Your full name", "TAMU email", "Sign-in email", "What's your LinkedIn URL?", "OK to share your profile with sponsors?"],
      ["Al Smith", "al@tamu.edu", "al.smith@gmail.com", "https://linkedin.com/in/al", "yes"],
    ];
    expect(parseRoster(rows)[0]).toMatchObject({ emails: ["al@tamu.edu", "al.smith@gmail.com"], share: true, linkedin: "https://linkedin.com/in/al" });
  });

  it("lets a newer response replace an older one and keeps ids unique", () => {
    const rows = [
      ["Name", "Email", "Major"],
      ["Jane Doe", "jane@tamu.edu", "Old"],
      ["Jane Doe", "jane@tamu.edu", "New"],
      ["Jane Doe", "other@tamu.edu", "Different person"],
    ];
    const result = parseRoster(rows);
    expect(result.map((m) => [m.id, m.major])).toEqual([
      ["jane-doe", "New"],
      ["jane-doe-2", "Different person"],
    ]);
  });

  it("returns nothing without a Name column", () => {
    expect(parseRoster([["Email"], ["a@b.com"]])).toEqual([]);
    expect(parseRoster([])).toEqual([]);
  });
});
