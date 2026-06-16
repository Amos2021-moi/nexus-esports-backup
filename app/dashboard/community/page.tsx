"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Heart, MessageCircle, Send, Image as ImageIcon, X, Trophy, Shield, Calendar } from "lucide-react"
import toast from "react-hot-toast"

interface Post {
  id: string
  content: string
  image: string | null
  type: string
  likes: number
  createdAt: string
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
  const [posting, setPosting] = useState(false)
  const [commenting, setCommenting] = useState<string | null>(null)
  const [commentText, setCommentText] = useState("")
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchPosts()
  }, [])

  async function fetchPosts() {
    const res = await fetch("/api/community/posts")
    const data = await res.json()
    setPosts(Array.isArray(data) ? data : [])
    setLoading(false)
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
        type: "GENERAL"
      })
    })

    if (res.ok) {
      toast.success("Post shared!")
      setNewPost("")
      setNewPostImage(null)
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

  async function handleComment(postId: string) {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading community feed...</div>
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
          
          <div className="flex justify-between items-center">
            <label className="cursor-pointer text-gray-400 hover:text-white transition-colors">
              <ImageIcon size={20} />
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
            <button
              type="submit"
              disabled={posting || !newPost.trim()}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-all"
            >
              {posting ? "Posting..." : "Post"}
            </button>
          </div>
        </form>
      </div>

      {/* Posts Feed */}
      {posts.length === 0 ? (
        <div className="text-center py-12 bg-gray-800 rounded-xl border border-gray-700">
          <MessageCircle className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Posts Yet</h3>
          <p className="text-gray-400">Be the first to share something with the community!</p>
        </div>
      ) : (
        posts.map((post) => {
          const username = post.user.profile?.username || post.user.name || "Player"
          const isLiked = likedPosts.has(post.id)
          
          return (
            <div key={post.id} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
              {/* Post Header */}
              <div className="p-4 border-b border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                    {username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{username}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(post.createdAt).toLocaleDateString()} at {new Date(post.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Post Content */}
              <div className="p-4">
                <p className="text-gray-200 whitespace-pre-wrap">{post.content}</p>
                {post.image && (
                  <img src={post.image} alt="Post" className="mt-3 rounded-lg max-h-96 w-full object-contain" />
                )}
              </div>
              
              {/* Post Actions */}
              <div className="px-4 pb-3 flex gap-4 border-b border-gray-700">
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
                  onClick={() => setCommenting(commenting === post.id ? null : post.id)}
                  className="flex items-center gap-2 text-sm text-gray-400 hover:text-indigo-400 transition-colors"
                >
                  <MessageCircle size={18} />
                  <span>{post._count.comments} comments</span>
                </button>
              </div>
              
              {/* Comments Section */}
              {commenting === post.id && (
                <div className="p-4 bg-gray-700/30">
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
                </div>
              )}
              
              {/* Comments List */}
              {post.comments.length > 0 && (
                <div className="p-4 space-y-3 bg-gray-750">
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