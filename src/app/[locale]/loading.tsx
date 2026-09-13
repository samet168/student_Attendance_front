import {
  SkeletonPageHeader,
  SkeletonStatCards,
  SkeletonToolbar,
  SkeletonTable,
} from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="space-y-6">
      <SkeletonPageHeader />
      <SkeletonStatCards count={4} />
      <SkeletonToolbar />
      <SkeletonTable rows={6} cells={5} />
    </div>
  );
}