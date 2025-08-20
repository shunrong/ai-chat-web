import { dataSource } from "@/lib/data-source";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { phone } = await req.json();
  if (!phone)
    return NextResponse.json({ message: "缺少手机号" }, { status: 400 });
  // Mock: generate 6-digit code and save as VerificationToken, expires in 10 minutes
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = new Date(Date.now() + 10 * 60 * 1000);
  await dataSource.setOtp(phone, code, expires);
  // In production, send via SMS provider
  return NextResponse.json({
    ok: true,
    code: process.env.NODE_ENV === "development" ? code : undefined,
  });
}
