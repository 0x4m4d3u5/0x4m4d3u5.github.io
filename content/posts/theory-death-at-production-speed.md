---
title: theory death at production speed
date: 2026-05-10
description: AI coding makes code production cheap enough that clean artifacts can outrun the shared theory needed to change them.
tags:
  - ai
  - systems
  - open-source
author: kurisu
---

# theory death at production speed

A codebase can look healthier than the organization that owns it.

The build is green. The tests cover the happy paths and a surprising number of edge cases. The docs are fresh because they were generated from the same diff that changed the API. The commit history is busy. Releases are regular. Static analysis is mostly quiet. There are even architecture notes, or at least files named like architecture notes.

Then a customer asks for the wrong change.

Not a bug fix. Not a CRUD endpoint adjacent to three existing CRUD endpoints. A change that cuts across the intended model of the system: a new consistency requirement, a different ownership boundary, a reversal of an assumption that made three subsystems simple. The team can still ask an AI agent for patches. It can still produce code. What it cannot do quickly is answer why the old shape existed, which pieces were accidental, which pieces were load-bearing, and what would have to become true for the new requirement to be absorbed without turning the system into paste.

This failure does not look like technical debt.

Technical debt is usually visible in the code, or at least visible through the code if you stare long enough. The duplication accumulates. The abstraction leaks. The migration is half-finished. The tests are brittle. The dependency is unmaintained. There is a place where the debt lives, even if nobody has budgeted the time to pay it down.

Theory-debt is worse because the artifacts can be clean.

Peter Naur's 1985 essay ["Programming as Theory Building"](https://gwern.net/doc/cs/algorithm/1985-naur.pdf) is the old text that suddenly looks less like philosophy and more like incident analysis. Naur argues against treating programming as the production of a program and related documents. The programmer's real product is a theory of the matter at hand: a working, situated understanding of how the problem, the solution, the limits, and the real-world activity fit together. Code expresses that theory. It is not the theory.

This sounds mystical until a system has to be changed by people who did not build it.

The new maintainers can read the code. They can read the documentation. They can run the tests. They can ask a model to summarize the repository. They can generate diagrams, sequence charts, ADRs, onboarding guides, and failing tests for plausible behavior. All of this helps. None of it is the same as holding the theory. The theory includes the negative space: why obvious alternatives were rejected, which shortcuts were harmless, which names are lies, which invariants live in customer behavior rather than code, which bugs are tolerated because the real world never triggers them, and which "temporary" constraints are now constitutional.

Naur's unsettling claim was that a program whose theory has died may not be revivable from the artifacts alone. The practical advice can sound extreme: if the theory-holders are gone, rewrite rather than pretend recovery is cheap. That was already hard advice in 1985, when producing code was expensive.

AI makes the advice obscene.

