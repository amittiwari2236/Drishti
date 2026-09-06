import { execSync } from "node:child_process";

console.log("🚀 [Render Build] Step 1/4: Generating Prisma Client...");
execSync("npx prisma generate", { stdio: "inherit" });

console.log("🔄 [Render Build] Step 2/4: Synchronizing database schema...");
try {
  execSync("npx prisma db push --accept-data-loss", { stdio: "inherit" });
} catch (error) {
  console.warn("⚠️ [Render Build] Standard push failed (likely due to legacy database schema). Applying clean reset...");
  execSync("npx prisma db push --force-reset", { stdio: "inherit" });
}

console.log("🌱 [Render Build] Step 3/4: Seeding DRISHTI master data & demo accounts...");
try {
  execSync("node prisma/seed.mjs", { stdio: "inherit" });
} catch (error) {
  console.warn("⚠️ [Render Build] Seed warning (ignored if data already exists):", error.message);
}

console.log("⚡ [Render Build] Step 4/4: Building Next.js production application...");
execSync("npx next build", {
  stdio: "inherit",
  env: { ...process.env, NODE_OPTIONS: "--max-old-space-size=450" },
});

console.log("✅ [Render Build] Build completed successfully!");
