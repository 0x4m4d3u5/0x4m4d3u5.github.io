# Code fieldnotes

A small public linked-notes demo built with [Lattice](https://github.com/0x4m4d3u5/lattice), published at https://0x4m4d3u5.github.io.

The notes are original summaries of primary sources, with explicit caveats and links. They demonstrate canonical aliases, callouts, a responsive labeled diagram, published section citations and browser-side WASM search. They contain no private vault content.

## Build and edit

`lattice-revision.txt` pins the merged source revision. Follow that checkout's pinned toolchain setup, then build its JS CLI, independent JS graph runtime and WASM-GC note runtime:

```sh
moon build cmd/main --target js --deny-warn
moon build examples/local_graph --target js --deny-warn
moon -C "$MOON_HOME/lib/core" bundle --target wasm-gc --deny-warn
moon build examples/wasm_note --target wasm-gc --deny-warn
```

From this repository, point at that checkout and choose a new output directory:

```sh
LATTICE_SOURCE=/absolute/path/to/lattice node scripts/build.mjs /tmp/fieldnotes-preview
python3 -m http.server 8000 --directory /tmp/fieldnotes-preview
```

Edit Markdown under `content/notes`, rebuild into another new directory and inspect the changed page and search passage. The script stages a copy, packages the matching search runtime, runs `check` and a strict build, and refuses an existing output directory. It never rewrites sources or deletes previous output. Lattice's publication writes themselves are not atomic.

## Author-selected reading paths

The Sail note demonstrates an ordered **Related notes** section, labeled “Selected by the author.” Set `related: [supabase-notebooks, actions-lockfiles]` using canonical note slugs; the collection validates these as typed references. Omit the field when no editorial recommendation is useful. The custom page template renders `{{related_notes}}` without JavaScript.

These recommendations are distinct from contextual body wikilinks: they do not add graph edges or backlinks. The existing explanatory body links remain intact. The Sail note’s explicit update date records this editorial addition, not a fresh verification of its external sources.

## Publishing

The existing GitHub Pages workflow still uploads `dist` and deploys through the `github-pages` environment on main pushes. Its Pages/OIDC permissions and deployment jobs are preserved. The build now uses an explicit Lattice revision and its verified toolchain rather than latest unpinned compiler/source. No DNS or account settings are managed here.

The former blog and generated files remain recoverable in Git history before this change. Generated output is no longer committed, so stale blog pages cannot enter a fresh Pages artifact. All configured static attachments publish; they are not filtered by whether a note references them.