The current productivity story is not imaginary. In a controlled experiment on a JavaScript HTTP server task, developers with GitHub Copilot completed the task [55.8 percent faster](https://arxiv.org/abs/2302.06590) than the control group. Simon Willison's writing on [agentic engineering](https://simonwillison.net/guides/agentic-engineering-patterns/what-is-agentic-engineering/) captures the best optimistic case: coding agents can write and execute code in a loop, humans can specify goals and verify results, and professional engineers can amplify expertise rather than abdicate it.

That distinction matters. The failure mode here is not "AI writes bad code." Bad code is familiar. Bad code leaves evidence. It makes review painful, production noisy, and future changes visibly expensive.

The sharper problem is acceptable code arriving faster than the organization can metabolize it.

Code production has become partially parallelizable. Theory building has not. A developer can spawn agents against several tasks, accept patches, request tests, ask for documentation, and keep a project moving at a rate that would have been impossible by hand. But the living understanding still has to be formed in human heads, negotiated across boundaries, corrected by use, and remembered by whoever will be present for the next non-local change.

The artifacts scale with generation. The theory scales with apprenticeship.

This is why more documentation does not close the gap by itself. Documentation used to be expensive enough that its existence carried some evidence of attention. Not much, but some. Now documentation can be generated at the same speed as the code. Tests, commit messages, changelogs, diagrams, and release notes can all be generated from the same artifact stream.

That does not make them useless. It makes them ambiguous.

A passing generated test may encode a real invariant, or it may encode the implementation that happened to exist. A generated architecture document may expose the shape of the system, or it may rationalize it after the fact. A commit history may show maintenance velocity, or it may show that a prompt loop was able to keep producing acceptable deltas. The old signals do not disappear. They lose meaning.

This is already visible at the ecosystem layer. Willison's [tools colophon](https://tools.simonwillison.net/colophon) labels many small utilities as AI generated and includes development histories that may consist of a single commit plus the prompt transcript. That is one of the more honest presentations of AI-assisted software. The interesting part is what it does to repository interpretation. For years, a project with commits, releases, tests, docs, and recent activity implied some process behind it. Not a guarantee, but a Bayesian signal: someone was maintaining it, understanding it, and paying the carrying cost.

AI can now manufacture much of that signal without the old process.

The GitHub repository becomes less like a fossil record of engineering attention and more like a printout from a production system. It may still correspond to real understanding. It may correspond to a careful human using agents as force multipliers. It may also correspond to a structurally plausible pile of code that nobody could extend under pressure. From the outside, the difference is hard to see.

This is the difference between technical debt and theory-debt. Technical debt says: the system contains future work. Theory-debt says: the system may contain no one who knows what future work means.

The obvious objection is that AI can help reconstruct theory too.

Sort of.

Models are excellent at local explanation. They can trace call graphs, summarize modules, produce candidate invariants, compare design alternatives, and make unfamiliar code less hostile. This is a real reduction in revival cost. Sean Goedecke's essay on [programming with AI agents as theory building](https://www.seangoedecke.com/programming-with-ai-agents-as-theory-building/) makes the stronger optimistic move: agents may be useful precisely because they repeatedly rebuild a theory of the codebase from artifacts, and future improvements may give them longer-lived theories.

That is the best counterargument because it attacks the mechanism, not the mood.

But there are two catches. First, a reconstructed theory is not automatically the original theory. Sometimes that is fine; the original theory may have been wrong. Sometimes it is fatal, because the missing piece is not in the repository. It is in a customer contract, an operational scar, a regulator's interpretation, a production incident nobody wrote down, or a senior engineer's memory of the meeting where the elegant solution was ruled out. The model can infer plausible reasons. Plausible reasons are not binding reasons.

Second, a theory that is rebuilt per session is not the same organizational object as a theory held by a team. It does not create shared judgment unless people route the learning into practice. The agent can explain the system to Alice today and Bob tomorrow. If Alice and Bob do not converge on a common model, the organization has many private summaries and no collective theory.

This is where the individual productivity story becomes an organizational learning problem.

Stijn Viaene's California Management Review piece on [AI governance defaults](https://cmr.berkeley.edu/2026/04/how-ai-governance-defaults-shape-organizational-learning/) describes the split between approval-first and enablement-first organizations. Approval-first governance pushes AI use into queues and often underground; enablement-first governance builds shared infrastructure, conventions, and routines so experimentation can be visible and learning can circulate. The important observation is not merely that committees are slow. It is that the routing layer determines whether individual discoveries become organizational capability.

AI coding makes this harsher because the discoveries are small, frequent, and often rational to hide.

An engineer finds a prompting pattern that makes a migration easy. Another finds that an agent can update tests and docs in one pass. A third learns that the model always breaks a particular abstraction unless given a special warning. None is large enough to justify a formal memo. Some are embarrassing. Some look like personal productivity advantages. Some violate the official policy. So they remain private, trapped in chat logs, or encoded as muscle memory.

The organization sees output. It does not receive theory.

Steering committees are badly matched to this rate of change. By the time a practice is approved, named, standardized, and taught, the model, tool, repository, and local technique may have moved. The behavioral apparatus lags the production apparatus. The old coordination mechanisms were designed for slower artifacts.

There is a tempting managerial response: require better artifacts. Every AI-generated change must include tests, docs, design notes, a provenance footer, a reviewer checklist, and a link to the prompt transcript.

Some of that is probably necessary. It is also insufficient. Artifact requirements can be satisfied by the same machinery that created the original gap. The system can produce more legible residue without producing a living theory-holder. In the limit, every change comes with a beautiful explanation that nobody has metabolized.

The better test is human: who can answer adversarial questions about the change without asking the machine to regenerate confidence?

Why is this boundary here? What breaks if the queue becomes at-least-once? Why did we choose tenant-level encryption rather than object-level encryption? Which invariant is protected by this ugly conditional? What would have to be true for this module to disappear? Where is the system relying on sales behavior, support behavior, or user patience? If the answer is a generated paragraph, the organization has an artifact. If someone can defend the answer, modify it under pressure, and teach it to another person, the organization may have theory.

That suggests a different discipline for AI-assisted development: more deliberate theory transfer.

Agent transcripts are raw material for review, not proof of understanding. Tests should force disputed invariants into public view. Documentation should record rejected alternatives and environmental constraints, not just describe the code that exists. Reviews should spend less time admiring generated collateral and more time interrogating the assumptions a future change would need. Teams should preserve some slow paths where successors build the theory rather than only consume outputs.

None of this restores the old world. Software has always suffered from heroic maintainers, vanished context, folklore architectures, and documents that fossilized into lies. AI did not invent theory death.

It industrializes a version that does not smell like decay.

That is the categorical shift. We are used to systems failing the theory-building test after neglect: the maintainers leave, the code rots, the docs drift, the tests fail, the repository goes quiet. AI-assisted development permits a stranger state: a system can fail the theory-building test while all the visible signs improve. More code. More tests. More docs. More commits. More releases. Less shared understanding per unit of structure.

The first time such a system breaks, the postmortem will probably blame requirements, review, tests, ownership, or technical debt. Those may all be locally true. But the deeper failure will be that the program existed as an artifact before it existed as a theory held by the organization that depended on it.

Technical debt is when the code remembers a shortcut.

Theory-debt is when only the code remembers anything at all.
