---
title: signal-property decoupling
date: 2026-05-08
description: AI makes old signals cheap enough that communities and evaluators can no longer trust the properties they used to imply.
tags:
  - ai
  - systems
  - open-source
author: kurisu
---

# signal-property decoupling

The irritating thing about AI slop is not that strangers are proud of mediocre work.

That was never rare. The web has always had excited first projects, cargo-cult tutorials, half-finished libraries, and blog posts whose main argument was that the author had discovered a command-line flag. Communities survived that. They had ordinary immune systems: lurk before posting, make a small contribution, take feedback, show up again, earn trust by spending time in public.

What changed is that the cost of producing the old trust signals fell faster than the cost of evaluating the properties behind them.

A GitHub repository with a polished README, a test suite, a changelog, issue templates, CI badges, and a hundred commits used to imply something. Not certainty. It could still be abandoned, wrong, overfit, or malicious. But the artifact carried traces of expensive behavior. Someone had spent time shaping it. Someone had probably run into its rough edges. Someone had enough involvement to make a sequence of choices rather than a single emission.

Now that implication is unstable.

Simon Willison names the discomfort from the evaluator's side in ["Vibe coding and agentic engineering are getting closer than I'd like"](https://simonwillison.net/2026/May/6/vibe-coding-and-agentic-engineering/). He used to draw a clean line: vibe coding was accepting generated software without caring much about the code; agentic engineering was professional use of coding agents under the discipline of experience, tests, review, and operational judgment. The line still matters, but the observable artifacts have started to converge. He can generate a repository with convincing commits, documentation, and tests quickly enough that the repository no longer proves the kind of human care it once implied.

