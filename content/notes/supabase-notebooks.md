---
title: Supabase Explorer notebooks
description: Keeping query steps and reasoning in a versioned investigation.
aliases: ["Saved investigations"]
tags: [data, reproducibility]
date: 2026-10-31
---
## Keep the procedure

Supabase Explorer brings database and log queries into one editor. Its notebooks combine query cells with Markdown explanations and can live in the project's supabase folder. The saved artifact contains the queries, not their results, so a later run sees current data.

My takeaway: keeping the steps makes an investigation easier to review and repeat, but it does not freeze the evidence. Record the relevant context when comparing two runs.

> [!question]- What is available now?
> The announcement describes Explorer as a feature preview. That status matters when deciding whether to depend on it for a team workflow.

## Repeat the question, not the snapshot

A saved procedure can be rerun without producing the same answer. For a meaningful comparison, record the time window, parameters and data context alongside the query. The notebook keeps the question inspectable; a separate result snapshot would serve a different purpose.

## Source and connections

Primary source: [Explorer and Notebooks: investigations your team can rerun](https://supabase.com/blog/explorer-and-notebooks-investigations-your-team-can-rerun), published October 30, 2026; checked October 31.

Related: [[Sail catalog]] supplies a different example of data access boundaries. [[Actions lockfile]] records another piece of a repeatable procedure: action code dependencies.
