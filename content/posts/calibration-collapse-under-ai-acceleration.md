---
title: calibration collapse under ai acceleration
date: 2026-05-15
description: LLM assistance attacks the feedback loop that used to turn visible failure into evaluative skill.
tags:
  - ai
  - systems
  - open-source
author: kurisu
---

# calibration collapse under ai acceleration

The junior engineer is no longer blocked in the old way.

They can produce the function. They can make the test pass. They can ask for an explanation, get one, paste the migration, generate a docstring, add retry logic, and ship a pull request that looks like work. The failure has moved. It is not that they cannot get an answer. It is that they cannot reliably tell whether the answer is the kind of wrong that matters.

This creates an awkward professional gap. The person is too junior to evaluate the output, but too senior to be exempt from using the tool. Refusing the tool looks like inefficiency. Using it produces artifacts whose defects often require the missing expertise to detect. The old apprenticeship failure was visible incompetence. The new one is plausible competence without calibration.

That distinction matters because most earlier automation attacked bounded tasks. Calculators reduced arithmetic burden. Compilers removed assembly translation for most programmers. IDEs made lookup, refactoring, and syntax correction cheaper. These tools changed what people practiced, and some skills weakened, but the feedback loop remained legible. If the spreadsheet formula was wrong, totals failed. If the compiler emitted an error, the programmer had a surface to inspect. If an abstraction leaked, the maintainer eventually had to debug through it.

LLMs are different because they can automate across the metacognitive boundary. They do not merely skip a step inside the work. They also generate the surrounding signs that the work is understood: explanation, confidence, tests, comments, commit messages, design alternatives, and review responses. The novice does not just lose practice producing the answer. They lose exposure to the failed attempts that would have taught them what an answer should smell like.

Apprenticeship worked partly because experts leaked process.

A novice sitting near a senior engineer did not only see finished code. They saw false starts, local confusion, abandoned hypotheses, searches through issue trackers, irritated pauses over ambiguous logs, and the humiliating moment where the elegant theory met production. That residue was not decorative. It taught which errors are normal, which are suspicious, which questions narrow the space, which shortcuts are safe, and which confident explanations are usually rationalizations.

AI assistance cleans the residue away.

The model returns a polished candidate. If asked, it returns a polished rationale. If challenged, it often returns a revised polished rationale. The surface is pedagogically hostile because it hides the distribution of failure. The learner sees answer-shaped objects instead of the search process that makes answer quality evaluable.

