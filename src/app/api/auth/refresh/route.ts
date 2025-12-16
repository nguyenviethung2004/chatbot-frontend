export async function refreshAccessToken() {
  const refreshToken = localStorage.getItem("refresh_token")
  if (!refreshToken) throw new Error("Không có refresh token");

  const response = await fetch("https://chatbot-7-jpps.onrender.com/api/refresh", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${refreshToken}`
    }
  })

  if (!response.ok) throw new Error("Không thể làm mới token")
  const data = await response.json()

  localStorage.setItem("access_token", data.access_token)

  return data.access_token
}
