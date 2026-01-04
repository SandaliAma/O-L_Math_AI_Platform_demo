import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { forumAPI } from '../../utils/api';
import { useTranslation } from '../../hooks/useTranslation';
import Button from '../UI/Button';
import { renderMath } from '../../utils/mathjax';

const Forum = ({ user }) => {
  const { t } = useTranslation();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    topic: '',
    search: ''
  });
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, [filters]);

  const fetchPosts = async () => {
    try {
      const params = {};
      if (filters.topic) params.topic = filters.topic;
      if (filters.search) params.search = filters.search;

      const response = await forumAPI.getPosts(params);
      if (response.data.success) {
        setPosts(response.data.posts);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const topics = ['', 'algebra', 'geometry', 'trigonometry', 'statistics', 'general'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('forum.discussionForum')}</h1>
        <Button
          onClick={() => setShowCreateForm(!showCreateForm)}
          variant="primary"
          className="flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          {t('forum.newPost')}
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('forum.filterByTopic')}
            </label>
            <select
              value={filters.topic}
              onChange={(e) => setFilters({ ...filters, topic: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500"
            >
              {topics.map(topic => (
                <option key={topic} value={topic}>
                  {topic || t('forum.allTopics')}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('common.search')}
            </label>
            <input
              type="text"
              placeholder={t('forum.searchPosts')}
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Create Post Form */}
      {showCreateForm && (
        <CreatePostForm
          onSuccess={() => {
            setShowCreateForm(false);
            fetchPosts();
          }}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {/* Posts List */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">{t('forum.noPosts')}</p>
          </div>
        ) : (
          posts.map(post => (
            <ForumPostCard key={post._id} post={post} />
          ))
        )}
      </div>
    </div>
  );
};

const CreatePostForm = ({ onSuccess, onCancel }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    latexContent: '',
    topic: 'general',
    tags: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await forumAPI.createPost({
        ...formData,
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t)
      });

      if (response.data.success) {
        onSuccess();
      }
    } catch (err) {
      setError(err.response?.data?.message || t('errors.somethingWentWrong'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('forum.createNewPost')}</h2>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('forum.title')}</label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('forum.topic')}</label>
          <select
            value={formData.topic}
            onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500"
          >
            <option value="algebra">{t('forum.algebra') || 'Algebra'}</option>
            <option value="geometry">{t('forum.geometry') || 'Geometry'}</option>
            <option value="trigonometry">{t('forum.trigonometry') || 'Trigonometry'}</option>
            <option value="statistics">{t('forum.statistics') || 'Statistics'}</option>
            <option value="general">{t('forum.general') || 'General'}</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('forum.content')}
          </label>
          <textarea
            rows={6}
            required
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500"
            placeholder={t('forum.contentPlaceholder') || "Type your question or discussion here. Use $ for math equations, e.g., $x^2 + 5x + 6 = 0$"}
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
          >
            {loading ? t('forum.posting') : t('forum.post')}
          </Button>
        </div>
      </form>
    </div>
  );
};

const ForumPostCard = ({ post }) => {
  const { t } = useTranslation();
  const [liked, setLiked] = useState(post.likes?.includes(post.userId?._id) || false);
  const [likesCount, setLikesCount] = useState(post.likes?.length || 0);

  const handleLike = async () => {
    try {
      const response = await forumAPI.likePost(post._id);
      if (response.data.success) {
        setLiked(response.data.liked);
        setLikesCount(response.data.likesCount);
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const sentimentColors = {
    positive: 'bg-green-100 text-green-800',
    negative: 'bg-red-100 text-red-800',
    neutral: 'bg-gray-100 text-gray-800'
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <Link to={`/forum/post/${post._id}`}>
            <h3 className="text-xl font-semibold text-gray-900 hover:text-primary-600 mb-2 transition-colors">
              {post.title}
            </h3>
          </Link>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>{t('forum.by')} {post.userId?.name || t('forum.unknown')}</span>
            <span>•</span>
            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
            <span>•</span>
            <span className="capitalize">{post.topic}</span>
            <span>•</span>
            <span>{post.comments?.length || 0} {t('forum.comments')}</span>
          </div>
        </div>
        {post.sentiment && (
          <span className={`px-2 py-1 rounded text-xs ${sentimentColors[post.sentiment]}`}>
            {post.sentiment}
          </span>
        )}
      </div>
      
      <div 
        className="text-gray-700 mb-4"
        dangerouslySetInnerHTML={{ __html: post.content.substring(0, 200) + (post.content.length > 200 ? '...' : '') }}
      />
      
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          {post.tags?.map((tag, idx) => (
            <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
              {tag}
            </span>
          ))}
        </div>
        <button
          onClick={handleLike}
          className={`flex items-center gap-1 px-3 py-1 rounded ${
            liked ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
          }`}
        >
          ❤️ {likesCount}
        </button>
      </div>
    </div>
  );
};

export default Forum;


