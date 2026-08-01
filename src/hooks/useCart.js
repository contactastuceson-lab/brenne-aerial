import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Gestion du panier actif de l'utilisateur courant.
// items: [{ kind, ref_id, label, image_url, price_credits, qty, category }]

export function useCart(user) {
  const qc = useQueryClient();
  const qk = ['cart-active', user?.id];

  const { data: cart = null } = useQuery({
    queryKey: qk,
    queryFn: async () => {
      const carts = await base44.entities.Cart.filter({ owner_id: user.id, status: 'active' });
      return (carts && carts[0]) || null;
    },
    enabled: !!user?.id,
    staleTime: 15000,
  });

  const ensureCart = async () => {
    if (cart) return cart;
    const c = await base44.entities.Cart.create({
      owner_id: user.id,
      owner_email: user.email,
      items: [],
      status: 'active',
      total_credits: 0,
    });
    return c;
  };

  const totalOf = (items) =>
    (items || []).reduce((s, it) => s + (Number(it.price_credits) || 0) * (Number(it.qty) || 1), 0);

  const addItem = useMutation({
    mutationFn: async (item) => {
      let c = cart;
      if (!c) c = await ensureCart();
      const items = [...(c.items || [])];
      const idx = items.findIndex((it) => it.ref_id === item.ref_id && it.kind === item.kind);
      if (idx >= 0) items[idx] = { ...items[idx], qty: (items[idx].qty || 1) + 1 };
      else items.push({ ...item, qty: 1 });
      return base44.entities.Cart.update(c.id, { items, total_credits: totalOf(items) });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qk }),
  });

  const updateQty = useMutation({
    mutationFn: async ({ ref_id, kind, qty }) => {
      if (!cart) return;
      const items = (cart.items || []).map((it) =>
        it.ref_id === ref_id && it.kind === kind ? { ...it, qty: Math.max(1, qty) } : it
      );
      return base44.entities.Cart.update(cart.id, { items, total_credits: totalOf(items) });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qk }),
  });

  const removeItem = useMutation({
    mutationFn: async ({ ref_id, kind }) => {
      if (!cart) return;
      const items = (cart.items || []).filter((it) => !(it.ref_id === ref_id && it.kind === kind));
      return base44.entities.Cart.update(cart.id, { items, total_credits: totalOf(items) });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qk }),
  });

  const clear = useMutation({
    mutationFn: async () => {
      if (!cart) return;
      return base44.entities.Cart.update(cart.id, { items: [], total_credits: 0 });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qk }),
  });

  const itemCount = (cart?.items || []).reduce((s, it) => s + (Number(it.qty) || 1), 0);
  const totalCredits = cart?.total_credits || 0;

  return { cart, itemCount, totalCredits, addItem, updateQty, removeItem, clear };
}