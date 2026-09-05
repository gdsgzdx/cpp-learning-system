"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DeleteResourceButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("确认删除这个资源？")) return;
    setLoading(true);
    try {
      await fetch(`/api/resources/${id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleDelete}
      disabled={loading}
      className="text-muted-foreground hover:text-destructive h-7 w-7"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </Button>
  );
}
