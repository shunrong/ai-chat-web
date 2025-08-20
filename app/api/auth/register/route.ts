import { dataSource } from "@/lib/data-source";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { phone, password, code } = await req.json();
  if (!phone || !password)
    return NextResponse.json({ message: "缺少参数" }, { status: 400 });
  // optional verify code (dev mock): if code provided, check token
  if (code) {
    const ok = await dataSource.verifyAndConsumeOtp(phone, code);
    if (!ok)
      return NextResponse.json({ message: "验证码无效" }, { status: 400 });
  }
  const exists = await dataSource.findUserByPhone(phone);
  if (exists)
    return NextResponse.json({ message: "该手机号已注册" }, { status: 409 });
  await dataSource.createUserWithPassword(phone, password);
  return NextResponse.json({ ok: true });
}
