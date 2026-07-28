import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Loader2 } from 'lucide-react';
import PostCard from '@/components/post/PostCard';
import HomePostCard from '@/components/home/HomePostCard';
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
        base44.functions.invoke('incrementPostViews', { postId: id }).catch(() => {});
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
      {/* Main feed column */}
      <div className="flex-1 flex justify-center min-w-0">
        <main className="w-full max-w-[680px] min-w-0 border-x border-zinc-800/60">

          {/* Header */}
          <div className="flex items-center gap-4 px-4 py-3 border-b border-zinc-800/60 sticky top-0 bg-background/95 backdrop-blur z-10">
            <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-white/5 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="font-grotesk font-bold text-lg">Post</h1>
          </div>

          {/* Parent post (thread context) */}
          {parentPost && (
            <div className="relative">
              <HomePostCard post={parentPost} currentUser={currentUser} />
              <div className="absolute left-[2.25rem] w-0.5 bg-zinc-700/50 pointer-events-none" style={{ top: '3.5rem', bottom: '-1rem' }} />
            </div>
          )}

          {/* Main post */}
          <HomePostCard post={post} currentUser={currentUser} />

          {/* Reply composer */}
          {currentUser && (
            <div ref={replyRef} className="border-b border-zinc-800/60">
              <CreatePost user={currentUser} onPost={handleNewReply} replyTo={post} />
            </div>
          )}

          {/* Replies */}
          <div>
            {replies.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground/40 text-sm font-inter">
                Aucune réponse pour le moment
              </div>
            ) : (
              replies.map(reply => (
                <HomePostCard key={reply.id} post={reply} currentUser={currentUser} />
              ))
            )}
          </div>

        </main>
      </div>

      {/* Right sidebar */}
      <div className="hidden xl:flex flex-col w-[360px] flex-shrink-0 sticky top-0 h-screen overflow-y-scroll py-4 px-4" style={{ scrollbarWidth: 'none' }}>
        <HomeRightSidebar />
      </div>
    </div>
  );
}