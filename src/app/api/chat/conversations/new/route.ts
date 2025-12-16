import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Thiếu hoặc sai token" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const body = await request.json().catch(() => ({}));
    const title = body.title || "Đoạn chat mới";

    // 👉 Gửi sang Flask
    const flaskRes = await fetch("https://chatbot-7-jpps.onrender.com/api/conversations/new", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ title }),
    });

    const data = await flaskRes.json();

    if (!flaskRes.ok) {
      return NextResponse.json(
        { error: data.error || "Failed to create conversation" },
        { status: flaskRes.status }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("❌ Error creating conversation:", error);
    return NextResponse.json(
      { error: "Failed to create conversation" },
      { status: 500 }
    );
  }
}
