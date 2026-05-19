import type { Metadata } from "next";
import { createServiceClient } from "@/lib/supabase/server";
import { reviewFlagAction } from "../actions";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Flagged Content | Admin | MIT Map",
};

export default async function FlaggedContentPage() {
  const supabase = createServiceClient();

  const { data: flags, error } = await supabase
    .from("moderation_flags")
    .select("*, brands(name, slug)")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div>
        <h1 className="font-heading text-3xl font-bold tracking-tight">
          Flagged Content
        </h1>
        <p className="mt-4 text-destructive">
          Error loading flags: {error.message}
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold tracking-tight">
        Flagged Content
      </h1>
      <p className="mt-2 text-[#7C7570]">
        Review content flagged by the moderation system.
      </p>

      {(!flags || flags.length === 0) ? (
        <p className="mt-8 text-sm text-muted-foreground">
          No pending flags. All clear!
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b text-xs font-medium uppercase text-muted-foreground">
                <th className="pb-3 pr-4">Brand</th>
                <th className="pb-3 pr-4">Field</th>
                <th className="pb-3 pr-4">Content</th>
                <th className="pb-3 pr-4">Reason</th>
                <th className="pb-3 pr-4">Date</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* eslint-disable @typescript-eslint/no-explicit-any */}
              {flags.map((flag: any) => (
                <tr key={flag.id} className="border-b">
                  <td className="py-3 pr-4 font-medium">
                    {flag.brands?.name ?? "Unknown"}
                  </td>
                  <td className="py-3 pr-4">{flag.field_name}</td>
                  <td className="max-w-xs truncate py-3 pr-4 text-muted-foreground">
                    {flag.flagged_content}
                  </td>
                  <td className="py-3 pr-4">{flag.flag_reason}</td>
                  <td className="py-3 pr-4 text-muted-foreground">
                    {new Date(flag.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      <form
                        action={async () => {
                          "use server";
                          await reviewFlagAction(flag.id, "reviewed");
                        }}
                      >
                        <Button size="sm" variant="outline">
                          Review
                        </Button>
                      </form>
                      <form
                        action={async () => {
                          "use server";
                          await reviewFlagAction(flag.id, "dismissed");
                        }}
                      >
                        <Button size="sm" variant="ghost">
                          Dismiss
                        </Button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
              {/* eslint-enable @typescript-eslint/no-explicit-any */}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
