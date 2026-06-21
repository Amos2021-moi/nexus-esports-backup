"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Heart, MessageCircle, Send, Image as ImageIcon, X, Trophy, Shield, Calendar, Trash2, Edit2, Flag, Pin, Filter, EyeOff } from "lucide-react"
import toast from "react-hot-toast"
import { SkeletonCommunityPost, Skeleton } from "@/components/ui/Skeleton"

interface Post {
  id: string
  content: string
  image: string | null
  type: string
  likes: number
  createdAt: string
  userId: string
  user: {
    name: string
    profile: { username: string } | null
  }
  comments: Comment[]
  _count: { comments: number }
}

interface Comment {
  id: string
  content: string
  createdAt: string
  user: {
    name: string
    profile: { username: string } | null
  }
}

export default function CommunityPage() {
  const { data: session } = useSession()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [newPost, setNewPost] = useState("")
  const [newPostImage, setNewPostImage] = useState<string | null>(null)
  const [newPostType, setNewPostType] = useState<string>("GENERAL")
  const [posting, setPosting] = useState(false)
  const [commenting, setCommenting] = useState<string | null>(null)
  const [commentText, setCommentText] = useState("")
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set())
  const [editingPost, setEditingPost] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")
  const [filterType, setFilterType] = useState<string>("ALL")
  const [privacySettings, setPrivacySettings] = useState<{ allowComments: boolean }>({ allowComments: true })

  useEffect(() => {
    fetchPosts()
    fetchPrivacySettings()
  }, [])

  async function fetchPosts() {
    const res = await fetch("/api/community/posts")
    const data = await res.json()
    setPosts(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  async function fetchPrivacySettings() {
    try {
      const res = await fetch("/api/settings?category=privacy")
      if (res.ok) {
        const data = await res.json()
        setPrivacySettings({
          allowComments: data.allowComments !== undefined ? data.allowComments : true
        })
      }
    } catch (error) {
      console.error("Error fetching privacy settings:", error)
    }
  }

  async function handleCreatePost(e: React.FormEvent) {
    e.preventDefault()
    if (!newPost.trim()) {
      toast.error("Please enter some content")
      return
    }

    setPosting(true)
    const res = await fetch("/api/community/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: newPost,
        image: newPostImage,
        type: newPostType
      })
    })

    if (res.ok) {
      toast.success("Post shared!")
      setNewPost("")
      setNewPostImage(null)
      setNewPostType("GENERAL")
      fetchPosts()
    } else {
      toast.error("Failed to post")
    }
    setPosting(false)
  }

  async function handleLike(postId: string) {
    const res = await fetch("/api/community/like", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId })
    })

    if (res.ok) {
      const data = await res.json()
      if (data.liked) {
        setLikedPosts(prev => new Set(prev).add(postId))
      } else {
        setLikedPosts(prev => {
          const next = new Set(prev)
          next.delete(postId)
          return next
        })
      }
      fetchPosts()
    }
  }

  // ✅ Phase 1: Check if commenting is allowed
  async function handleComment(postId: string) {
    if (!privacySettings.allowComments) {
      toast.error("Comments are disabled for this post")
      return
    }

    if (!commentText.trim()) {
      toast.error("Please enter a comment")
      return
    }

    const res = await fetch("/api/community/comment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        postId,
        content: commentText
      })
    })

    if (res.ok) {
      toast.success("Comment added!")
      setCommentText("")
      setCommenting(null)
      fetchPosts()
    } else {
      toast.error("Failed to add comment")
    }
  }

  async function handleDeletePost(postId: string) {
    if (!confirm("Are you sure you want to delete this post?")) return

    try {
      const res = await fetch(`/api/community/posts?id=${postId}`, {
        method: "DELETE"
      })

      if (res.ok) {
        toast.success("Post deleted")
        fetchPosts()
      } else {
        toast.error("Failed to delete post")
      }
    } catch (error) {
      console.error("Error deleting post:", error)
      toast.error("Failed to delete post")
    }
  }

  async function handleEditPost(postId: string) {
    if (!editContent.trim()) {
      toast.error("Please enter some content")
      return
    }

    try {
      const res = await fetch(`/api/community/posts/${postId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editContent })
      })

      if (res.ok) {
        toast.success("Post updated!")
        setEditingPost(null)
        setEditContent("")
        fetchPosts()
      } else {
        toast.error("Failed to update post")
      }
    } catch (error) {
      console.error("Error editing post:", error)
      toast.error("Failed to update post")
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be less than 2MB")
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setNewPostImage(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  // Filter posts by type
  const filteredPosts = filterType === "ALL" 
    ? posts 
    : posts.filter(post => post.type === filterType)

  // Check if user can comment on a post
  const canComment = privacySettings.allowComments || false

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <Skeleton variant="text" className="w-48 h-8" />
          <Skeleton variant="text" className="w-64 h-4 mt-1" />
        </div>
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
          <Skeleton variant="text" className="w-full h-20" />
          <div className="flex justify-between items-center mt-3">
            <Skeleton variant="text" className="w-24 h-4" />
            <Skeleton variant="text" className="w-16 h-8" />
          </div>
        </div>
        {[...Array(3)].map((_, i) => (
          <SkeletonCommunityPost key={i} />
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Community Feed</h1>
        <p className="text-gray-400 mt-1">Share updates, celebrate achievements, and connect with players</p>
      </div>

      {/* ✅ Privacy Warning - Show if comments are disabled */}
      {!privacySettings.allowComments && (
        <div className="bg-yellow-500/10 rounded-xl border border-yellow-500/20 p-4">
          <div className="flex items-start gap-3">
            <EyeOff className="h-5 w-5 text-yellow-400 mt-0.5" />
            <div>
              <h3 className="text-yellow-400 font-semibold">Comments are Disabled</h3>
              <p className="text-gray-300 text-sm">
                Comments on your posts are currently disabled. You can change this in your 
                <a href="/dashboard/settings/privacy" className="text-indigo-400 hover:underline ml-1">Privacy Settings</a>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Create Post */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
        <form onSubmit={handleCreatePost} className="space-y-3">
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="Share something with the community..."
            rows={3}
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
          />
          
          {newPostImage && (
            <div className="relative inline-block">
              <img src={newPostImage} alt="Preview" className="h-24 w-auto rounded-lg" />
              <button
                type="button"
                onClick={() => setNewPostImage(null)}
                className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"
              >
                <X size={14} className="text-white" />
              </button>
            </div>
          )}
          
          <div className="flex flex-wrap items-center gap-3">
            <label className="cursor-pointer text-gray-400 hover:text-white transition-colors">
              <ImageIcon size={20} />
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
            
            <select
              value={newPostType}
              onChange={(e) => setNewPostType(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="GENERAL">General</option>
              <option value="SQUAD_SHARE">Squad Share</option>
              <option value="ACHIEVEMENT">Achievement</option>
            </select>

            <button
              type="submit"
              disabled={posting || !newPost.trim()}
              className="ml-auto bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-all"
            >
              {posting ? "Posting..." : "Post"}
            </button>
          </div>
        </form>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterType("ALL")}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
            filterType === "ALL" 
              ? "bg-indigo-600 text-white" 
              : "bg-gray-700 text-gray-400 hover:text-white"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilterType("GENERAL")}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
            filterType === "GENERAL" 
              ? "bg-indigo-600 text-white" 
              : "bg-gray-700 text-gray-400 hover:text-white"
          }`}
        >
          General
        </button>
        <button
          onClick={() => setFilterType("SQUAD_SHARE")}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
            filterType === "SQUAD_SHARE" 
              ? "bg-indigo-600 text-white" 
              : "bg-gray-700 text-gray-400 hover:text-white"
          }`}
        >
          Squad Shares
        </button>
        <button
          onClick={() => setFilterType("ACHIEVEMENT")}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
            filterType === "ACHIEVEMENT" 
              ? "bg-indigo-600 text-white" 
              : "bg-gray-700 text-gray-400 hover:text-white"
          }`}
        >
          Achievements
        </button>
      </div>

      {/* Posts Feed */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-12 bg-gray-800 rounded-xl border border-gray-700">
          <MessageCircle className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Posts Yet</h3>
          <p className="text-gray-400">Be the first to share something with the community!</p>
        </div>
      ) : (
        filteredPosts.map((post) => {
          const username = post.user.profile?.username || post.user.name || "Player"
          const isLiked = likedPosts.has(post.id)
          const isOwnPost = post.userId === session?.user?.id
          const postTypeColors = {
            GENERAL: "bg-blue-500/20 text-blue-400",
            SQUAD_SHARE: "bg-purple-500/20 text-purple-400",
            ACHIEVEMENT: "bg-yellow-500/20 text-yellow-400"
          }
          
          return (
            <div key={post.id} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
              {/* Post Header */}
              <div className="p-4 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                      {username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{username}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-gray-500">
                          {new Date(post.createdAt).toLocaleDateString()} at {new Date(post.createdAt).toLocaleTimeString()}
                        </p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${postTypeColors[post.type as keyof typeof postTypeColors] || "bg-gray-500/20 text-gray-400"}`}>
                          {post.type.replace("_", " ")}
                        </span>
                      </div>
                    </div>
                  </div>
                  {isOwnPost && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingPost(post.id)
                          setEditContent(post.content)
                        }}
                        className="text-gray-400 hover:text-blue-400 transition-all"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="text-gray-400 hover:text-red-400 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Post Content */}
              <div className="p-4">
                {editingPost === post.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={3}
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditPost(post.id)}
                        className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-indigo-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingPost(null)}
                        className="bg-gray-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-gray-500"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-gray-200 whitespace-pre-wrap">{post.content}</p>
                    {post.image && (
                      <img src={post.image} alt="Post" className="mt-3 rounded-lg max-h-96 w-full object-contain" />
                    )}
                  </>
                )}
              </div>
              
              {/* Post Actions */}
              <div className="px-4 pb-3 flex flex-wrap gap-4 border-b border-gray-700">
                <button
                  onClick={() => handleLike(post.id)}
                  className={`flex items-center gap-2 text-sm transition-colors ${
                    isLiked ? "text-red-500" : "text-gray-400 hover:text-red-500"
                  }`}
                >
                  <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
                  <span>{post.likes} likes</span>
                </button>
                <button
                  onClick={() => {
                    // ✅ Only allow if comments are enabled
                    if (!privacySettings.allowComments) {
                      toast.error("Comments are disabled for this post")
                      return
                    }
                    setCommenting(commenting === post.id ? null : post.id)
                  }}
                  className={`flex items-center gap-2 text-sm transition-colors ${
                    privacySettings.allowComments 
                      ? "text-gray-400 hover:text-indigo-400" 
                      : "text-gray-600 cursor-not-allowed"
                  }`}
                >
                  <MessageCircle size={18} />
                  <span>{post._count.comments} comments</span>
                </button>
                <button
                  className="flex items-center gap-2 text-sm text-gray-400 hover:text-yellow-400 transition-colors"
                >
                  <Flag size={16} />
                  <span>Report</span>
                </button>
              </div>
              
              {/* Comments Section - ✅ Only show if comments are allowed */}
              {commenting === post.id && (
                <div className="p-4 bg-gray-700/30">
                  {canComment ? (
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Write a comment..."
                        className="flex-1 p-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
                      />
                      <button
                        onClick={() => handleComment(post.id)}
                        className="bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 transition-all"
                      >
                        <Send size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-2 text-gray-400 text-sm flex items-center justify-center gap-2">
                      <EyeOff size={16} />
                      Comments are disabled
                    </div>
                  )}
                </div>
              )}
              
              {/* Comments List - ✅ Only show if comments exist */}
              {post.comments.length > 0 && (
                <div className="p-4 space-y-3 bg-gray-700/20">
                  {post.comments.map((comment) => (
                    <div key={comment.id} className="flex gap-2">
                      <div className="h-6 w-6 rounded-full bg-gray-600 flex items-center justify-center text-white text-xs font-bold">
                        {(comment.user.profile?.username?.charAt(0) || comment.user.name?.charAt(0) || "U").toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm">
                          <span className="font-semibold text-white">
                            {comment.user.profile?.username || comment.user.name || "Player"}
                          </span>
                          <span className="text-gray-300 ml-2">{comment.content}</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })
      )}
    </div>
  )
}