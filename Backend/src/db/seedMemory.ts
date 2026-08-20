import dotenv from "dotenv";
dotenv.config();

import db from "./index";
import { users } from "./schema";
import { syncAllUserMemories } from "../services/langchain/memoryIndexer";
import { logger } from "../utils/logger";

async function main() {
  console.log("🚀 Starting Long-Term Memory Seeding for all users...");
  try {
    const allUsers = await db.select().from(users);
    console.log(`Found ${allUsers.length} user(s) in the database.`);

    for (const user of allUsers) {
      console.log(`\nIndexing memory for user: ${user.name} (${user.email})...`);
      const result = await syncAllUserMemories(user.id, user.email);
      console.log(
        `✅ Indexed ${result.meetingsIndexed} meeting(s) and ${result.actionItemsIndexed} action item(s) for ${user.email}`
      );
    }

    console.log("\n🎉 All long-term memories have been successfully generated and indexed!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding long-term memories:", error);
    process.exit(1);
  }
}

main();
