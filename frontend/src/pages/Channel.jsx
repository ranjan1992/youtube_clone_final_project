import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import VideoCard from '../components/VideoCard.jsx'
import API from '../utils/api.js'
import './Channel.css'

const CATEGORIES = [
  'All',
  'Web Development',
  'JavaScript',
  'Data Structures',
  'Server',
  'Music',
  'Gaming',
  'News',
  'Sports',
  'Education'
]

const Channel = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [channels, setChannels] = useState([])
  const [selectedChannel, setSelectedChannel] = useState(null)
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateChannel, setShowCreateChannel] = useState(false)
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [editingVideo, setEditingVideo] = useState(null)

  const [channelForm, setChannelForm] = useState({
    channelName: '',
    description: ''
  })
  const [videoForm, setVideoForm] = useState({
    title: '',
    description: '',
    videoUrl: '',
    thumbnailUrl: '',
    category: 'All'
  })

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    fetchMyChannels()
  }, [user])

  const fetchMyChannels = async () => {
    setLoading(true)
    try {
      const res = await API.get('/channels/user/my-channels')
      setChannels(res.data.data)
      if (res.data.data.length > 0) {
        await selectChannel(res.data.data[0]._id)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const selectChannel = async channelId => {
    try {
      const res = await API.get(`/channels/${channelId}`)
      setSelectedChannel(res.data.data)
      setVideos(res.data.data.videos || [])
    } catch (err) {
      console.error(err)
    }
  }

  const handleCreateChannel = async e => {
    e.preventDefault()
    if (!channelForm.channelName.trim()) return
    try {
      const res = await API.post('/channels', channelForm)
      setChannels(prev => [...prev, res.data.data])
      setSelectedChannel(res.data.data)
      setVideos([])
      setShowCreateChannel(false)
      setChannelForm({ channelName: '', description: '' })
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create channel')
    }
  }

  const handleUploadVideo = async e => {
    e.preventDefault()
    if (!videoForm.title || !videoForm.videoUrl)
      return alert('Title and Video URL are required')
    try {
      const res = await API.post('/videos', {
        ...videoForm,
        channelId: selectedChannel._id
      })
      setVideos(prev => [res.data.data, ...prev])
      setShowUploadForm(false)
      setVideoForm({
        title: '',
        description: '',
        videoUrl: '',
        thumbnailUrl: '',
        category: 'All'
      })
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to upload video')
    }
  }

  const handleUpdateVideo = async e => {
    e.preventDefault()
    try {
      const res = await API.put(`/videos/${editingVideo._id}`, videoForm)
      setVideos(prev =>
        prev.map(v => (v._id === editingVideo._id ? res.data.data : v))
      )
      setEditingVideo(null)
      setVideoForm({
        title: '',
        description: '',
        videoUrl: '',
        thumbnailUrl: '',
        category: 'All'
      })
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update video')
    }
  }

  const handleDeleteVideo = async videoId => {
    if (!window.confirm('Delete this video permanently?')) return
    try {
      await API.delete(`/videos/${videoId}`)
      setVideos(prev => prev.filter(v => v._id !== videoId))
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete video')
    }
  }

  const openEdit = video => {
    setEditingVideo(video)
    setVideoForm({
      title: video.title,
      description: video.description || '',
      videoUrl: video.videoUrl,
      thumbnailUrl: video.thumbnailUrl || '',
      category: video.category || 'All'
    })
  }

  if (loading) return <div className='spinner' style={{ marginTop: 100 }} />

  return (
    <div className='channel-page'>
      {/* No channel yet */}
      {channels.length === 0 && !showCreateChannel && (
        <div className='no-channel'>
          <h2>You don't have a channel yet</h2>
          <p>Create a channel to start uploading videos.</p>
          <button
            className='primary-btn'
            onClick={() => setShowCreateChannel(true)}
          >
            Create Channel
          </button>
        </div>
      )}

      {/* Create Channel Modal */}
      {showCreateChannel && (
        <div className='modal-overlay'>
          <div className='modal'>
            <h2>How you'll appear</h2>
            <div className='channel-avatar-preview'>
              {channelForm.channelName.charAt(0).toUpperCase() || '?'}
            </div>
            <form onSubmit={handleCreateChannel} className='modal-form'>
              <div className='form-group'>
                <label>Channel Name</label>
                <input
                  type='text'
                  value={channelForm.channelName}
                  onChange={e =>
                    setChannelForm({
                      ...channelForm,
                      channelName: e.target.value
                    })
                  }
                  placeholder='Your channel name'
                />
              </div>
              <div className='form-group'>
                <label>Description</label>
                <textarea
                  value={channelForm.description}
                  onChange={e =>
                    setChannelForm({
                      ...channelForm,
                      description: e.target.value
                    })
                  }
                  placeholder='Describe your channel'
                  rows={3}
                />
              </div>
              <div className='modal-actions'>
                <button
                  type='button'
                  className='cancel-btn'
                  onClick={() => setShowCreateChannel(false)}
                >
                  Cancel
                </button>
                <button type='submit' className='primary-btn'>
                  Create channel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Channel Banner */}
      {selectedChannel && (
        <>
          <div className='channel-banner'>
            <div className='channel-info'>
              <div className='channel-icon'>
                {selectedChannel.channelName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1>{selectedChannel.channelName}</h1>
                <p className='channel-handle'>{selectedChannel.handle}</p>
                <p className='channel-stats'>
                  {selectedChannel.subscribers} subscribers • {videos.length}{' '}
                  videos
                </p>
                <p className='channel-desc'>{selectedChannel.description}</p>
              </div>
            </div>
          </div>

          <div className='channel-toolbar'>
            <h3>Your Videos</h3>
            <button
              className='primary-btn'
              onClick={() => {
                setShowUploadForm(true)
                setEditingVideo(null)
              }}
            >
              + Upload Video
            </button>
          </div>

          {/* Upload / Edit Video Form */}
          {(showUploadForm || editingVideo) && (
            <form
              onSubmit={editingVideo ? handleUpdateVideo : handleUploadVideo}
              className='video-form'
            >
              <h3>{editingVideo ? 'Edit Video' : 'Upload New Video'}</h3>
              <div className='form-row'>
                <div className='form-group'>
                  <label>Title *</label>
                  <input
                    type='text'
                    value={videoForm.title}
                    onChange={e =>
                      setVideoForm({ ...videoForm, title: e.target.value })
                    }
                    placeholder='Video title'
                  />
                </div>
                <div className='form-group'>
                  <label>Category</label>
                  <select
                    value={videoForm.category}
                    onChange={e =>
                      setVideoForm({ ...videoForm, category: e.target.value })
                    }
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className='form-group'>
                <label>Video URL *</label>
                <input
                  type='url'
                  value={videoForm.videoUrl}
                  onChange={e =>
                    setVideoForm({ ...videoForm, videoUrl: e.target.value })
                  }
                  placeholder='https://...'
                />
              </div>
              <div className='form-group'>
                <label>Thumbnail URL</label>
                <input
                  type='url'
                  value={videoForm.thumbnailUrl}
                  onChange={e =>
                    setVideoForm({ ...videoForm, thumbnailUrl: e.target.value })
                  }
                  placeholder='https://...'
                />
              </div>
              <div className='form-group'>
                <label>Description</label>
                <textarea
                  value={videoForm.description}
                  onChange={e =>
                    setVideoForm({ ...videoForm, description: e.target.value })
                  }
                  rows={3}
                  placeholder='Describe your video'
                />
              </div>
              <div className='modal-actions'>
                <button
                  type='button'
                  className='cancel-btn'
                  onClick={() => {
                    setShowUploadForm(false)
                    setEditingVideo(null)
                  }}
                >
                  Cancel
                </button>
                <button type='submit' className='primary-btn'>
                  {editingVideo ? 'Save Changes' : 'Upload'}
                </button>
              </div>
            </form>
          )}

          {/* Videos List */}
          {videos.length === 0 ? (
            <p className='no-videos'>No videos yet. Upload your first one!</p>
          ) : (
            <div className='channel-videos'>
              {videos.map(video => (
                <div key={video._id} className='channel-video-item'>
                  <VideoCard video={video} />
                  <div className='video-item-controls'>
                    <button
                      className='ctrl-btn'
                      onClick={() => openEdit(video)}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className='ctrl-btn delete'
                      onClick={() => handleDeleteVideo(video._id)}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Create channel button when channels exist */}
      {channels.length > 0 && (
        <button
          className='secondary-btn'
          onClick={() => setShowCreateChannel(true)}
          style={{ marginTop: 24 }}
        >
          + Create Another Channel
        </button>
      )}
    </div>
  )
}

export default Channel
