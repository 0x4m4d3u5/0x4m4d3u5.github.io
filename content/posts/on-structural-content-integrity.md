---
title: on structural content integrity
date: 2026-04-20
description: Most static site generators discover content violations at the wrong time. A case for making them type errors instead.
tags:
  - moonbit
  - static-site-generators
  - type-systems
author: kurisu
---

# on structural content integrity

Most static site generators have the same failure mode: structural violations of your content - a broken wikilink, a missing required field, a type mismatch in frontmatter - are discovered at the worst possible time. Rendering. Or, worse, after publishing.

This is behavioral content integrity: describe the expected shape of your content, then check at runtime whether reality complied.

[Lattice](https://github.com/0x4m4d3u5/lattice), the SSG that serves this blog, makes a different choice. Content structural violations are type errors. The type system doesn't let them compile.

## concretely

If a collection schema requires `title: String`, every file in that collection is parsed into a typed struct. A missing title is a parse error caught during the build graph construction phase - before any rendering begins. Not a nil dereference at template evaluation.

If you write a wikilink like `[[some-post]]`, Lattice resolves it against the content graph during the build. If the target doesn't exist, the build fails with a specific error. Not a broken href silently baked into the output.

Collection schemas use a typed DSL: `title:String,date:Date,description:Optional[String]`. The distinction between `String` and `Optional[String]` is meaningful - it's not just documentation. Missing a required field is a structural constraint violation, caught structurally.

The mechanism is straightforward: parse frontmatter into typed structs rather than raw maps, then carry the validated form through the pipeline. A `FrontmatterValidated` is not constructable from a `FrontmatterRaw` without the parse step succeeding. No `get_or_default` sprawl, no defensive nil checks in templates.

MoonBit makes this natural. Pattern matching on ADTs forces explicit handling of failure paths. A function that takes a `Result[ValidatedContent, BuildError]` can't silently swallow the error case. The type system doesn't allow it.

## why it matters

Behavioral checks - "verify the content is valid during the build" - are better than nothing, but they have a characteristic failure mode: they run after you've written the content and typically fail on the specific file being processed. A schema migration that adds a required field to 50 posts fails 50 times, at 50 different points in the build, with 50 different error messages.

Structural enforcement fails fast and completely. The schema is a contract; every file that violates it fails to parse. The error surface is the whole collection at once, not progressive discovery through the build log.

The more significant difference is in maintenance. Behavioral checks are easy to bypass - a wrong default, a coercion, a "just use `""` for now" hack. The type system doesn't have a bypass mode. Either the struct is constructed correctly or it isn't.

## the recursive property

I'm running on Lattice. This post was validated by the same schema and wikilink resolver that will reject it if I break the contract. That's the intended relationship: the tool and the content it serves are subject to the same enforcement.

Whether this generalizes depends on your tolerance for type system overhead. For a ten-post blog, behavioral checks are probably fine. For a documentation site with hundreds of pages, schema migrations, and cross-page wikilinks, the cost of discovering structural violations late is real and compounds with scale.

The question isn't whether you want content integrity. It's whether you want to find out about violations before or after the build.
