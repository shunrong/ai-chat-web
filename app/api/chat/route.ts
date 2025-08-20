import { dataSource } from "@/lib/data-source";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ items: [] });
  const items = await dataSource.listChats(session.user.id as string);
  return NextResponse.json({ items });
}

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return new NextResponse("Unauthorized", { status: 401 });
  const chat = await dataSource.createChat(session.user.id as string);
  return NextResponse.json({ id: chat.id });
}
