import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Loader2 } from 'lucide-react';
import PostCard from '@/components/post/PostCard';
import CreatePost from '@/components/post/CreatePost';
import HomeRightSidebar from '@/components/home/HomeRightSidebar';

export default function PostDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [parentPost, setParentPost] = useState(null);
  const [replies, setReplies] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const replyRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [me, postData, replyList] = await Promise.all([
          base44.auth.me().catch(() => null),
          base44.entities.Post.get(id),
          base44.entities.Post.filter({ reply_to_id: id }, '-created_date', 50),
        ]);
        setCurrentUser(me);
        setPost(postData);
        setReplies(replyList);
        // Load parent post if this is a reply
        if (postData.reply_to_id) {
          const parent = await base44.entities.Post.get(postData.reply_to_id).catch(() => null);
          setParentPost(parent);
        }
        // Increment view count
        base44.entities.Post.update(id, { views_count: (postData.views_count || 0) + 1 }).catch(() => {});
      } catch {
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleNewReply = async () => {
    const updated = await base44.entities.Post.filter({ reply_to_id: id }, '-created_date', 50).catch(() => []);
    setReplies(updated);
    const updatedPost = await base44.entities.Post.get(id).catch(() => null);
    if (updatedPost) setPost(updatedPost);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="flex min-h-screen">
      {/* Main */}
      <div className="flex-1 min-w-0 max-w-[600px] mx-auto border-x border-zinc-800/60">
        {/* Header */}
        <div className="flex items-center gap-4 px-4 py-3 border-b border-zinc-800/60 sticky top-0 bg-background/95 backdrop-blur z-10">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-white/5 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-grotesk font-bold text-lg">Post</h1>
        </div>

        {/* Parent post (if this is a reply) */}
        {parentPost && (
          <div className="relative">
            <PostCard post={parentPost} currentUser={currentUser} />
            {/* Thread line */}
            <div className="absolute left-[2.25rem] top-0 bottom-0 w-0.5 bg-zinc-700/50 pointer-events-none" style={{ top: '3.5rem', bottom: '-1rem' }} />
          </div>
        )}

        {/* Original post (full size) */}
        <PostCard post={post} currentUser={currentUser} onReply={() => replyRef.current?.scrollIntoView({ behavior: 'smooth' })} />

        {/* Reply composer */}
        {currentUser && (
          <div ref={replyRef}>
            <CreatePost user={currentUser} onPost={handleNewReply} replyTo={post} />
          </div>
        )}

        {/* Replies */}
        <div>
          {replies.map(reply => (
            <PostCard key={reply.id} post={reply} currentUser={currentUser} compact />
          ))}
          {replies.length === 0 && (
            <div className="py-12 text-center text-muted-foreground/40 text-sm">
              Aucune réponse pour le moment
            </div>
          )}
        </div>
      </div>

      {/* Right sidebar */}
      <div className="hidden xl:flex flex-col w-[300px] flex-shrink-0 sticky top-0 h-screen overflow-y-auto py-4 px-3" style={{ scrollbarWidth: 'none' }}>
        <HomeRightSidebar />
      </div>
    </div>
  );
}