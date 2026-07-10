import { execSync } from "child_process";
import dotenv from "dotenv";

dotenv.config();

const dbUser = process.env.SQL_ADMIN_USER;
const dbPassword = process.env.SQL_ADMIN_PASSWORD;
const dbName = process.env.SQL_DB_NAME;
const dbHost = process.env.SQL_HOST;

if (!dbUser || !dbHost || !dbName) {
  console.error("Missing SQL environment variables (SQL_ADMIN_USER, SQL_HOST, SQL_DB_NAME).");
  process.exit(1);
}

let databaseUrl = "";
if (dbHost.startsWith("/")) {
  databaseUrl = `postgresql://${dbUser}:${encodeURIComponent(dbPassword || "")}@localhost/${dbName}?host=${encodeURIComponent(dbHost)}`;
} else {
  databaseUrl = `postgresql://${dbUser}:${encodeURIComponent(dbPassword || "")}@${dbHost}/${dbName}`;
}

console.log("Constructed admin connection URL for Prisma database push.");

try {
  execSync("npx prisma db push", {
    env: {
      ...process.env,
      DATABASE_URL: databaseUrl,
    },
    stdio: "inherit",
  });
  console.log("Prisma db push completed successfully!");
} catch (error) {
  console.error("Prisma db push failed:", error);
  process.exit(1);
}
