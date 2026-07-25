import { test } from "node:test";
import assert from "node:assert";
import {
  extractEmails,
  extractPhones,
  extractLinkedIn,
  extractGithub,
  extractSkills,
  extractName,
} from "../utils/parser.js";

test("extracts a single email correctly", () => {
  const text = "Contact me at john.doe@example.com for more info";
  assert.deepStrictEqual(extractEmails(text), ["john.doe@example.com"]);
});

test("extracts multiple unique emails, deduplicated", () => {
  const text = "Email: a@test.com or a@test.com or b@test.com";
  const result = extractEmails(text);
  assert.strictEqual(result.length, 2);
});

test("extracts phone number correctly", () => {
  const text = "Phone: +91 9876543210";
  const result = extractPhones(text);
  assert.ok(result.length > 0);
  assert.ok(result[0].replace(/[^0-9]/g, "").length >= 10);
});

test("filters out short false-positive phone matches", () => {
  const text = "Year: 2024, Score: 95";
  const result = extractPhones(text);
  assert.strictEqual(result.length, 0);
});

test("extracts LinkedIn URL", () => {
  const text = "Find me at linkedin.com/in/john-doe-123";
  assert.strictEqual(extractLinkedIn(text), "linkedin.com/in/john-doe-123");
});

test("extracts GitHub URL", () => {
  const text = "Code at github.com/johndoe";
  assert.strictEqual(extractGithub(text), "github.com/johndoe");
});

test("matches known skills from text, case-insensitive", () => {
  const text = "Experienced in React, Node.js, and MongoDB development";
  const skills = extractSkills(text);
  assert.ok(skills.includes("react"));
  assert.ok(skills.includes("node.js"));
  assert.ok(skills.includes("mongodb"));
});

test("does not match unrelated words as skills", () => {
  const text = "I like reading books about history";
  const skills = extractSkills(text);
  assert.strictEqual(skills.length, 0);
});

test("extracts name from first valid line", () => {
  const text = "John Doe\njohn@example.com\n9876543210\nSUMMARY\n...";
  const name = extractName(text);
  assert.strictEqual(name, "John Doe");
});