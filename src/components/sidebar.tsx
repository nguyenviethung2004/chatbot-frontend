"use client"

import { authFetch } from "@/app/utils/authFetch"
import { Button } from "@/components/ui/button"
import type { Conversation } from "@/types/chat"
import { ChevronLeft, LogOut, Menu, Plus, Search, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"

interface SidebarProps {
  // Optional legacy props for compatibility with ChatPage
  conversations?: unknown
  activeConversationId?: string
  onSelectConversation?: (id: string) => void
  onNewChat?: () => void
  onDeleteConversation?: (id: string) => void
  onRenameConversation?: (id: string, newTitle: string) => void
  // Current props in use
  onLogout: () => void
  user: { id: string; email: string } | null
  isOpen: boolean
  onToggle: () => void
}

export default function Sidebar({
  onLogout,
  user,
  isOpen,
  onToggle,
  activeConversationId,
  onSelectConversation,
}: SidebarProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingTitle, setEditingTitle] = useState("")
  const [loading, setLoading] = useState(true)
  const [activeId, setActiveId] = useState<string>("") // ✅ tự quản lý conversation đang active
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)

  // Sync from parent if provided
  useEffect(() => {
    if (activeConversationId) {
      setActiveId(String(activeConversationId))
    }
  }, [activeConversationId])

  // ✅ Load danh sách conversation
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await authFetch("/api/chat/conversations", { method: "GET" })
        const data = await res.json()

        if (!res.ok) {
          console.error("⚠️ Lỗi khi load đoạn chat:", data.error)
          setConversations([])
        } else {
          const items = Array.isArray(data.conversations) ? data.conversations : []
          const normalized = items.map((c: any) => ({
            ...c,
            conversationID: Number(c?.conversationID ?? c?.id ?? c?.conversation_id),
            title: String(c?.title ?? "Đoạn chat mới"),
          }))
          setConversations(normalized)
        }
      } catch (error) {
        console.error("❌ Không thể kết nối server:", error)
        setConversations([])
      } finally {
        setLoading(false)
      }
    }

    fetchConversations()
  }, [])

  // ✅ Lọc theo từ khóa
  const filteredConversations = conversations.filter((conv) =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // ✅ Tạo đoạn chat mới
  const handleNewChatClick = async () => {
    try {
      const res = await authFetch("/api/chat/conversations/new", {
        method: "POST",
        body: JSON.stringify({ title: "Đoạn chat mới" }),
      })

      const data = await res.json()

      if (!res.ok) {
        alert(`⚠️ ${data.error || "Không thể tạo đoạn chat mới"}`)
        return
      }

      const newConv = {
        conversationID: data.conversation_id,
        userID: user?.id ? Number(user.id) : 0,
        title: data.title,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [],        // ✅ thêm mặc định
        documentIds: [],     // ✅ thêm mặc định
      }

      setConversations((prev) => [newConv, ...prev])
      setActiveId(String(newConv.conversationID)) // ✅ chọn luôn đoạn mới tạo
    } catch (error) {
      console.error("❌ Lỗi khi tạo đoạn chat:", error)
      alert("Không thể kết nối server")
    }
  }

  // ✅ Đổi tên
  const handleSaveRename = async (id: number) => {
    const title = editingTitle.trim()
    if (!title) {
      setEditingId(null)
      setEditingTitle("")
      return
    }
    try {
      const res = await authFetch(`/api/chat/rename-conversation`, {
        method: "POST",
        body: JSON.stringify({ conversationId: id, newTitle: title }),
      })
      const data = await res.json()
      if (!res.ok) {
        alert(`⚠️ ${data?.error || "Không thể đổi tên"}`)
        return
      }
      setConversations((prev) => prev.map((c) => (c.conversationID === id ? { ...c, title } : c)))
    } catch (err) {
      console.error("❌ Lỗi đổi tên:", err)
      alert("Không thể kết nối server")
    } finally {
      setEditingId(null)
      setEditingTitle("")
    }
  }

  const handleCancelRename = () => {
    setEditingId(null)
    setEditingTitle("")
  }

  const handleDoubleClick = (conv: Conversation) => {
    setEditingId(conv.conversationID)
    setEditingTitle(conv.title)
  }

  const handleDeleteConversation = (id: number) => {
    if (!confirm("🗑️ Xóa đoạn chat này?")) return
      ; (async () => {
        try {
          const res = await authFetch(`/api/chat/conversations/${id}`, { method: "DELETE" })
          const data = await res.json().catch(() => ({}))
          if (!res.ok) {
            alert(`⚠️ ${data?.error || "Không thể xóa đoạn chat"}`)
            return
          }
          setConversations((prev) => prev.filter((c) => c.conversationID !== id))
          if (String(id) === activeId) setActiveId("")
        } catch (err) {
          console.error("❌ Lỗi xóa đoạn chat:", err)
          alert("Không thể kết nối server")
        }
      })()
  }

  // ✅ Khi click vào 1 đoạn chat
  const handleSelectConversation = (id: number) => {
    const idStr = String(id)
    setActiveId(idStr)
    onSelectConversation?.(idStr)
  }

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const handleConfirmLogout = () => {
    setShowLogoutDialog(false);
    handleLogout();
  };

  const handleCancelLogout = () => {
    setShowLogoutDialog(false);
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        // Nếu không có token, vẫn xóa localStorage và chuyển về trang chủ
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("isAuthenticated");
        localStorage.removeItem("user");
        window.location.href = "/";
        return;
      }

      // Sử dụng authFetch để tự động refresh token nếu hết hạn
      const res = await authFetch("/api/auth/logout", {
        method: "POST",
      });

      const data = await res.json();

      if (res.ok) {
        // Xóa tất cả thông tin trong localStorage
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("isAuthenticated");
        localStorage.removeItem("user");

        window.location.href = "/";
      } else {
        alert(`⚠️ Lỗi đăng xuất: ${data.error || "Không xác định"}`);
        // Vẫn xóa token local nếu có lỗi từ server
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("isAuthenticated");
        localStorage.removeItem("user");
        window.location.href = "/";
      }
    } catch (err: any) {
      console.error("❌ Lỗi đăng xuất:", err);
      // Nếu refresh token thất bại, vẫn xóa token và đăng xuất
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("user");
      alert(err.message || "❌ Lỗi kết nối server. Đã xóa session local.");
      window.location.href = "/";
    }
  };

  // ✅ Hiển thị loading
  if (loading) {
    return (
      <div className="w-64 h-screen bg-slate-800 text-slate-400 flex items-center justify-center">
        Đang tải đoạn chat...
      </div>
    )
  }

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={onToggle}
        className="fixed top-4 left-4 z-50 md:hidden bg-slate-800 p-2 rounded-lg text-white"
      >
        <Menu size={20} />
      </button>

      {/* Sidebar */}
      <aside
        className={`${isOpen ? "translate-x-0" : "-translate-x-full"
          } fixed md:relative md:translate-x-0 transition-transform duration-300 z-40 w-64 h-screen bg-slate-800 border-r border-slate-700 flex flex-col`}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          <Button
            onClick={handleNewChatClick}
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white flex items-center gap-2"
          >
            <Plus size={18} />
            <span>Đoạn chat mới</span>
          </Button>
          <button
            onClick={onToggle}
            className="ml-2 p-2 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white"
            title="Thu vào"
          >
            <ChevronLeft size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-slate-700">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm đoạn chat"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-700 text-white placeholder-slate-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-2">
            {filteredConversations.length === 0 ? (
              <p className="text-slate-400 text-sm p-4">
                Không có đoạn chat nào
              </p>
            ) : (
              filteredConversations.map((conv) => (
                <div
                  key={conv.conversationID}
                  className={`group flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors ${activeId === String(conv.conversationID)
                    ? "bg-slate-700 text-white"
                    : "text-slate-300 hover:bg-slate-700"
                    }`}
                  onClick={() => handleSelectConversation(conv.conversationID)}
                >
                  {editingId === conv.conversationID ? (
                    <input
                      type="text"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveRename(conv.conversationID)
                        else if (e.key === "Escape") handleCancelRename()
                      }}
                      onClick={(e) => e.stopPropagation()}
                      autoFocus
                      className="flex-1 bg-slate-600 text-white rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                  ) : (
                    <span
                      className="flex-1 truncate text-sm"
                      onDoubleClick={(e) => {
                        e.stopPropagation()
                        handleDoubleClick(conv)
                      }}
                    >
                      {conv.title}
                    </span>
                  )}

                  {editingId === conv.conversationID ? (
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSaveRename(conv.conversationID)
                        }}
                        className="text-emerald-400 hover:text-emerald-300 text-xs font-semibold"
                      >
                        ✓
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCancelRename()
                        }}
                        className="text-red-400 hover:text-red-300 text-xs font-semibold"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteConversation(conv.conversationID)
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2
                        size={16}
                        className="text-slate-400 hover:text-red-400"
                      />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* User Section */}
        <div className="border-t border-slate-700 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-slate-900 font-bold text-xs">
                  {user?.email?.[0].toUpperCase()}
                </span>
              </div>
              <span className="text-sm text-slate-300 truncate min-w-0">
                {user?.email}
              </span>
            </div>
          </div>
          <Button
            onClick={handleLogoutClick}
            variant="outline"
            className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 flex items-center gap-2 bg-transparent"
          >
            <LogOut size={16} />
            <span>Đăng xuất</span>
          </Button>
        </div>
      </aside>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={onToggle}
        />
      )}

      {/* Logout Confirmation Dialog */}
      {showLogoutDialog && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-2xl p-8 max-w-md w-full mx-4 border border-slate-700 shadow-xl">
            <h2 className="text-2xl font-bold text-white mb-4">
              Bạn có chắc muốn đăng xuất không?
            </h2>
            <p className="text-slate-300 mb-6">
              Đăng xuất khỏi tài khoản {user?.email || ""} trên ChatVipPro?
            </p>
            <div className="flex flex-col gap-3">
              <Button
                onClick={handleConfirmLogout}
                className="w-full bg-white text-slate-900 hover:bg-slate-100 font-medium py-2.5 rounded-lg"
              >
                Đăng xuất
              </Button>
              <Button
                onClick={handleCancelLogout}
                variant="outline"
                className="w-full border-slate-600 bg-slate-800 text-white hover:bg-slate-700 font-medium py-2.5 rounded-lg"
              >
                Hủy
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
