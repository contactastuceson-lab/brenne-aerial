import { Link } from 'react-router-dom';
import { Image, MessageCircle } from 'lucide-react';

export default function SearchPostResult({ post }) {
  return (
    <Link to={`/post/${post.id}`} className="block px-4 py-3.5 border-b border-border/50 hover:bg-secondary/40 active:bg-secondary/60">
      <div className="flex gap-3">
        <div className="w-9 h-9 rounded-lg overflow-hidden bg-primary/15 flex-shrink-0">
          {post.author_avatar ? <img src={post.author_avatar} alt="" className="w-full h-full object-cover" /> : <span className="w-full h-full flex items-center justify-center font-bold text-primary">{post.author_display_name?.[0]?.toUpperCase() || 'U'}</span>}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold truncate">{post.author_display_name || post.author_name} <span className="font-normal text-muted-foreground">@{post.author_username}</span></p>
          <p className="mt-1 text-sm leading-5 text-foreground/90 line-clamp-3">{post.content}</p>
          <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
            {post.media_urls?.length > 0 && <span className="inline-flex items-center gap-1"><Image className="w-3.5 h-3.5" /> Média</span>}
            <span className="inline-flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" /> {post.replies_count || 0}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}