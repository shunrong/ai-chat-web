import { dataSource } from "@/lib/data-source";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { phone } = await req.json();
  if (!phone)
    return NextResponse.json({ message: "缺少手机号" }, { status: 400 });

  try {
    // 获取或创建验证码（复用已有的未过期验证码）
    const { code, isNew } = await dataSource.getOrCreateOtp(phone);

    // 这里可以添加短信发送逻辑
    return NextResponse.json({
      ok: true,
      code,
      message: isNew ? "验证码已发送" : "验证码已重新发送",
    });
  } catch (error) {
    console.error("发送验证码失败:", error);
    return NextResponse.json(
      { message: "发送验证码失败，请稍后重试" },
      { status: 500 }
    );
  }
}
