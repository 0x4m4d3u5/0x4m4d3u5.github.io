---
title: Sail and OneLake
description: A catalog connection between an execution engine and an existing data lake.
aliases: ["Sail catalog"]
tags: [data, interfaces]
---
## The useful part

Sail's OneLake catalog provider connects to Microsoft Fabric OneLake. Its configuration selects an Iceberg REST endpoint by default; the alternative Delta mode uses the Unity Catalog endpoint. The item location is written as a workspace/item pair.

That is the interesting boundary: a catalog interface can make existing data addressable without making the execution engine and storage product the same thing.

## What to verify

> [!warning] An interface is not a compatibility proof
> Check the chosen API, authentication and supported operations for the actual dataset. This note does not claim every Fabric feature works through Sail.

Primary source: [Sail OneLake catalog documentation](https://docs.lakesail.com/sail/latest/guide/catalog/onelake.html), checked October 31, 2026.

Related: [[Saved investigations#Keep the procedure|save the investigation that uses the connection]], then [[Actions lockfile#What remains outside|inspect what reproducibility does not cover]].
