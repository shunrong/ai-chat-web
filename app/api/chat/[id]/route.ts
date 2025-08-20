import { dataSource } from "@/lib/data-source";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return new NextResponse("Unauthorized", { status: 401 });
  const messages = await dataSource.getChatMessages(
    session.user.id as string,
    params.id
  );
  if (!messages) return new NextResponse("Not Found", { status: 404 });
  return NextResponse.json({ messages });
}