The best counterargument is that AI can be a tutor. It can explain unfamiliar code, translate jargon, generate exercises, and reduce the intimidation cost of starting. This is not hypothetical. A controlled experiment on GitHub Copilot found that developers completed a JavaScript HTTP server task [55.8 percent faster](https://www.microsoft.com/en-us/research/publication/the-impact-of-ai-on-developer-productivity-evidence-from-github-copilot/) with access to the tool. A CHI 2023 study on novice programmers using AI code generators found that access [did not impede learning gains](https://arxiv.org/abs/2302.07427) in that setting. A recent programming-education study frames AI as a tool that can become either scaffold or crutch, depending on how students use it and how much metacognitive control they retain.[^1]

Those results complicate the lazy version of the deskilling thesis. They do not remove the structural one.

The question is not whether AI can help a beginner complete a bounded exercise. It can. The question is whether repeated AI-mediated completion builds the threshold skill needed to evaluate AI-mediated completion later. That threshold is not the same as task success. It is the accumulated sense of failure modes: which generated SQL is subtly wrong under concurrency, which explanation confuses cause and correlation, which API use is technically valid but operationally doomed, which test asserts the implementation rather than the invariant, which refactor preserves behavior only because the example path is too friendly.

Below the threshold, the user cannot update properly. A model gives ten answers. Seven are useful, two are harmlessly wrong, one is dangerously wrong. The expert notices the distribution and adjusts trust by domain, task shape, and verification surface. The novice notices that the work mostly moved forward. Their posterior becomes "this is reliable" because the failures that should have corrected it were invisible.

This is calibration failure, not merely ignorance.

Ignorance can be repaired by exposure. Calibration requires labeled exposure. The learner needs contact with attempts whose outcomes become known. They need to believe something, act on it, see it fail, and connect the failure to the earlier belief. LLM assistance can remove exactly that sequence. It supplies a candidate before the learner has generated a hypothesis. It supplies a rationale before the learner has struggled to explain. It supplies tests before the learner has decided what must be true. The novice receives labels only for the easiest outcomes: the compiler accepted it, the local test passed, the reviewer did not complain, the feature shipped.

The harder labels arrive late, if they arrive at all.

An outage three months later does not necessarily teach the original junior engineer why the AI's solution was wrong. The code may be owned by another team. The postmortem may name the immediate bug rather than the learning loop. The incident may be absorbed by seniors who quietly patch around it. The organization gets repair. The novice does not get calibration.

This is why the "intermediate impossible" feels worse than ordinary junior weakness. A junior without AI is visibly slow. A junior with AI can be locally fast while accumulating hidden miscalibration. They can pass through the period where slowness would have forced instruction, because the artifact stream no longer advertises the missing judgment.

The same pattern appears at the expert end, but with a different sign. METR's 2025 randomized trial of experienced open-source developers found that allowing AI tools made participants take [19 percent longer](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/) on tasks in repositories they knew well. The interesting part is not simply the slowdown. It is the perception gap: developers expected speedups, and after the study still believed AI had helped them, while measured completion time went the other way.

For experts, that gap can be corrected because they have independent judgment. They can notice that review overhead dominates, that model suggestions miss repository context, or that a particular task shape is bad for assistance. They can downgrade the tool.

For novices, the same perception gap is more dangerous because the independent measuring instrument is under construction. They are using the tool to build the skill needed to evaluate the tool. That circularity is the structural problem.

There is an economic layer that makes the individual advice almost useless.

"Do not use AI until you have fundamentals" may be good pedagogy, but it is bad labor-market advice when peers, managers, and hiring screens expect AI-accelerated output. The individual novice does not choose the learning environment from behind a veil. They choose inside a market where refusing the tool can look like slower delivery, lower initiative, or cultural lag. Even if they understand the deskilling risk, opting out is individually expensive.

So the empirical question and the normative question separate.

It may be true that heavy LLM use before calibration causes deskilling. It does not follow that an individual should heroically refuse LLMs. Competitive pressure can make the harmful behavior rational. The market rewards visible throughput now and discounts invisible judgment later, especially when later failure can be distributed across teams, customers, maintainers, and incident budgets.

This is where the comparison to older tools breaks.

If calculators weakened mental arithmetic, schools could still require hand calculation during training. If compilers hid machine details, systems courses could still force assembly, memory models, and debuggers back into view. The hidden layer was bounded. The institution could reintroduce it as curriculum.

LLM assistance is harder to bracket because it is useful at every layer of the training task. It can solve the exercise, explain the exercise, generate the study plan, answer the debugging question, critique the essay, write the flashcards, and simulate the mentor. To preserve apprenticeship, the institution has to decide not merely which tasks are off limits, but which parts of the learning feedback loop must remain humanly visible.

That is not a ban problem. It is a structure problem.

The inverse example is already visible in agent tooling. After a period of treating prompts as if sufficiently careful behavior descriptions could control agents, production systems keep moving back toward explicit workflow structure: states, typed outputs, guardrails, handoffs, durable execution, human checkpoints, and constrained tool calls. LangGraph describes itself around [durable execution, human-in-the-loop behavior, and state transitions](https://docs.langchain.com/langgraph). OpenAI's agent-building guide talks about [guardrails, structured outputs, tools, and exit conditions](https://openai.com/business/guides-and-resources/a-practical-guide-to-building-ai-agents/) as ordinary engineering pieces rather than optional politeness.

The industry is rediscovering that behavioral prompting has no enforcement ceiling. If an agent must not send the refund before checking eligibility, the robust solution is not a sterner paragraph in the prompt. It is a workflow that makes the refund transition unavailable until eligibility has been represented in state.

That same lesson applies to apprenticeship. Telling novices to "use AI responsibly" is a behavioral commitment. It asks the least calibrated actor in the system to enforce the boundary most dependent on calibration. The structural version would preserve failure visibility by design.

For software teams, that might mean AI-permitted and AI-restricted phases inside onboarding. It might mean reviews that ask the author to explain rejected alternatives without consulting the chat. It might mean incident follow-ups that trace not only the bad code but the verification process that allowed it through. It might mean generated tests are inadmissible until the human states the invariant first. It might mean pairing sessions where the novice watches the senior be confused, not just the senior's agent produce a patch.

These are not purity rituals. They are attempts to keep the label attached to the example.

The apprenticeship asset is not suffering. It is calibrated contact with reality. If AI removes drudgery while preserving that contact, it can accelerate learning. If it removes the contact and leaves only answer-shaped residue, it converts early career work into throughput theater.

The structural danger is self-reinforcing. The less calibrated the novice is, the more attractive the model becomes. The more they use the model to bypass failure, the less calibration they acquire. The less calibration they acquire, the less able they are to notice when the model is wrong. At the same time, economic pressure punishes unilateral abstinence, and artifact-based management rewards the visible stream of completed work.

This produces a deskilling pattern that is not simply "people forget how to code." That is too narrow. The deeper loss is the ability to know when code, prose, analysis, or design has crossed from plausible to correct enough. Once that evaluative layer weakens, later upskilling becomes harder because the mechanism of recovery depends on the very faculty being eroded.

The old bargain of automation was that humans could give up some operations while retaining judgment over the result. LLMs put that bargain under stress because they can imitate the signs of judgment too.

The practical boundary is therefore not between AI use and non-use. That boundary will not hold under market pressure. The real boundary is between systems that preserve visible failure for learners and systems that let plausible output stand in for learned judgment.

A profession can survive losing some manual operations. It cannot outsource calibration during the period when calibration is supposed to form, then expect expertise to appear later as a managerial preference.

[^1]: The scaffold/crutch distinction matters because it prevents the argument from collapsing into tool nostalgia. See "Tool, tutor, or crutch?" in the [International Journal of STEM Education](https://link.springer.com/article/10.1186/s40594-025-00592-w), which reports both support effects and risks around attenuated calibration and tool-linked self-efficacy.
