import { refreshAccessToken } from "@/app/api/auth/refresh/route";

export async function authFetch(url: string, options: any = {}) {
  let token = localStorage.getItem("access_token");

  // Kiểm tra xem body có phải FormData không
  const isFormData = options.body instanceof FormData;

  // Nếu là FormData thì KHÔNG set Content-Type (trình duyệt tự thêm boundary)
  options.headers = {
    ...options.headers,
    "Authorization": `Bearer ${token}`,
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
  };

  let res = await fetch(url, options);

  if (res.status === 401) {
    try {
      const newToken = await refreshAccessToken();
      options.headers["Authorization"] = `Bearer ${newToken}`;
      res = await fetch(url, options);
    } catch (err) {
      console.error("❌ Token refresh failed:", err);
      throw new Error("Phiên đăng nhập đã hết, vui lòng đăng nhập lại");
    }
  }

  return res;
}
