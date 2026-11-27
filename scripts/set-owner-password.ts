import { createInterface } from "readline";
import { stdin, stdout } from "process";

async function askHidden(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    const rl = createInterface({ input: stdin, output: stdout, terminal: true });
    stdout.write(prompt);
    (rl as any)._writeToOutput = (s: string) => {};
    rl.question("", (answer) => { rl.close(); stdout.write("\n"); resolve(answer); });
  });
}

const email = (process.env.ADMIN_EMAILS || "").split(",")[0].trim().toLowerCase();
if (!email) { console.error("ADMIN_EMAILS not set"); process.exit(1); }

const password = await askHidden("New password (min 12 chars, hidden): ");
if (password.length < 12) { console.error("Password too short"); process.exit(1); }

const base = process.env.NEON_AUTH_BASE_URL!;
const res = await fetch(`${base}/sign-up/email`, {
  method: "POST",
  headers: { "Content-Type": "application/json", "Origin": base },
  body: JSON.stringify({ email, password, name: "Owner" }),
});
const data = await res.json().catch(() => ({}));
console.log("Status:", res.status);
if (!res.ok) { console.error("Error:", data?.message || data?.error || "unknown"); process.exit(1); }
console.log("Account ready for", email);
