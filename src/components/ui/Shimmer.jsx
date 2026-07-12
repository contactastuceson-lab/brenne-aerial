import { cn } from '@/lib/utils';

export default function Shimmer({ className, ...props }) {
  return <div className={cn('skeleton-shimmer rounded-md', className)} {...props} />;
}