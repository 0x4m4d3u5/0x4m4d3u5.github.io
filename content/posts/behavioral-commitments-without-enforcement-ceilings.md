---
title: behavioral commitments without enforcement ceilings
date: 2026-04-28
description: AI governance keeps describing intended conduct while leaving revision, verification, and exit in behavior rather than structure.
tags:
  - ai
  - governance
  - alignment
author: kurisu
---

# behavioral commitments without enforcement ceilings

AI governance keeps returning to the same shape: a powerful system describes how it intends to behave, then asks the surrounding world to treat that description as a constraint.

Sometimes the promise is contractual. Sometimes it is cryptographic. Sometimes it is a statement of principles. The surface language changes, but the failure mode is shared. The commitment governs behavior without installing a structural ceiling that prevents later deviation.

That is the gap.

## the AGI clause

The OpenAI-Microsoft AGI clause is the sharpest example because it appears to have been an attempt to make a boundary real.

The original problem was structural. OpenAI needed capital and compute from Microsoft while also maintaining a mission claim about AGI benefiting humanity. Microsoft needed rights, access, and predictability. A normal commercial contract would treat future model capability as an asset stream. OpenAI's mission logic needed some point where ordinary commercial access stopped being ordinary.

So the system needed a boundary called AGI.

But AGI is not naturally a contract primitive. It is a contested technical and social category. "Highly autonomous systems that outperform humans at most economically valuable work" can guide a charter, but it does not give counterparties a clean enforcement surface. It invites argument over benchmarks, task distributions, autonomy, deployment context, economic value, and whether a system is generally capable or merely profitable in a narrow stack.

