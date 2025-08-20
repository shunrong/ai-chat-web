import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ items: [] });
  const sets = await prisma.promptSet.findMany({
    where: { userId: session.user.id as string },
    include: { prompts: true },
    orderBy: { updatedAt: "desc" },
  });
  const items = sets.flatMap((s) =>
    s.prompts.map((p) => ({ id: p.id, title: p.title, content: p.content }))
  );
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return new NextResponse("Unauthorized", { status: 401 });
  const { title, content } = await req.json();
  if (!title || !content)
    return new NextResponse("Bad Request", { status: 400 });
  // create default set if not exists
  let set = await prisma.promptSet.findFirst({
    where: { userId: session.user.id as string },
    orderBy: { createdAt: "asc" },
  });
  if (!set)
    set = await prisma.promptSet.create({
      data: { userId: session.user.id as string, title: "默认提示词集" },
    });
  const item = await prisma.prompt.create({
    data: { promptSetId: set.id, title, content },
  });
  return NextResponse.json({ item });
}
