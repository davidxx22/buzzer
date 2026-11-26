import { CircleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export function QueueError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="space-y-4">
      <div role="alert" className="flex items-start gap-3 rounded-lg bg-danger-surface p-4 text-danger">
        <CircleAlert className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
        <div>
          <p className="font-semibold">The demo queue couldn’t load.</p>
          <p className="mt-1 text-sm">Check your connection and browser site storage, then try again.</p>
        </div>
      </div>
      <Button variant="outline" onClick={onRetry}>Try again</Button>
    </div>
  );
}
