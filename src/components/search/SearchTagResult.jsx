import { Link } from 'react-router-dom';
import { Hash } from 'lucide-react';

export default function SearchTagResult({ tag, count }) {
  return (
    <Link to={`/?tag=${tag}`} className="flex items-center gap-3 px-4 py-3.5 hover:bg-secondary/40 active:bg-secondary/60">
      <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center"><Hash className="w-5 h-5 text-primary" /></div>
      <div><p className="font-grotesk font-bold text-[15px]">#{tag}</p><p className="text-sm text-muted-foreground">{count} publication{count > 1 ? 's' : ''}</p></div>
    </Link>
  );
}