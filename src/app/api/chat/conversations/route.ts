import { NextResponse } from "next/server"
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    // Lấy token từ header client gửi lên
    const authHeader = request.headers.get("Authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Thiếu hoặc sai token" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]

    // Gọi Flask API để lấy danh sách conversations
    const flaskRes = await fetch("https://chatbot-7-jpps.onrender.com//api/conversations", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    })

    const data = await flaskRes.json()

    if (!flaskRes.ok) {
      return NextResponse.json(
        { error: data.error || "Failed to fetch conversations" },
        { status: flaskRes.status }
      )
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error("❌ Error fetching conversations:", error)
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    )
  }
}
