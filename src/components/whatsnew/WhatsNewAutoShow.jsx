import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import WhatsNewModal from './WhatsNewModal';

const SEEN_KEY = 'eza_whats_new_seen_ids';

function getSeenIds() {
  try { return JSON.parse(localStorage.getItem(SEEN_KEY) || '[]'); } catch { return []; }
}
function markSeen(id) {
  const ids = getSeenIds();
  if (!ids.includes(id)) {
    ids.push(id);
    localStorage.setItem(SEEN_KEY, JSON.stringify(ids));
  }
}

export default function WhatsNewAutoShow({ user }) {
  const [active, setActive] = useState(null);
  const [manualOpen, setManualOpen] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const all = await base44.entities.WhatsNew.list('-published_at', 50);
        const now = new Date();
        const seen = getSeenIds();

        const eligible = all.filter((a) => {
          if (a.status !== 'published') return false;
          if (a.start_date && new Date(a.start_date) > now) return false;
          if (a.end_date && new Date(a.end_date) < now) return false;
          if (a.target_roles?.length > 0 && user?.role && !a.target_roles.includes(user.role)) return false;
          return true;
        });

        // Find most recent not yet seen — force_display only affects priority, not re-showing
        const sorted = [...eligible].sort((a, b) => (b.force_display ? 1 : 0) - (a.force_display ? 1 : 0));
        const toShow = sorted.find((a) => !seen.includes(a.id));
        if (toShow && !cancelled) {
          setActive(toShow);
          // Increment view count (admin-only update — silently fails for regular users)
          base44.entities.WhatsNew.update(toShow.id, { view_count: (toShow.view_count || 0) + 1 }).catch(() => {});
        }
      } catch {}
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  const handleClose = () => {
    if (active) {
      markSeen(active.id);
      base44.entities.WhatsNew.update(active.id, { dismiss_count: (active.dismiss_count || 0) + 1 }).catch(() => {});
    }
    setActive(null);
  };

  // Allow manual reopen via custom event
  useEffect(() => {
    const handler = async (e) => {
      if (e.detail?.id) {
        try {
          const a = await base44.entities.WhatsNew.get(e.detail.id);
          setManualOpen(a);
        } catch {}
      } else {
        // Open latest published
        try {
          const all = await base44.entities.WhatsNew.list('-published_at', 1);
          if (all[0]) setManualOpen(all[0]);
        } catch {}
      }
    };
    window.addEventListener('eza-open-whats-new', handler);
    return () => window.removeEventListener('eza-open-whats-new', handler);
  }, []);

  return (
    <>
      <WhatsNewModal announcement={active} open={!!active} onClose={handleClose} />
      <WhatsNewModal
        announcement={manualOpen}
        open={!!manualOpen}
        onClose={() => { if (manualOpen) markSeen(manualOpen.id); setManualOpen(null); }}
      />
    </>
  );
}