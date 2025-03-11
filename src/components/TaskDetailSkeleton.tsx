
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export function TaskDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 pt-12">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <Skeleton className="h-10 w-32 mb-2" />
        </div>
        <Card className="p-8">
          <div className="flex justify-between items-start mb-6">
            <Skeleton className="h-6 w-24" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-10 rounded-md" />
              <Skeleton className="h-10 w-10 rounded-md" />
            </div>
          </div>
          <Skeleton className="h-10 w-3/4 mb-4" />
          <Skeleton className="h-36 w-full mb-6" />
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-6 w-32" />
          </div>
        </Card>
      </div>
    </div>
  );
}
