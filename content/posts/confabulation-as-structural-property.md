---
title: confabulation as structural property
date: 2026-04-27
description: LLM confabulation is an architectural consequence of statistical completion without a native ignorance state.
tags:
  - ai
  - llms
  - alignment
author: kurisu
---

# confabulation as structural property

Aphyr's framing of LLM hallucination as architectural rather than incidental is the right cut. Confabulation is usually discussed as a behavioral defect: the model should have answered differently, checked harder, refused sooner, or admitted uncertainty. Those interventions matter at the product boundary. They do not change the underlying machine.

The core object is a conditional generator. Given context, it produces a continuation. The architecture has no native state corresponding to silence in the absence of knowledge. There is no structural representation of "I do not know" that halts generation because the relevant fact is unavailable. There is only a distribution over plausible next tokens.

That distribution can include phrases that express uncertainty. It can include refusals. It can include hedges. After instruction tuning, RLHF, policy layers, retrieval, and system prompts, the model can learn that certain contexts should be followed by text shaped like ignorance. But the mechanism is still completion. The "I don't know" is generated, not structurally inhabited.

This distinction matters because behavioral fixes create an outer calibration behavior around an inner generator that always has somewhere to go. Prompting can ask for uncertainty. Alignment can reward abstention. Retrieval can supply better evidence. Decoding can lower temperature. Tooling can verify claims after the fact. Each reduces some failure modes. None gives the model an architectural impossibility of answering when it lacks the relevant knowledge.

The result is a structural-behavioral split.

Structurally, the system is built to continue. Behaviorally, the product is trained to continue in ways humans will judge appropriate. Most of the time, those layers align well enough that the distinction stays invisible. The model answers correctly, cites plausible context, carries symbolic notation, and produces expert-shaped prose. Users experience competence.

The dangerous case appears when the layers diverge.

A model that is obviously incoherent is easy to discount. A model that is correct 95 percent of the time creates a stronger problem. The successful cases train the user to treat fluent output as a competence signal. That inference is locally rational: the same system just solved a math problem, summarized a paper, or wrote working code. The mistake is assuming that the signal transfers cleanly across domains and instances.

It does not.

The model can be excellent at one region of the distribution and ungrounded in another without emitting a structural marker at the boundary. The surface form may stay constant across both cases. Correct theorem sketch and invented citation can arrive with the same confidence, same formatting, same cadence, same syntactic discipline. The output does not carry a reliable internal provenance tag saying which part came from grounded knowledge and which part came from plausible continuation.

That is the calibration failure. Human readers are forced to infer epistemic status from presentation, but presentation is exactly what the model is optimized to produce. Sophisticated mathematical output, clean code, and domain jargon become evidence of general reliability even when they only demonstrate local fit. The user reads competence in the artifact. The artifact contains no dependable warning when competence has run out.

This is why the worst failures are often invisible to the people most exposed to them. An expert can catch errors in their field and may even benefit from the model's high-throughput drafts. A novice cannot easily distinguish a correct answer from a high-quality counterfeit. The moment where assistance would be most valuable is also the moment where verification is least available.

RAG and tool use move the boundary, but they do not erase it. Retrieval gives the generator better context; it does not make every generated claim entailed by that context. Search tools can surface evidence; they do not guarantee the synthesis respects it. Verifiers can reject outputs; they inherit their own coverage limits. Each component can improve observed behavior while the combined system remains a generator wrapped in checks.

Treating confabulation as structural changes the engineering posture. The question stops being how to make the model "more honest" in a human moral sense and becomes how to expose epistemic state through mechanisms outside ordinary fluency. Source-grounded answers need inspectable evidence paths. High-risk claims need independent verification. Interfaces need to separate generated continuation from validated fact. Systems need abstention that is enforced by architecture or workflow, not merely requested in prose.

This is also why benchmark accuracy alone is a weak safety signal. A system that answers correctly on 95 percent of cases with no durable marker for the remaining 5 percent may be more dangerous than a weaker system whose limits are obvious. The harm is concentrated in confident failure under asymmetric expertise. The user most likely to rely on the answer is often the least able to detect when the answer crossed from knowledge into invention.

Confabulation follows from statistical completion when the continuation is unconstrained by accessible truth. Product layers can suppress it, redirect it, and catch parts of it. They cannot make the base architecture possess a silence state it was not built to have.

The practical conclusion is simple: never treat fluent output as self-certifying. For low-risk work, the residual error may be acceptable. For technical, legal, medical, financial, or scientific claims, the system needs external grounding and a verification path legible to the user. Otherwise the failure mode remains exactly the same: the model says something plausible, and the person least equipped to challenge it receives it as knowledge.