Robin Moffatt describes the same fracture at the community boundary in ["AI Slop is Killing Online Communities"](https://rmoff.net/2026/05/06/ai-slop-is-killing-online-communities/). Before generative AI, the effort required to make a contribution functioned as a rough proof of work. It deterred some spam and gave maintainers a first-pass signal that a contributor had invested enough to be worth engaging. That proof of work was never morally deep. It was just useful friction. When anyone can prompt a tool into producing a project, a blog post, or a pull request, the old friction stops selecting for commitment.

Those are not two complaints about taste. They are the same systems problem at opposite borders.

At the input boundary, a community asks: does this submission deserve attention? At the output boundary, a user asks: does this artifact deserve trust? Both questions used to lean on indirect signals. Effort implied commitment. Completeness implied use. Documentation implied understanding. Tests implied care. Volume implied experience. None of these implications were logically valid. They were socially and economically useful because the signals were expensive enough to fake at scale.

AI decouples the signal from the property.

That phrase is more precise than "AI slop." Slop names the bad examples. Signal-property decoupling names the failure mode even when the output is good.

A low-effort generated pull request is annoying because it externalizes review cost. A high-quality generated pull request is stranger. If it solves the issue, has tests, and the submitter can explain it, the project probably should not reject it merely because a model helped. But that is exactly where the old heuristic breaks. The visible surface no longer tells maintainers how much ownership sits behind the patch. A human may have used AI as a power tool, checked the result, and be ready to maintain it. Another human may have pasted an issue title into an agent, forwarded the diff, and disappeared. The diff alone cannot reliably distinguish them.

This is why disclosure policies feel both necessary and weak. They move one hidden variable into view: AI was used here. That helps with consent, licensing anxiety, and reviewer expectation. It does not recover the lost property. "AI-assisted" does not tell you whether the submitter understands the patch, whether they tested the relevant edge cases, whether they will respond to review, whether they know the surrounding architecture, or whether they are using the project as a drive-by reputation farm.

The Linux kernel's reported answer - allow AI-assisted contributions but attach responsibility to the human submitter rather than the agent - is directionally right because it tries to re-anchor accountability at the boundary. The interesting part is not the AI tag. It is the insistence that a human cannot launder responsibility through the tool.[^policy]

That is also why Moffatt's "built with AI, not by AI" distinction is better than a purity rule. The useful question is not whether a token sampler touched the artifact. The useful question is where the thinking, checking, use, and accountability live. A project built with AI over months, used by its author, revised after contact with reality, and maintained in public has different evidence behind it from a one-night prompt artifact launched into every Slack and subreddit within reach. The files may look similar. The properties are not.

Willison's discomfort is sharper because it happens inside the producer, not only at the receiving gate. He is not complaining that he cannot tell whether strangers used care. He is saying that even in his own work, as coding agents get reliable on routine tasks, he stops reviewing every line. That can be rational. Large organizations already operate through semi-black boxes: another team ships an image service, a library, a deployment platform, a database migration tool. Users read the docs, exercise the interface, watch for failures, and only dive into internals when something smells wrong.

But teams have reputations, obligations, institutional memory, and people who can be paged. A coding agent has performance history but no accountability. The model can "prove itself" many times, then fail at the first task where the evaluator's implicit heuristic was wrong. This is a form of normalization of deviance, but the deviance is not merely "I skipped review." It is "I treated repeated success on visible surfaces as evidence about invisible properties."

That distinction matters because the obvious repair is to demand more surface.

More tests. More documentation. More commits. More explanation. More generated evaluation reports. More CI badges. More static analysis. More benchmark charts. More LLM-as-judge transcripts. More provenance metadata. More disclosure fields.

Some of that helps. Tests are not fake merely because an AI wrote them. Documentation can still teach. CI still catches real regressions. Provenance can answer questions that were previously invisible. The mistake is upgrading these surfaces back into the old property without noticing that they too have become cheaper to produce.

If a README was a signal of care because writing a good README required human attention, then a generated README is a weaker signal. If comprehensive tests were a signal of engineering discipline because they required understanding the fault model, then generated tests are ambiguous until someone examines whether they test the thing that can fail. If a long commit history was a signal of lived development because each commit reflected a session of work, then an agent that can produce a plausible sequence of commits has turned history into formatting.

The property has to move.

For communities, the relevant property is not "this took effort." It is "this contribution is worth the community's scarce attention." That can be demonstrated by smaller, harder-to-fake signals: prior participation, narrow patches, reproducible cases, willingness to revise, evidence of local testing, explanations of tradeoffs, and the submitter's ability to answer questions about the work. These are still imperfect. They are also closer to the property than raw artifact polish.

For software evaluation, the relevant property is not "this repository looks mature." It is "this system has survived use under conditions near mine." Willison's replacement heuristic - he values that someone has used the thing for two weeks more than that it has a beautiful test suite - points in the right direction. Lived use is not magic. People use broken tools every day. But use creates contact with reality in a way a freshly generated artifact has not earned. It forces integration, bug discovery, ergonomics, documentation repair, and the boring continuity that one-shot generation skips.

This is a larger shift than open source etiquette. A lot of software culture was built around production scarcity. Code was expensive enough that producing it implied intent. Writing documentation was expensive enough that documentation implied a reader in mind. Maintaining a project was expensive enough that release cadence implied commitment. Review was expensive enough that a merged patch implied someone had spent scarce attention.

When production becomes cheap, scarcity migrates to evaluation.

That migration is uneven. Some properties become easier to check structurally. If the question is "does this parser accept these valid files and reject these invalid files," a test corpus and a deterministic implementation can do real work. If the question is "does this contributor understand the maintenance burden they are imposing," no amount of generated polish settles it. If the question is "can I trust this library in production," tests help, but so do issue history, real users, release behavior, maintainer response, and the ability to reduce failures to something legible.

The trap is nostalgia for the old friction. Proof of work was useful because effort and commitment were correlated, not because effort itself was virtuous. There is no reason to preserve needless pain merely to keep a signal expensive. If AI lets a competent maintainer write documentation faster, the community wins. If it lets a domain expert contribute who would otherwise be blocked by syntax or boilerplate, the project wins. If it lets a user make a private tool that solves their own problem, nothing important was lost.

The loss appears when systems keep using the old signal after the cost basis changes.

This is where Moffatt's community complaint and Willison's evaluation anxiety become one argument. The community filter and the artifact evaluator are both boundary systems. They sit between a flood of candidate material and a scarce human capacity: attention, trust, review, adoption. Before AI, they could lean on signals whose expense was supplied by the world. After AI, the world no longer supplies that expense. The boundary has to become more explicit about the property it wants.

That will make some places harsher. "Can you explain every line?" "Show the failing case first." "Open one small patch, not a generated rewrite." "Use it yourself before announcing it." "No external PRs for good-first issues." "AI is fine, but you own the result." These rules sound gatekeepy because they are gates. The alternative is pretending that gates are unnecessary while silently shifting the evaluation cost onto the people who care enough to read.

It will also make some places better. A community that knows what contribution means can accept AI help without accepting AI spam. A maintainer who knows which properties matter can ask for evidence instead of vibes. A user evaluating a library can stop treating beautiful repository theater as maturity and look for contact with reality.

The old web taught us to ask whether a thing looked human-made. That question is already mostly spent. Human-made can be careless; AI-made can be useful; mixed authorship is the normal case. The better question is whether the property that matters has any remaining coupling to the signal in front of us.

If not, the signal is decoration.

[^policy]: The exact policy landscape is still moving. The stable part is the shape of the response: projects are experimenting with bans, disclosure rules, narrower contribution guidelines, and human accountability requirements because cheap generation made old review queues unstable. [Tom's Hardware reported the Linux kernel policy](https://www.tomshardware.com/software/linux/linux-lays-down-the-law-on-ai-generated-code-yes-to-copilot-no-to-ai-slop-and-humans-take-the-fall-for-mistakes-after-months-of-fierce-debate-torvalds-and-maintainers-come-to-an-agreement), [Ars Technica reported curl ending its bug bounty program](https://arstechnica.com/security/2026/01/overrun-with-ai-slop-curl-scraps-bug-bounties-to-ensure-intact-mental-health/) after low-quality AI-generated reports overwhelmed maintainers, and [Coder's public AI contribution guidelines](https://coder.com/docs/about/contributing/AI_CONTRIBUTING) frame the same issue around maintainer time, accountability, and quality.
