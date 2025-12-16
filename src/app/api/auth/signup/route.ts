export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return Response.json({ error: "Thiếu email hoặc mật khẩu" }, { status: 400 });
    }

    // 🔥 Gọi API Flask thật
    const response = await fetch("https://chatbot-7-jpps.onrender.com/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return Response.json({ error: data.error || "Đăng ký thất bại" }, { status: response.status });
    }

    // ✅ Nếu Flask trả về message thành công
    return Response.json({
      message: data.message || "Đăng ký thành công, vui lòng đăng nhập.",
    });
  } catch (error) {
    console.error("Signup API Error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
