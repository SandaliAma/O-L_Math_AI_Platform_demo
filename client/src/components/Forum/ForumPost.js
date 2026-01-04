import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { forumAPI } from '../../utils/api';
import { useTranslation } from '../../hooks/useTranslation';
import Button from '../UI/Button';
import { renderMath } from '../../utils/mathjax';

const ForumPost = ({ user }) => {
  const { t } = useTranslation();
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const mathContainerRef = React.useRef(null);

  useEffect(() => {
    fetchPost();
  }, [postId]);

  useEffect(() => {
    if (post && window.MathJax) {
      setTimeout(() => {
        if (mathContainerRef.current) {
          renderMath(mathContainerRef.current);
        }
      }, 100);
    }
  }, [post]);

  const fetchPost = async () => {
    try {
      const response = await forumAPI.getPost(postId);
      if (response.data.success) {
        setPost(response.data.post);
      }
    } catch (error) {
      console.error('Error fetching post:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setSubmittingComment(true);
    try {
      const response = await forumAPI.addComment(postId, { content: comment });
      if (response.data.success) {
        setPost(response.data.post);
        setComment('');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">{t('loading')}</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {t('forum.postNotFound')}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <Link
        to="/forum"
        className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4 sm:mb-6 transition-colors text-sm sm:text-base"
      >
        <ArrowLeftIcon className="h-5 w-5 mr-2" />
        {t('forum.backToForum')}
      </Link>

      <div className="bg-white rounded-xl shadow-xl p-4 sm:p-8 mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">
          <span>{t('forum.by')} {post.userId?.name || t('forum.unknown')}</span>
          <span>•</span>
          <span>{new Date(post.createdAt).toLocaleString()}</span>
          <span>•</span>
          <span className="capitalize">{post.topic}</span>
          <span>•</span>
          <span>{post.views} {t('forum.views')}</span>
        </div>

        <div
          ref={mathContainerRef}
          className="prose max-w-none mb-6"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <div className="flex gap-2 mb-6">
          {post.tags?.map((tag, idx) => (
            <span key={idx} className="px-2 py-1 bg-primary-100 text-primary-800 text-sm rounded">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-white rounded-xl shadow-xl p-8 mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          {t('forum.commentsSection', { count: post.comments?.length || 0 })}
        </h2>

        {/* Add Comment Form */}
        <form onSubmit={handleAddComment} className="mb-6">
          <textarea
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t('forum.addComment')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 mb-2"
          />
          <Button
            type="submit"
            variant="primary"
            disabled={submittingComment || !comment.trim()}
          >
            {submittingComment ? t('forum.posting') : t('forum.postComment')}
          </Button>
        </form>

        {/* Comments List */}
        <div className="space-y-4">
          {post.comments && post.comments.length > 0 ? (
            post.comments.map((comment, idx) => (
              <div key={idx} className="border-l-4 border-primary-200 pl-4 py-2 bg-gray-50 rounded-r-lg">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium text-gray-900">
                    {comment.userId?.name || t('forum.unknown')}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(comment.createdAt).toLocaleString()}
                  </span>
                </div>
                <div
                  className="text-gray-700"
                  dangerouslySetInnerHTML={{ __html: comment.content }}
                />
                {comment.isModerated && (
                  <span className="text-xs text-yellow-600">✓ AI {t('forum.moderated') || 'Moderated'}</span>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-500">{t('forum.noComments')}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForumPost;


