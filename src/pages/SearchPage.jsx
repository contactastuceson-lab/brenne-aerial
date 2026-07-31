import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search as SearchIcon } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { extractHashtags } from '@/lib/hashtags';
import SearchInput from '@/components/search/SearchInput';
import SearchUserResult from '@/components/search/SearchUserResult';
import SearchPostResult from '@/components/search/SearchPostResult';
import SearchTagResult from '@/components/search/SearchTagResult';
import { getTierRank } from '@/lib/subscriptionGating';
import AdSlot from '@/components/feed/AdSlot';

function Section({ title, children }) {
  return <section className="border-b border-border/60"><h2 className="px-4 pt-5 pb-2 font-grotesk font-bold text-lg">{title}</h2>{children}</section>;
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const { data: users = [] } = useQuery({ queryKey: ['search-users'], queryFn: async () => (await base44.functions.invoke('getPublicUsers', {})).data || [], staleTime: 300000 });
  const { data: sampleProfiles = [] } = useQuery({ queryKey: ['sample-profiles'], queryFn: async () => (await base44.functions.invoke('getSampleProfiles', {})).data || [], staleTime: 300000 });
  const { data: posts = [] } = useQuery({ queryKey: ['search-posts'], queryFn: () => base44.entities.Post.list('-created_date', 100), staleTime: 60000 });
  const tags = useMemo(() => {
    const counts = {};
    posts.forEach(post => (post.hashtags?.length ? post.hashtags : extractHashtags(post.content || '')).forEach(tag => { counts[tag] = (counts[tag] || 0) + 1; }));
    return Object.entries(counts).map(([tag, count]) => ({ tag, count })).sort((a, b) => b.count - a.count);
  }, [posts]);
  const normalized = query.trim().replace(/^#/, '').toLowerCase();
  const matchingUsers = useMemo(() => {
    if (!normalized) return [];
    const all = [...users, ...sampleProfiles.map(p => ({ ...p, is_sample: true }))];
    return all
      .filter(u => `${u.username || ''} ${u.display_name || ''} ${u.full_name || ''}`.toLowerCase().includes(normalized))
      .sort((a, b) => getTierRank(b.perks) - getTierRank(a.perks))
      .slice(0, 12);
  }, [users, sampleProfiles, normalized]);
  const matchingPosts = useMemo(() => normalized ? posts.filter(post => `${post.content || ''} ${post.author_username || ''} ${post.author_display_name || ''}`.toLowerCase().includes(normalized)).slice(0, 30) : posts.slice(0, 20), [posts, normalized]);
  const matchingTags = useMemo(() => (normalized ? tags.filter(item => item.tag.includes(normalized)) : tags).slice(0, 10), [tags, normalized]);
  return (
    <main className="w-full max-w-[680px] min-h-screen md:border-r md:border-zinc-800/60">
      <SearchInput value={query} onChange={setQuery} />
      <div className="px-4 py-3 border-b border-border/40"><AdSlot placement="feed_banner" /></div>
      {!matchingUsers.length && !matchingPosts.length && normalized ? <div className="py-24 text-center"><SearchIcon className="w-9 h-9 mx-auto mb-3 text-muted-foreground/40" /><p className="font-grotesk font-bold">Aucun résultat pour « {query} »</p></div> : <>
        {matchingUsers.length > 0 && <Section title="Profils">{matchingUsers.map(user => <SearchUserResult key={user.id} user={user} />)}</Section>}
        {matchingTags.length > 0 && <Section title={normalized ? 'Hashtags' : 'Tendances'}>{matchingTags.map(item => <SearchTagResult key={item.tag} {...item} />)}</Section>}
        {matchingPosts.length > 0 && <Section title={normalized ? 'Publications' : 'Publications récentes'}>{matchingPosts.map(post => <SearchPostResult key={post.id} post={post} />)}</Section>}
      </>}
    </main>
  );
}