---
title: GitHub Actions dependency lockfiles
description: Recorded action revisions, with a clear boundary around what is pinned.
aliases: ["Actions lockfile"]
tags: [builds, reproducibility]
---
## What gets recorded

A workflow dependency lockfile records commit revisions for actions, including transitive action dependencies. GitHub's documentation places the generated file at .github/workflows/actions.lock and directs authors to generate it with gh actions-lock rather than edit it by hand.

## What remains outside

Calls to reusable workflows are not pinned by this mechanism. Those calls still need a full commit SHA when pinning is required. Inputs, secrets and runner images are also outside the action-code guarantee.

> [!tip] Keep the boundary visible
> A useful dependency record says what it fixes in place and what can still change. It is not a claim that an entire build is reproducible.

## Three different records

![[records.png]]

The diagram is an original schematic: data address → investigation procedure → action revision. These are different records, not an integration between the three products.

Primary source: [GitHub workflow dependency lockfiles](https://docs.github.com/en/actions/concepts/security/workflow-dependency-lockfiles), checked October 31, 2026.

Related: [[Saved investigations#Keep the procedure|notebooks preserve a procedure]]; [[Sail catalog#What to verify|catalogs still need compatibility checks]].
