// src/app/api/auth/refresh/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const refreshToken = cookies().get("refresh_token")?.value;

  if (!refreshToken) {
    return NextResponse.json({}, { status: 401 });
  }

  const res = await fetch("https://chatbot-7-jpps.onrender.com/api/refresh", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${refreshToken}`,
    },
  });

  if (!res.ok) {
    return NextResponse.json({}, { status: 401 });
  }

  const data = await res.json();

  return NextResponse.json({
    access_token: data.access_token,
  });
}
