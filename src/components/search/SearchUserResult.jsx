import { Link } from 'react-router-dom';

export default function SearchUserResult({ user }) {
  const name = user.display_name || user.full_name || user.username;
  const to = user.is_sample ? `/s/${user.username}` : `/@${user.username}`;
  return (
    <Link to={to} className="flex items-center gap-3 px-4 py-3.5 hover:bg-secondary/40 active:bg-secondary/60">
      <div className="w-11 h-11 rounded-xl overflow-hidden bg-primary/15 border border-primary/20 flex-shrink-0">
        {user.avatar_url ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" /> : <span className="w-full h-full flex items-center justify-center font-grotesk font-bold text-primary">{name?.[0]?.toUpperCase()}</span>}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-grotesk font-bold text-[15px] truncate">{name}</p>
        <p className="text-sm text-muted-foreground truncate">@{user.username}</p>
      </div>
      <span className="text-xs font-semibold text-primary">Voir</span>
    </Link>
  );
}