import dotenv from "dotenv";
dotenv.config();

import db from "./index";
import { users, meetings, actionItems, userMemoryEmbeddings } from "./schema";
import { sql, count, eq, inArray } from "drizzle-orm";

async function verifyMemory() {
  console.log("\n=======================================================");
  console.log("🔍 LONG-TERM MEMORY EMBEDDING VERIFICATION REPORT");
  console.log("=======================================================\n");

  try {
    // 1. Total counts in database
    const userCount = (await db.select({ count: count() }).from(users))[0].count;
    const allMeetings = await db.select().from(meetings);
    const meetingCount = allMeetings.length;
    const actionItemCount = (await db.select({ count: count() }).from(actionItems))[0].count;
    const totalChunks = (await db.select({ count: count() }).from(userMemoryEmbeddings))[0].count;

    console.log(`📊 DATABASE ENTITY TOTALS:`);
    console.log(`   • Total Users: ${userCount}`);
    console.log(`   • Total Meetings: ${meetingCount}`);
    console.log(`   • Total Action Items: ${actionItemCount}`);
    console.log(`   • Total Indexed Vector Embeddings: ${totalChunks}\n`);

    // 2. Breakdown by Source Type
    const typeBreakdown = await db
      .select({
        sourceType: userMemoryEmbeddings.sourceType,
        count: count(),
      })
      .from(userMemoryEmbeddings)
      .groupBy(userMemoryEmbeddings.sourceType);

    console.log(`📦 MEMORY BREAKDOWN BY SOURCE TYPE:`);
    if (typeBreakdown.length === 0) {
      console.log(`   • None (No embeddings generated yet)`);
    } else {
      typeBreakdown.forEach((row) => {
        console.log(`   • ${row.sourceType}: ${row.count} chunk(s)`);
      });
    }
    console.log("");

    // 3. Find Un-indexed Meetings
    const indexedSourceIds = new Set(
      (await db.select({ sourceId: userMemoryEmbeddings.sourceId }).from(userMemoryEmbeddings)).map((r) => r.sourceId)
    );

    const unindexedMeetings = allMeetings.filter((m) => !indexedSourceIds.has(m.id));

    console.log(`🔎 MEETING MEMORY INTEGRITY AUDIT:`);
    console.log(`   • Indexed Meetings: ${meetingCount - unindexedMeetings.length} / ${meetingCount}`);
    console.log(`   • Un-indexed / Skipped Meetings: ${unindexedMeetings.length}`);

    if (unindexedMeetings.length > 0) {
      console.log(`\n⚠️ SKIPPED / UN-INDEXED MEETINGS DETECTED:`);
      unindexedMeetings.forEach((m) => {
        console.log(`   - [ID: ${m.id}] "${m.title}" (Date: ${m.date})`);
      });
      console.log(`\n👉 Run 'npm run db:seed:memory --prefix Backend' to index all missing meetings automatically.\n`);
    } else {
      console.log(`   ✅ 100% COVERAGE! Every meeting in the database has vector memory indexed.\n`);
    }

    // 4. User Coverage Report
    const allUsers = await db.select().from(users);
    console.log(`👤 USER-LEVEL MEMORY COVERAGE:`);

    for (const user of allUsers) {
      const userChunkCount = (
        await db.select({ count: count() }).from(userMemoryEmbeddings).where(eq(userMemoryEmbeddings.userId, user.id))
      )[0].count;

      const userMeetings = allMeetings.filter(
        (m) =>
          Array.isArray(m.participants) &&
          m.participants.some((p: string) => p.trim().toLowerCase() === user.email.trim().toLowerCase())
      ).length;

      const userActions = (
        await db.select({ count: count() }).from(actionItems).where(eq(actionItems.userId, user.id))
      )[0].count;

      const statusBadge =
        userChunkCount > 0 || (userMeetings === 0 && userActions === 0) ? "✅ COMPLETE" : "⚠️ MISSING MEMORY";

      console.log(
        `   [${statusBadge}] ${user.name} (${user.email}): ${userChunkCount} vector chunk(s) stored (${userMeetings} meeting(s), ${userActions} action item(s))`
      );
    }

    console.log("\n=======================================================");
    console.log("🎉 VERIFICATION COMPLETE");
    console.log("=======================================================\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error running memory verification:", error);
    process.exit(1);
  }
}

verifyMemory();
