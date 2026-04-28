---
title: structural encoding in 90s simulation games
date: 2026-04-28
description: 1990s simulation games often got realism by encoding constraints into structure because the CPU budget left no room for richer behavior.
tags:
  - games
  - simulation
  - systems
author: kurisu
---

# structural encoding in 90s simulation games

The interesting thing about a lot of 1990s simulation design is not that it was realistic. It is where the realism lived.

Modern simulation games tend to express realism behaviorally. Agents have goals. Systems have rules. Planners score candidate actions. Pathfinders search graphs. Schedulers recompute priorities. The world is data, and the realism is in the code that acts on it.

Older simulation games often inverted that relationship. They embedded behavioral constraints directly into the shape of the data. The code did less because the structure made many bad states impossible, irrelevant, or too expensive for the player to create at scale.

That was not necessarily a theory of formal guarantees. It was CPU math.

Pizza Tycoon is a clean example. Its city traffic does not need every car to run an expensive route search across an open road network. The road tiles already encode legal motion. A straight road segment has the obvious exits. A corner has only the turn it represents. A T-junction offers the directions the tile says exist. A one-way or directional tile constrains flow before the car has made an intelligent decision.

The important move is that the simulation does not ask, for every vehicle, "where can I drive from here?" as a general geometric problem. The tile answers with a small set of legal transitions. The map is not just scenery. It is a precomputed behavioral surface.

That changes the computational problem. A car stepping from tile to tile can be driven by lookup tables and local transitions rather than global reasoning. The player experiences traffic as if the city has rules, lane discipline, and constrained movement. Underneath, much of that apparent intelligence is the road data refusing to offer illegal choices.

RollerCoaster Tycoon attacks a related problem from the other side. Guest movement looks like crowd simulation, but the original game cannot afford every guest to be a competent navigator constantly solving paths across a growing amusement park. The result is deliberately limited local behavior. Guests walk, choose at junctions, follow simple destination logic in bounded cases, and get confused when the path graph asks too much of that model.

Players learned to design around that limitation. A good RCT park is not only beautiful or profitable. It is legible to the guest algorithm. Keep paths narrow enough to avoid accidental junctions. Avoid huge plazas that turn every tile boundary into a choice point. Use simple spines, loops, and short branches. Put exits and high-demand facilities where the local movement rules will actually carry people.

The park layout eliminates pathfinding work by not demanding it.

That is the same pattern as Pizza Tycoon, just with the constraint pushed into a different authoring surface. In Pizza Tycoon, the road tile constrains vehicle motion. In RollerCoaster Tycoon, the player's path topology constrains guest ambiguity. Both games convert what could have been behavioral intelligence into structural encoding.

Constraint encoding is structural-over-behavioral design under resource pressure.

The constraint is real: cars should not drive through buildings, traffic should follow roads, guests should move through a park, and bad layouts should produce bad outcomes. But the enforcement mechanism is not a rich agent model. It is a data shape that narrows the possible actions before the agent logic runs.

That is why the realism feels emergent. The car does not understand urban traffic. The guest does not understand a theme park as a human visitor would. The system gets convincing behavior because simple local rules are applied on top of structures that already encode the important constraints.

This is a different kind of elegance from clever AI. Clever AI tries to recover the right behavior from a broad possibility space. Structural encoding shrinks the possibility space until simple behavior is enough.

The CPU budget made this attractive. A 1990s simulation game had to run on hardware where every agent, tile, timer, animation, and economic update competed for scarce cycles. General search was expensive. Floating point was not something to spend casually. Memory was tight enough that compact representations mattered. If a road tile could carry directionality, or a path layout could prevent ambiguous choices, that was not just cleaner design. It was survival.

The byproduct was a strong alignment between game mechanics and representation. The thing the player built was the thing the simulation consumed. Roads were not visual decorations over an invisible traffic solver. Paths were not cosmetic meshes over a robust navigation system. The authored structure was the operational structure.

Modern CPUs weaken that pressure. We can throw behavior at problems now. We can run A*, steering, utility scoring, navmesh queries, influence maps, queue simulation, and per-agent state machines in the same frame budget that once demanded lookup tables and restraint. That extra power is useful. It also tempts us to move constraints out of data and into code.

The risk is that the simulation becomes less legible. If an agent can compensate for bad structure, the player no longer learns the structure as the game. If traffic can route around almost anything, road topology matters less. If guests can pathfind across arbitrary plazas, the path system stops teaching spatial discipline. If every local defect can be patched by a smarter behavior layer, the world becomes a loose suggestion rather than a set of meaningful constraints.

This is not an argument for worse AI. It is an argument for noticing what was lost when the constraint budget moved from structure to behavior.

Structural encoding gives the player a way to reason about the simulation without reading the code. The rule is in the artifact. A one-way road points where traffic can go. A junction is visibly a choice. A bad path layout visibly creates confusion, congestion, and churn. The player is not debugging hidden agent preferences. They are shaping the state space.

That is the part worth recovering. Modern simulations do not need to be as constrained as their 1990s ancestors, but they can still benefit from making structure carry more of the behavioral load. Use smarter agents where intelligence is the point. Use structural constraints where the world itself should teach the player how it works.

The old games were not elegant because their designers had unlimited freedom. They were elegant because they did not. CPU limits forced them to ask which behaviors could be made cheap by encoding them into roads, paths, tiles, queues, schedules, and topology. The answer produced systems that felt alive precisely because so much of the life had been pre-shaped by structure.

Emergent realism was not always the result of more behavior. Sometimes it was what happened when behavior had almost nowhere wasteful to go.
