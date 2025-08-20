import bcrypt from "bcryptjs";
import { prisma as prismaClient } from "@/lib/prisma";

type Id = string;
type User = {
  id: Id;
  phone?: string | null;
  passwordHash?: string | null;
  name?: string | null;
};
type Chat = {
  id: Id;
  userId: Id;
  title: string;
  createdAt: Date;
  updatedAt: Date;
};
type Message = {
  id: Id;
  chatId: Id;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: Date;
};
type Prompt = {
  id: Id;
  userId: Id;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
};

export const dataSource = {
  isMock: false,

  // Auth & user
  async findUserByPhone(phone: string): Promise<User | null> {
    const u = await prismaClient.user.findFirst({ where: { phone } });
    return u as any;
  },

  async createUserWithPassword(phone: string, password: string): Promise<User> {
    const passwordHash = await bcrypt.hash(password, 10);
    const u = await prismaClient.user.create({ data: { phone, passwordHash } });
    return u as any;
  },

  async upsertUserByPhone(phone: string): Promise<User> {
    const u = await prismaClient.user.upsert({
      where: { phone: phone || "_" },
      update: {},
      create: { phone },
    });
    return u as any;
  },

  async setOtp(phone: string, code: string, expires: Date) {
    await prismaClient.verificationToken.upsert({
      where: { identifier_token: { identifier: phone, token: code } },
      update: { expires },
      create: { identifier: phone, token: code, expires },
    });
  },

  async verifyAndConsumeOtp(phone: string, code: string): Promise<boolean> {
    const token = await prismaClient.verificationToken.findFirst({
      where: { identifier: phone, token: code, expires: { gt: new Date() } },
    });
    if (!token) return false;
    await prismaClient.verificationToken.delete({
      where: { identifier_token: { identifier: phone, token: code } },
    });
    return true;
  },

  // Chats
  async listChats(userId: string): Promise<Array<Pick<Chat, "id" | "title">>> {
    const items = await prismaClient.chat.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      select: { id: true, title: true },
    });
    return items as any;
  },

  async createChat(userId: string): Promise<{ id: string }> {
    const chat = await prismaClient.chat.create({
      data: { userId, title: "新对话" },
    });
    return { id: chat.id };
  },

  async getChatMessages(userId: string, chatId: string): Promise<Message[]> {
    const chat = await prismaClient.chat.findFirst({
      where: { id: chatId, userId },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });
    return (chat?.messages as any) || [];
  },

  async addUserMessage(
    userId: string,
    chatId: string,
    content: string
  ): Promise<{ user: Message; assistant: Message }> {
    const replyContent = `已收到：${content}`;
    const chat = await prismaClient.chat.findFirst({
      where: { id: chatId, userId },
    });
    if (!chat) throw new Error("Not Found");
    const msg = await prismaClient.message.create({
      data: { chatId: chat.id, role: "user", content },
    });
    const reply = await prismaClient.message.create({
      data: { chatId: chat.id, role: "assistant", content: replyContent },
    });
    await prismaClient.chat.update({
      where: { id: chat.id },
      data: {
        updatedAt: new Date(),
        title: msg.content.slice(0, 20) || chat.title,
      },
    });
    return { user: msg as any, assistant: reply as any };
  },

  // New granular APIs for streaming workflows
  async createUserMessage(
    userId: string,
    chatId: string,
    content: string
  ): Promise<Message> {
    const chat = await prismaClient.chat.findFirst({
      where: { id: chatId, userId },
    });
    if (!chat) throw new Error("Not Found");
    const msg = await prismaClient.message.create({
      data: { chatId: chat.id, role: "user", content },
    });
    await prismaClient.chat.update({
      where: { id: chat.id },
      data: {
        updatedAt: new Date(),
        title: msg.content.slice(0, 20) || chat.title,
      },
    });
    return msg as any;
  },

  async createAssistantMessage(
    userId: string,
    chatId: string,
    content: string
  ): Promise<Message> {
    const chat = await prismaClient.chat.findFirst({
      where: { id: chatId, userId },
    });
    if (!chat) throw new Error("Not Found");
    const msg = await prismaClient.message.create({
      data: { chatId: chat.id, role: "assistant", content },
    });
    await prismaClient.chat.update({
      where: { id: chat.id },
      data: { updatedAt: new Date() },
    });
    return msg as any;
  },

  // Prompts
  async listPrompts(userId: string): Promise<Prompt[]> {
    const sets = await prismaClient.promptSet.findMany({
      where: { userId },
      include: { prompts: true },
      orderBy: { updatedAt: "desc" },
    });
    return sets.flatMap((s) =>
      s.prompts.map(
        (p) =>
          ({
            id: p.id,
            userId,
            title: p.title,
            content: p.content,
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
          } as Prompt)
      )
    );
  },

  async addPrompt(
    userId: string,
    title: string,
    content: string
  ): Promise<Prompt> {
    let set = await prismaClient.promptSet.findFirst({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });
    if (!set)
      set = await prismaClient.promptSet.create({
        data: { userId, title: "默认提示词集" },
      });
    const item = await prismaClient.prompt.create({
      data: { promptSetId: set.id, title, content },
    });
    return {
      id: item.id,
      userId,
      title: item.title,
      content: item.content,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  },
};
