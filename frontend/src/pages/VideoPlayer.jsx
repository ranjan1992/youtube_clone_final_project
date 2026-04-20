import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import API from '../utils/api.js'
import './VideoPlayer.css'

const VideoPlayer = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [video, setVideo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [commentText, setCommentText] = useState('')
  const [editingComment, setEditingComment] = useState(null)
  const [editText, setEditText] = useState('')
  const [liked, setLiked] = useState(false)
  const [disliked, setDisliked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [dislikeCount, setDislikeCount] = useState(0)

  useEffect(() => {
    fetchVideo()
  }, [id])

  const fetchVideo = async () => {
    setLoading(true)
    try {
      const res = await API.get(`/videos/${id}`)
      const v = res.data.data
      setVideo(v)
      setLikeCount(v.likes?.length || 0)
      setDislikeCount(v.dislikes?.length || 0)
      if (user) {
        setLiked(v.likes?.includes(user._id))
        setDisliked(v.dislikes?.includes(user._id))
      }
    } catch {
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async () => {
    if (!user) return navigate('/login')
    try {
      const res = await API.post(`/videos/${id}/like`)
      setLikeCount(res.data.likes)
      setDislikeCount(res.data.dislikes)
      setLiked(prev => !prev)
      setDisliked(false)
    } catch (err) {
      console.error(err)
    }
  }

  const handleDislike = async () => {
    if (!user) return navigate('/login')
    try {
      const res = await API.post(`/videos/${id}/dislike`)
      setLikeCount(res.data.likes)
      setDislikeCount(res.data.dislikes)
      setDisliked(prev => !prev)
      setLiked(false)
    } catch (err) {
      console.error(err)
    }
  }

  const handleAddComment = async e => {
    e.preventDefault()
    if (!user) return navigate('/login')
    if (!commentText.trim()) return
    try {
      const res = await API.post(`/comments/${id}`, { text: commentText })
      setVideo(prev => ({
        ...prev,
        comments: [...(prev.comments || []), res.data.data]
      }))
      setCommentText('')
    } catch (err) {
      console.error(err)
    }
  }

  const handleEditComment = async commentId => {
    try {
      await API.put(`/comments/${id}/${commentId}`, { text: editText })
      setVideo(prev => ({
        ...prev,
        comments: prev.comments.map(c =>
          c._id === commentId ? { ...c, text: editText } : c
        )
      }))
      setEditingComment(null)
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeleteComment = async commentId => {
    if (!window.confirm('Delete this comment?')) return
    try {
      await API.delete(`/comments/${id}/${commentId}`)
      setVideo(prev => ({
        ...prev,
        comments: prev.comments.filter(c => c._id !== commentId)
      }))
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) return <div className='spinner' style={{ marginTop: 100 }} />
  if (!video) return <p>Video not found.</p>

  const channelName = video.channelId?.channelName || 'Unknown Channel'

  return (
    <div className='player-page'>
      <div className='player-main'>
        {/* Video Player */}
        <div className='player-wrap'>
          <video
            src={video.videoUrl}
            controls
            className='player-video'
            poster={video.thumbnailUrl}
          >
            Your browser does not support the video tag.
          </video>
        </div>

        <h1 className='player-title'>{video.title}</h1>

        {/* Channel + Actions */}
        <div className='player-meta'>
          <div className='player-channel'>
            <div className='avatar-circle'>{channelName.charAt(0)}</div>
            <div>
              <p className='channel-name'>{channelName}</p>
              <p className='sub-count'>
                {video.channelId?.subscribers || 0} subscribers
              </p>
            </div>
          </div>

          <div className='player-actions'>
            <button
              className={`action-btn ${liked ? 'action-btn--active' : ''}`}
              onClick={handleLike}
            >
              👍 {likeCount}
            </button>
            <button
              className={`action-btn ${disliked ? 'action-btn--active' : ''}`}
              onClick={handleDislike}
            >
              👎 {dislikeCount}
            </button>
          </div>
        </div>

        {/* Description */}
        <div className='player-description'>
          <p>{video.views?.toLocaleString()} views</p>
          <p style={{ marginTop: 8, color: 'var(--text-secondary)' }}>
            {video.description}
          </p>
        </div>

        {/* Comments */}
        <div className='comments-section'>
          <h3>{video.comments?.length || 0} Comments</h3>

          {/* Add comment */}
          <form onSubmit={handleAddComment} className='comment-form'>
            <div className='avatar-circle'>
              {user ? user.username.charAt(0).toUpperCase() : '?'}
            </div>
            <div className='comment-input-wrap'>
              <input
                type='text'
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder={user ? 'Add a comment...' : 'Sign in to comment'}
                disabled={!user}
                className='comment-input'
              />
              {commentText.trim() && (
                <div className='comment-actions'>
                  <button
                    type='button'
                    className='cancel-btn'
                    onClick={() => setCommentText('')}
                  >
                    Cancel
                  </button>
                  <button type='submit' className='submit-btn'>
                    Comment
                  </button>
                </div>
              )}
            </div>
          </form>

          {/* Comment list */}
          <div className='comment-list'>
            {(video.comments || []).map(comment => (
              <div key={comment._id} className='comment'>
                <div
                  className='avatar-circle'
                  style={{ width: 32, height: 32, fontSize: 13 }}
                >
                  {comment.userId?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className='comment-body'>
                  <span className='comment-user'>
                    {comment.userId?.username || 'User'}
                  </span>
                  {editingComment === comment._id ? (
                    <div>
                      <input
                        value={editText}
                        onChange={e => setEditText(e.target.value)}
                        className='comment-input'
                        style={{ marginTop: 6 }}
                      />
                      <div className='comment-actions' style={{ marginTop: 6 }}>
                        <button
                          className='cancel-btn'
                          onClick={() => setEditingComment(null)}
                        >
                          Cancel
                        </button>
                        <button
                          className='submit-btn'
                          onClick={() => handleEditComment(comment._id)}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className='comment-text'>{comment.text}</p>
                  )}
                  {user &&
                    user._id === (comment.userId?._id || comment.userId) && (
                      <div className='comment-controls'>
                        <button
                          onClick={() => {
                            setEditingComment(comment._id)
                            setEditText(comment.text)
                          }}
                          className='comment-ctrl-btn'
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteComment(comment._id)}
                          className='comment-ctrl-btn delete'
                        >
                          Delete
                        </button>
                      </div>
                    )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default VideoPlayer
