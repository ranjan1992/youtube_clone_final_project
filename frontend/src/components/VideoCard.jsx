import React from 'react';
import { Link } from 'react-router-dom';
import './VideoCard.css';

const formatViews = (views) => {
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M views`;
  if (views >= 1_000) return `${(views / 1_000).toFixed(1)}K views`;
  return `${views} views`;
};

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const diff = Date.now() - date.getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return 'Today';
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''} ago`;
  if (days < 365) return `${Math.floor(days / 30)} month${Math.floor(days / 30) > 1 ? 's' : ''} ago`;
  return `${Math.floor(days / 365)} year${Math.floor(days / 365) > 1 ? 's' : ''} ago`;
};

const VideoCard = ({ video }) => {
  const channelName = video.channelId?.channelName || 'Unknown Channel';
  const thumbnail = video.thumbnailUrl || `https://picsum.photos/seed/${video._id}/320/180`;

  return (
    <Link to={`/video/${video._id}`} className="video-card">
      <div className="video-card__thumbnail-wrap">
        <img
          src={thumbnail}
          alt={video.title}
          className="video-card__thumbnail"
          onError={(e) => {
            e.target.src = `https://picsum.photos/seed/${video._id}/320/180`;
          }}
        />
      </div>
      <div className="video-card__info">
        <div className="video-card__avatar">
          {channelName.charAt(0).toUpperCase()}
        </div>
        <div className="video-card__meta">
          <h3 className="video-card__title">{video.title}</h3>
          <p className="video-card__channel">{channelName}</p>
          <p className="video-card__stats">
            {formatViews(video.views)} • {formatDate(video.createdAt)}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default VideoCard;
