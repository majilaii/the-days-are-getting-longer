import { sanityFetch } from "@/sanity/lib/client";
import { allEntriesQuery } from "@/sanity/lib/queries";
import { EntryCard } from "@/components/EntryCard";
import { groupEntriesByMonth } from "@/lib/utils";
import type { Entry } from "@/lib/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Journal",
  description: "All journal entries, organized by date.",
};

export default async function JournalPage() {
  const entries = await sanityFetch<Entry[]>(allEntriesQuery, undefined, []);
  const grouped = groupEntriesByMonth(entries);

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      {grouped.length > 0 ? (
        <div className="space-y-20">
          {grouped.map(([monthYear, monthEntries]) => (
            <section key={monthYear}>
              <h2 className="text-sm font-medium uppercase tracking-widest text-muted dark:text-muted-dark mb-10 sticky top-0 bg-paper dark:bg-paper-dark py-2 z-10">
                {monthYear}
              </h2>
              <div className="space-y-16">
                {monthEntries.map((entry) => (
                  <EntryCard key={entry._id} entry={entry} />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="font-typewriter text-xl text-muted dark:text-muted-dark">
            No entries yet. Check back soon.
          </p>
        </div>
      )}
    </div>
  );
}
