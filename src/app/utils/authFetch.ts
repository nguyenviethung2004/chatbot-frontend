"use client";

export async function authFetch(url: string, options: any = {}) {
  let token = localStorage.getItem("access_token");

  const isFormData = options.body instanceof FormData;

  options.headers = {
    ...options.headers,
    Authorization: token ? `Bearer ${token}` : "",
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
  };

  let res = await fetch(url, options);

  // ⛔ access token hết hạn
  if (res.status === 401) {
    try {
      // 👉 GỌI API ROUTE (KHÔNG import)
      const refreshRes = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include", // nếu dùng cookie
      });

      if (!refreshRes.ok) {
        throw new Error("Refresh failed");
      }

      const data = await refreshRes.json();
      const newToken = data.access_token;

      localStorage.setItem("access_token", newToken);

      // retry request
      options.headers.Authorization = `Bearer ${newToken}`;
      res = await fetch(url, options);
    } catch (err) {
      console.error("❌ Token refresh failed:", err);
      throw new Error("Phiên đăng nhập đã hết, vui lòng đăng nhập lại");
    }
  }

  return res;
}
