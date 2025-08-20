// Simple Prisma seed for initial data
import { PrismaClient } from "@prisma/client";
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const phone = process.env.SEED_PHONE || "13800000000";
  const password = process.env.SEED_PASSWORD || "123456";
  const passwordHash = await bcrypt.hash(password, 10);

  let user = await prisma.user.findFirst({ where: { phone } });
  if (!user) {
    user = await prisma.user.create({
      data: { phone, passwordHash, name: "Demo" },
    });
  }

  // default prompt set & prompt
  let set = await prisma.promptSet.findFirst({ where: { userId: user.id } });
  if (!set) {
    set = await prisma.promptSet.create({
      data: { userId: user.id, title: "默认提示词集" },
    });
    await prisma.prompt.create({
      data: {
        promptSetId: set.id,
        title: "深思考模式",
        content: "请先分解问题、逐步推理再给结论。",
      },
    });
  }

  // default chat & messages
  const chat = await prisma.chat.create({
    data: { userId: user.id, title: "欢迎使用 Deepseek" },
  });
  await prisma.message.createMany({
    data: [
      {
        chatId: chat.id,
        role: "assistant",
        content: "你好，我是 DeepSeek，很高兴见到你！",
      },
      { chatId: chat.id, role: "user", content: "你好！" },
    ],
  });

  console.log("Seed completed:", { phone, password });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