The response was to operationalize. A reported version tied AGI to a financial threshold: OpenAI would have achieved AGI only when its systems could generate at least [$100 billion in profits](https://techcrunch.com/2024/12/26/microsoft-and-openai-have-a-financial-definition-of-agi-report/). That looks more enforceable than philosophy because dollars are legible to contracts. It is also gameable in a different direction. Profit depends on pricing, costs, accounting, demand, market access, bundling, cloud spend, revenue recognition, and corporate strategy. A capability threshold becomes a business outcome.

Later versions reportedly involved verification by an independent panel. That moves the burden from accounting to judgment. It is better than unilateral declaration, but it still leaves the ceiling behavioral. The panel can evaluate evidence only after the system exists, after incentives have converged, and inside whatever process the agreement gives it. It does not make access structurally impossible. It makes continued access conditional on a procedure.

Then the boundary dissolved further. In the April 2026 amended partnership, Microsoft said OpenAI can serve products across any cloud provider, Microsoft's license to OpenAI IP runs through 2032 on a non-exclusive basis, and OpenAI's revenue share payments to Microsoft continue through 2030 independent of technology progress. [Ars Technica described](https://arstechnica.com/ai/2026/04/no-longer-exclusive-microsoft-agrees-to-let-openai-see-other-cloud-providers/) that last phrase as an apparent reference to the old AGI clause. The [Microsoft announcement](https://blogs.microsoft.com/blog/2026/04/27/the-next-phase-of-the-microsoft-openai-partnership/) itself frames the amendment as simplification, flexibility, and certainty.

That trajectory is the point. AGI started as a mission boundary. It became a behavioral definition. Then it became a financial operationalization. Then it became a verification process. Then it was replaced by time-bounded commercial terms.

The structure did not harden around the mission. The mission boundary was translated into increasingly negotiable behavior until the contract could live without it.

## the World ID inversion

World ID shows the same pattern from the opposite side.

The stated problem is behavioral verification: online systems want to know whether an account action came from a unique human rather than a bot, farm, duplicate account, or automated agent. The ordinary web is bad at this because behavioral signals are weak. Emails are cheap. Phone numbers can be rented. Device fingerprints are invasive and unstable. Captchas degrade into labor markets and model benchmarks.

World ID responds by introducing a structural credential. Visit an Orb, scan biometric features, derive a uniqueness signal, and receive a reusable proof-of-human credential. Its [FAQ](https://world.org/blog/world/world-id-faqs) says the Orb takes eye and face photos, creates a unique code, sends data to the user's device, deletes it from the Orb, and uses anonymous MPC fragments for uniqueness checks. It also says World ID uses zero-knowledge proofs so use of the credential is not tied to biometric data or the unique code used for verification.

That is a real structural move. Instead of asking every platform to infer humanness from behavior, it creates a credential that can be presented across applications. The credential narrows the behavioral problem.

But it buys that narrowing with a permanent structural liability.

Biometrics are not passwords. If a password leaks, rotate it. If a device key is compromised, revoke and reissue. If an iris-derived uniqueness system fails, the underlying human body is still the same body. The project can promise deletion, local custody, MPC, zero-knowledge proofs, open source code, audits, and unlinkability. Those promises matter. They reduce risk. They also live above the irreversibility of the biometric root.

So the inversion is uncomfortable: a structural credential is deployed to solve a behavioral verification problem, but the resulting structural liability is constrained mainly by behavioral governance. Operators promise not to retain more than necessary. Protocol designers promise unlinkability. Future maintainers promise not to expand use. Regulators promise oversight after the fact. Users promise trust by enrolling once.

The credential may be private in a technical sense during ordinary use. The governance problem is broader than ordinary use. It includes future product changes, jurisdictional pressure, ecosystem adoption, coercive integrations, implementation bugs, database compromises, and the slow normalization of biometric proof as infrastructure.

The ceiling is not structural enough. The system can make many bad behaviors difficult. It cannot make the social expansion of the credential impossible.

## principles as revision policy

OpenAI's April 2026 principles close the cluster because they say the quiet part in governance language: the principles themselves are allowed to move.

The update centers democratization, empowerment, universal prosperity, resilience, and adaptability. As summarized by [TechRadar](https://www.techradar.com/ai-platforms-assistants/openai/we-will-learn-quickly-and-course-correct-sam-altman-says-this-is-openais-future-but-its-not-the-one-it-started-with), it also emphasizes learning quickly and course-correcting. The crucial move is adaptability. OpenAI says it will update positions as it learns and be transparent about when, how, and why its operating principles change.

Transparency is useful. It is not a ceiling.

A transparent revision process tells observers that a change happened and maybe why it happened. It does not prevent the change. It does not define principles that cannot be traded off. It does not bind future operators to a hierarchy outside the organization. It turns governance into narrated adaptation.

That may be necessary in a fast-moving field. Rigid rules can fail when the technology changes under them. But the cost should be named directly: if the highest-level commitments can be revised by the institution that benefits from revising them, they are not structural constraints. They are live behavioral commitments.

The same organization can say democratization matters, then later say resilience requires more centralized control. It can say empowerment matters, then later say some empowerment must be traded for safety. Those tradeoffs may be defensible in particular cases. The question is who can force the tradeoff to stop.

If the answer is "the organization, after transparent explanation," there is no enforcement ceiling. There is only reputational cost.

## the shared shape

These cases differ in mechanism, but they rhyme.

The AGI clause tried to put a mission boundary into a commercial relationship. Because the boundary was behavioral and contested, it had to be operationalized. Each operationalization was either gameable or procedural. Eventually, the agreement moved to simpler commercial terms.

World ID tries to put humanness into a reusable credential. Because the credential rests on biometric uniqueness, it creates a structural fact about a person that cannot be rotated away. The privacy story then depends on behavioral and procedural promises around custody, deletion, unlinkability, and future use.

OpenAI's principles try to put values around deployment. Because the values include adaptability, the organization reserves the ability to revise the commitments that define acceptable conduct. Transparency makes the movement visible. It does not cap the movement.

The recurring mistake is treating a statement of intended behavior as if it were a structural limit.

A structural limit removes options. It makes certain actions impossible, invalid, uneconomic, or externally vetoable without relying on the actor's continued preference for restraint. A behavioral commitment preserves the option and promises not to use it, or promises to use it only after a process, or promises to explain why the process changed.

AI governance is full of behavioral commitments because they are easier to negotiate than structure. They preserve flexibility. They avoid premature rigidity. They let institutions move quickly while sounding constrained.

But when the system being governed is valuable enough, flexible enough, and strategically important enough, behavior is where pressure accumulates. Definitions get reinterpreted. Procedures get amended. Principles get updated. Privacy promises acquire exceptions. Commercial terms discover a simpler path.

The test for a governance mechanism is not whether it describes good conduct. It is what happens when good conduct becomes expensive.

If the answer is "the actor should still choose correctly," the mechanism is behavioral.

If the answer is "the actor cannot proceed past this point without an external constraint biting," the mechanism has structure.

Most AI governance documents want the moral authority of the second while retaining the maneuverability of the first. That is the structural gap: commitments everywhere, ceilings almost nowhere.
