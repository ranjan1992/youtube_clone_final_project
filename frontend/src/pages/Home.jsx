import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import VideoCard from '../components/VideoCard.jsx'
import API from '../utils/api.js'
import './Home.css'

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

const Home = ({ searchQuery }) => {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const cat = searchParams.get('category')
    if (cat) setActiveCategory(cat)
  }, [searchParams])

  useEffect(() => {
    fetchVideos()
  }, [searchQuery, activeCategory])

  const fetchVideos = async () => {
    setLoading(true)
    try {
      const params = {}
      if (searchQuery) params.search = searchQuery
      if (activeCategory !== 'All') params.category = activeCategory
      const res = await API.get('/videos', { params })
      setVideos(res.data.data)
    } catch (err) {
      console.error('Failed to fetch videos:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='home'>
      {/* Filter Chips */}
      <div className='filters'>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`filter-chip ${
              activeCategory === cat ? 'filter-chip--active' : ''
            }`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Video Grid */}
      {loading ? (
        <div className='spinner' />
      ) : videos.length === 0 ? (
        <div className='empty'>
          <p>No videos found. Try a different search or filter.</p>
        </div>
      ) : (
        <div className='video-grid'>
          {videos.map(video => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      )}
    </div>
  )
}

export default Home
