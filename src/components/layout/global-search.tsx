"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  FolderKanban,
  MapPin,
  Landmark,
  Building2,
  Loader2,
} from "lucide-react";
import { globalSearch, type SearchResults } from "@/features/search/actions";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";

const EMPTY: SearchResults = { projects: [], states: [], ministries: [], agencies: [] };

export function GlobalSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults>(EMPTY);
  const [pending, startTransition] = useTransition();

  // Ctrl/Cmd+K to open.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Debounced search.
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults(EMPTY);
      return;
    }
    const t = setTimeout(() => {
      startTransition(async () => {
        try {
          setResults(await globalSearch(query));
        } catch {
          setResults(EMPTY);
        }
      });
    }, 200);
    return () => clearTimeout(t);
  }, [query]);

  function go(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  const hasResults =
    results.projects.length +
      results.states.length +
      results.ministries.length +
      results.agencies.length >
    0;

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="text-muted-foreground gap-2"
        onClick={() => setOpen(true)}
      >
        <Search className="size-4" />
        <span className="hidden sm:inline">Search…</span>
        <kbd className="ml-2 hidden rounded border bg-muted px-1.5 text-[10px] font-medium sm:inline">
          ⌘K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen} shouldFilter={false}>
        <CommandInput
          placeholder="Search projects, states, agencies…"
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          {pending && (
            <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Searching…
            </div>
          )}
          {!pending && query.trim().length >= 2 && !hasResults && (
            <CommandEmpty>No results found.</CommandEmpty>
          )}
          {!pending && query.trim().length < 2 && (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Type at least 2 characters to search.
            </div>
          )}

          {results.projects.length > 0 && (
            <CommandGroup heading="Projects">
              {results.projects.map((hit) => (
                <CommandItem key={hit.id} value={`project-${hit.id}`} onSelect={() => go(hit.href)}>
                  <FolderKanban className="size-4 mr-2" />
                  <span>{hit.label}</span>
                  {hit.sublabel && (
                    <span className="ml-auto text-xs text-muted-foreground">
                      {hit.sublabel}
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {results.states.length > 0 && (
            <CommandGroup heading="States">
              {results.states.map((hit) => (
                <CommandItem key={hit.id} value={`state-${hit.id}`} onSelect={() => go(hit.href)}>
                  <MapPin className="size-4 mr-2" />
                  <span>{hit.label}</span>
                  {hit.sublabel && (
                    <span className="ml-auto text-xs text-muted-foreground">
                      {hit.sublabel}
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {results.ministries.length > 0 && (
            <CommandGroup heading="Ministries">
              {results.ministries.map((hit) => (
                <CommandItem key={hit.id} value={`ministry-${hit.id}`} onSelect={() => go(hit.href)}>
                  <Landmark className="size-4 mr-2" />
                  <span>{hit.label}</span>
                  {hit.sublabel && (
                    <span className="ml-auto text-xs text-muted-foreground">
                      {hit.sublabel}
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {results.agencies.length > 0 && (
            <CommandGroup heading="Agencies">
              {results.agencies.map((hit) => (
                <CommandItem key={hit.id} value={`agency-${hit.id}`} onSelect={() => go(hit.href)}>
                  <Building2 className="size-4 mr-2" />
                  <span>{hit.label}</span>
                  {hit.sublabel && (
                    <span className="ml-auto text-xs text-muted-foreground">
                      {hit.sublabel}
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
