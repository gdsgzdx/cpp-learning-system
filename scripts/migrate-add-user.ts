/**
 * 直接给 SQLite 加列（绕开 prisma db push 的"无默认值"拦截）
 *
 * SQLite 的 ADD COLUMN 限制：
 *   - NOT NULL 列必须有 DEFAULT 值
 *   - 我们对所有列都给 NULL 允许 + UPDATE 兜底
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

interface AlterPlan {
  table: string;
  column: string;
  sqlType: string; // SQLite 类型，如 "TEXT"
  nullable: boolean;
  defaultValue?: string;
}

const PLANS: AlterPlan[] = [
  { table: "User", column: "username", sqlType: "TEXT", nullable: true },
  { table: "User", column: "passwordHash", sqlType: "TEXT", nullable: true },
  { table: "Topic", column: "userId", sqlType: "TEXT", nullable: true },
  { table: "KnowledgeCard", column: "userId", sqlType: "TEXT", nullable: true },
  { table: "LeetcodeProblem", column: "userId", sqlType: "TEXT", nullable: true },
  { table: "LearningSession", column: "userId", sqlType: "TEXT", nullable: true },
  { table: "DailyReview", column: "userId", sqlType: "TEXT", nullable: true },
  { table: "WeeklyReview", column: "userId", sqlType: "TEXT", nullable: true },
  { table: "Resource", column: "userId", sqlType: "TEXT", nullable: true },
  { table: "Project", column: "userId", sqlType: "TEXT", nullable: true },
  { table: "Tag", column: "userId", sqlType: "TEXT", nullable: true },
  { table: "AlgorithmPattern", column: "userId", sqlType: "TEXT", nullable: true },
];

async function tableHasColumn(table: string, column: string): Promise<boolean> {
  const rows: any[] = await prisma.$queryRawUnsafe(`PRAGMA table_info("${table}")`);
  return rows.some((r) => r.name === column);
}

async function addColumn(plan: AlterPlan) {
  const exists = await tableHasColumn(plan.table, plan.column);
  if (exists) {
    console.log(`  ✓ ${plan.table}.${plan.column} 已存在`);
    return;
  }
  const defaultClause = plan.defaultValue !== undefined ? ` DEFAULT ${plan.defaultValue}` : "";
  const sql = `ALTER TABLE "${plan.table}" ADD COLUMN "${plan.column}" ${plan.sqlType}${defaultClause}`;
  await prisma.$executeRawUnsafe(sql);
  console.log(`  ✅ ${plan.table}.${plan.column}`);
}

async function main() {
  console.log("→ 添加列...");
  for (const p of PLANS) {
    await addColumn(p);
  }

  // 替换旧 LeetcodeProblem 的全局唯一索引为 (userId, leetcodeNumber) 复合索引
  console.log("\n→ 检查索引...");
  const lpIndexes: any[] = await prisma.$queryRawUnsafe(`PRAGMA index_list("LeetcodeProblem")`);
  const hasOldUnique = lpIndexes.some((i) => i.unique === 1 && i.name.includes("leetcodeNumber"));
  if (hasOldUnique) {
    const idxRows: any[] = await prisma.$queryRawUnsafe(`PRAGMA index_info("LeetcodeProblem")`);
    for (const i of lpIndexes.filter((x) => x.unique === 1)) {
      const info: any[] = await prisma.$queryRawUnsafe(`PRAGMA index_info("${i.name}")`);
      const cols = info.map((c) => c.name);
      if (cols.length === 1 && cols[0] === "leetcodeNumber") {
        await prisma.$executeRawUnsafe(`DROP INDEX "${i.name}"`);
        console.log(`  ✅ 已删除旧索引 ${i.name}`);
      }
    }
  }
  // 新复合索引（Prisma 会自动管理，但这里手动建一次避免运行时报错）
  try {
    await prisma.$executeRawUnsafe(
      `CREATE UNIQUE INDEX IF NOT EXISTS "LeetcodeProblem_userId_leetcodeNumber_key" ON "LeetcodeProblem"("userId", "leetcodeNumber")`,
    );
    console.log(`  ✅ 已创建复合唯一索引 LeetcodeProblem(userId, leetcodeNumber)`);
  } catch (e: any) {
    console.log(`  ⚠️ 索引可能已存在: ${e.message?.split("\n")[0]}`);
  }
  // DailyReview
  try {
    await prisma.$executeRawUnsafe(`DROP INDEX IF EXISTS "DailyReview_date_key"`);
  } catch {}
  try {
    await prisma.$executeRawUnsafe(
      `CREATE UNIQUE INDEX IF NOT EXISTS "DailyReview_userId_date_key" ON "DailyReview"("userId", "date")`,
    );
    console.log(`  ✅ 已创建 DailyReview(userId, date) 唯一索引`);
  } catch (e: any) {
    console.log(`  ⚠️ ${e.message?.split("\n")[0]}`);
  }
  // Tag name -> (userId, name)
  try {
    const tagIndexes: any[] = await prisma.$queryRawUnsafe(`PRAGMA index_list("Tag")`);
    for (const i of tagIndexes.filter((x) => x.unique === 1)) {
      const info: any[] = await prisma.$queryRawUnsafe(`PRAGMA index_info("${i.name}")`);
      const cols = info.map((c) => c.name);
      if (cols.length === 1 && cols[0] === "name") {
        await prisma.$executeRawUnsafe(`DROP INDEX "${i.name}"`);
        console.log(`  ✅ 删除 Tag 旧唯一索引`);
      }
    }
  } catch (e: any) {
    console.log(`  ⚠️ ${e.message?.split("\n")[0]}`);
  }
  try {
    await prisma.$executeRawUnsafe(
      `CREATE UNIQUE INDEX IF NOT EXISTS "Tag_userId_name_key" ON "Tag"("userId", "name")`,
    );
    console.log(`  ✅ Tag(userId, name) 唯一索引`);
  } catch (e: any) {
    console.log(`  ⚠️ ${e.message?.split("\n")[0]}`);
  }
  // AlgorithmPattern name -> (userId, name)
  try {
    const apIndexes: any[] = await prisma.$queryRawUnsafe(`PRAGMA index_list("AlgorithmPattern")`);
    for (const i of apIndexes.filter((x) => x.unique === 1)) {
      const info: any[] = await prisma.$queryRawUnsafe(`PRAGMA index_info("${i.name}")`);
      const cols = info.map((c) => c.name);
      if (cols.length === 1 && cols[0] === "name") {
        await prisma.$executeRawUnsafe(`DROP INDEX "${i.name}"`);
        console.log(`  ✅ 删除 AlgorithmPattern 旧唯一索引`);
      }
    }
  } catch (e: any) {
    console.log(`  ⚠️ ${e.message?.split("\n")[0]}`);
  }
  try {
    await prisma.$executeRawUnsafe(
      `CREATE UNIQUE INDEX IF NOT EXISTS "AlgorithmPattern_userId_name_key" ON "AlgorithmPattern"("userId", "name")`,
    );
    console.log(`  ✅ AlgorithmPattern(userId, name) 唯一索引`);
  } catch (e: any) {
    console.log(`  ⚠️ ${e.message?.split("\n")[0]}`);
  }

  // 2. 创建/升级默认账号
  console.log("\n→ 创建默认账号...");
  const DEFAULT_USERNAME = "default";
  const DEFAULT_PASSWORD = "default123";
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  // 给所有旧 User 行填默认 username + passwordHash
  await prisma.$executeRawUnsafe(
    `UPDATE "User" SET "username" = ?, "passwordHash" = ? WHERE "username" IS NULL OR "passwordHash" IS NULL`,
    DEFAULT_USERNAME,
    passwordHash,
  );

  let defaultUser = await prisma.user.findFirst({ where: { username: DEFAULT_USERNAME } });
  if (!defaultUser) {
    defaultUser = await prisma.user.create({
      data: {
        username: DEFAULT_USERNAME,
        passwordHash,
        name: "Default User",
      },
    });
    console.log("  ✅ 创建默认账号 userId =", defaultUser.id);
  } else {
    console.log("  ✓ 默认账号已存在 userId =", defaultUser.id);
  }

  const defaultId = defaultUser.id;

  // 3. 给所有业务表 userId 回填
  console.log("\n→ 绑定现有数据到默认账号...");
  const tables = ["Topic", "KnowledgeCard", "LeetcodeProblem", "LearningSession", "DailyReview", "WeeklyReview", "Resource", "Project", "Tag", "AlgorithmPattern"];
  for (const t of tables) {
    try {
      const r: number = await prisma.$executeRawUnsafe(
        `UPDATE "${t}" SET "userId" = ? WHERE "userId" IS NULL`,
        defaultId,
      );
      if (r > 0) console.log(`  ✅ ${t}: 绑定 ${r} 行`);
      else console.log(`  · ${t}: 无需绑定`);
    } catch (e: any) {
      console.log(`  ⚠️ ${t}: ${e.message?.split("\n")[0]}`);
    }
  }

  console.log("\n========================================");
  console.log("🎉 迁移完成！");
  console.log("========================================");
  console.log("默认账号用户名: default");
  console.log("默认账号密码:   default123");
  console.log("登录后请到 /settings 改名 + 修改密码");
  console.log("========================================\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
