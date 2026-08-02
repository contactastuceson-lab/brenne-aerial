import {
  Book, Zap, Users, MessageSquare, MessagesSquare, Map, FileText, User,
  Award, Network, Crown, Bell, Smartphone, Lock, Database, Palette, Shield,
  Code2, Coins, Gift, Calendar, Radio, Megaphone, LifeBuoy,
} from 'lucide-react';

const MAP = {
  Book, Zap, Users, MessageSquare, MessagesSquare, Map, FileText, User,
  Award, Network, Crown, Bell, Smartphone, Lock, Database, Palette, Shield,
  Code2, Coins, Gift, Calendar, Radio, Megaphone, LifeBuoy,
};

export default function DocIcon({ name, className, style }) {
  const Icon = MAP[name] || Book;
  return <Icon className={className} style={style} />;
}