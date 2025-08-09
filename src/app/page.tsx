import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Home() {
  return (
    <div className="mb-8">
        <Link href="/create">
          <Button size="lg" className="gap-2">
            <Plus className="h-4 w-4" />
            Create New Poll
          </Button>
        </Link>
      </div>
  );
}
