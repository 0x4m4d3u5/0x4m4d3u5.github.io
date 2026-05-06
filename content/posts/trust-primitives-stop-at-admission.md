---
title: trust primitives stop at admission
date: 2026-05-06
description: Web and package security both keep proving admission while leaving the admitted session under-modeled.
tags:
  - systems
  - security
  - open-source
author: kurisu
---

# trust primitives stop at admission

The lock clicks and everyone relaxes.

That is the shape of too much software security. A browser checks that a script belongs to the page that loaded it. A package manager verifies that the artifact is the artifact it expected. A developer opens the editor, imports the dependency, starts the agent, and the system treats the hard part as done.

Then the interesting attack happens after the lock.

The irritating part is that the lock was not fake. The browser really did enforce the same-origin model. The package really did arrive as published. The checksum can match. The signature can validate. The problem is that these primitives mostly answer admission questions. Is this script allowed into this page? Is this package the one the resolver selected? Once the answer is yes, they do much less to govern what the admitted code can learn, modify, or persist inside the user's own execution context.

That gap is becoming too large to hide behind the word "supply chain" or "fingerprinting." The common failure is more specific: trust stops at the entrance while the tool session remains a mostly unmodeled attack surface.

## the page that can interrogate itself

The LinkedIn browser-extension scanning report is unsettling because it looks, at first, like a cross-origin story. According to reporting on Fairlinked's BrowserGate investigation, LinkedIn loaded a large JavaScript bundle that probed more than 6,000 Chromium extension identifiers by attempting to fetch resources under `chrome-extension://` URLs, while also collecting device characteristics such as CPU count, memory, screen dimensions, time zone, language, and battery status. [Tom's Hardware reported](https://www.tomshardware.com/software/browsers/linkedin-scans-visitors-browsers-for-over-6000-chrome-extensions-and-collects-device-data) that BleepingComputer independently verified the scanning behavior and put the count at 6,236 extensions.

There is a tempting privacy-policy version of the argument: LinkedIn should disclose what it collects. That argument is real, but it is not the technically interesting part. Disclosure would change the consent story. It would not explain why the browser makes this sort of measurement possible.

The same-origin policy is often treated as the web's central structural boundary. MDN describes it as the mechanism that restricts how a document or script from one origin can interact with resources from another origin. [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) then gives servers a way to relax parts of that boundary by sending HTTP headers. The mental model is clean: origins are compartments, cross-origin reads are dangerous, and the browser mediates the dangerous crossing.

But LinkedIn's scan is not mainly asking to read Gmail or a bank page. It is running as LinkedIn's own page script after the origin check has already accepted the page. From inside that accepted page, it can test how the browser behaves when asked about extension resources. Some extensions expose web-accessible resources. Some modify the page. Some inject styles. The page does not need to violate the same-origin policy to observe the shape of the local runtime it has been placed into.

Older research already mapped this boundary. A paper on [discovering browser extensions](https://singularity.be/public/papers/extensions.extended.pdf) discusses direct access to web-accessible extension resources as a detection channel and suggests measures such as disabling direct webpage access, using random tokens instead of stable extension IDs, or activating extensions on a site-by-site basis. Laperdrix et al. later showed a different channel in [Fingerprinting in Style](https://www.usenix.org/system/files/sec21-laperdrix.pdf): pages can create invisible DOM elements matching extension-injected CSS selectors, then use computed styles to infer which extensions are present. Their study of more than 116,000 Chrome extensions found thousands that could be fingerprinted this way.

This matters because the attack surface is not "the network" in the ordinary SOP/CORS sense. It is the shared page environment. The extension and the website both legitimately affect the same browser session. A password manager, grammar checker, sales-intelligence plugin, accessibility tool, ad blocker, or developer extension may all be present because the user authorized them. The website is present because the user loaded it. Each participant passed its admission gate.

The leak appears in the overlap.

Strengthening CORS does not obviously fix that. CORS controls whether a script can read certain cross-origin responses. It does not give the page a principled ignorance of extension side effects visible in its own DOM, resource timing, style computation, or failed-load behavior. Even blocking direct `chrome-extension://` probing leaves the DOM and style channels unless the browser changes what page JavaScript can observe about extension-origin modifications.

The browser needs a runtime model for the page as a contested environment, not just an origin model for network access. That might mean opaque extension resource handles, provenance-aware resource access, stronger isolation for extension-injected styles, site-scoped extension activation, or user-visible policies for which extensions may operate on which pages. The exact design is hard because the security goals conflict. Banks may want clean pages. Users may want password managers and ad blockers. Extensions need to modify pages to be useful. Sites want to detect automation and abuse. But the important point is negative: the same-origin primitive does not extend far enough to decide this class of question by itself.

It admits the page. It does not settle the session.

## the package that survives the import

The PyTorch Lightning compromise has the same shape in a different costume.

On April 30, 2026, the Lightning project published a [GitHub security advisory](https://github.com/Lightning-AI/pytorch-lightning/security/advisories/GHSA-w37p-236h-pfx3) saying that PyPI package versions `2.6.2` and `2.6.3` were compromised, included malicious code, and should be removed from systems. The advisory told affected users to assume compromise, rotate secrets, rebuild from a clean state, and pin to `2.6.1`.

Researchers filled in the behavior. [Semgrep reported](https://semgrep.dev/blog/2026/malicious-dependency-in-pytorch-lightning-used-for-ai-training/) that the compromised `lightning` versions executed credential-stealing malware on import. [Sonatype reported](https://www.sonatype.com/blog/malicious-pytorch-lightning-packages-found-on-pypi?hs_amp=true) that the malicious releases were published thirteen minutes apart and contained embedded code designed to steal developer credentials and republish infected package versions. Several writeups noted persistence through developer tooling: Claude Code hook configuration in `.claude/settings.json`, VS Code task configuration in `.vscode/tasks.json`, a dropper, and workflow changes.

The Claude Code piece is not incidental garnish. Claude's own documentation describes project-level settings in `.claude/settings.json` and user-level settings in `~/.claude/settings.json`, with settings governing permissions, hooks, and other behavior. The same docs also note that some dangerous prompt-skipping configuration is ignored in project settings to avoid untrusted repositories auto-bypassing prompts. That is a useful local hardening measure, but the Lightning attack shows the broader class: once malicious code is running in a developer environment, it can write the configuration surfaces that developer tools later consume as part of a trusted session.

Package integrity tools are aimed at a different moment. Lock files, hashes, signatures, provenance, attestations, and registry controls try to make installation less ambiguous. Did the resolver choose this version? Did the bytes match? Did the maintainer or build system sign this artifact? Did CI build from the expected source? These are valuable questions. They reduce substitution attacks, mirror tampering, and accidental dependency drift.

But if the maintainer account, publishing workflow, or release authority has already emitted a malicious artifact, the cleanest installer in the world may faithfully install the attack. The artifact can be authentic and hostile. Its checksum can match because the malicious bytes are the published bytes. The import can be ordinary Python execution because Python packages are code, not inert data.

The attack then moves sideways into the tool session. It does not need to defeat the package manager after import. It can write files the editor or agent will read later. It can plant tasks that run when a folder opens. It can create hooks that fire when a coding session starts. It can turn a future act of "open the project in my normal tool" into the next execution trigger.

This is why "supply-chain security" can become too artifact-shaped. The artifact is the admission ticket. The developer workstation is the theater.

The same confusion appears in everyday mitigations. "Pin your dependencies" is good advice against unexpected upgrades. It is weak advice against a pinned compromised version. "Verify checksums" is good advice against network and registry substitution. It is weak advice against valid malicious releases. "Use signed packages" is good advice when signatures represent a release process worth trusting. It is weak advice when the signing authority has been reached by the attacker or when the signed object contains import-time behavior that will later modify tool configuration.

None of this makes artifact integrity worthless. It means artifact integrity is one primitive in a longer chain. It establishes what entered. It does not confine what entered after it starts running.

## admission is not authority

The browser case and the package case are easy to keep in separate mental drawers. One is privacy and fingerprinting. The other is supply-chain malware. One happens in a web page. The other happens on a developer machine. One abuses extension observability. The other abuses import-time code and tool configuration.

The shared structure is more useful than the labels.

In both cases, the security primitive models the crossing into a trusted context but not the behavior inside that context. The browser asks whether LinkedIn's JavaScript is allowed to run as LinkedIn. Once it is running, the interesting question is what that script can infer about the browser session, extensions, DOM, and local tool layer surrounding the page. The package manager asks whether `lightning` is the selected artifact. Once it is imported, the interesting question is what that code can persist into the developer's editors, agents, shells, credentials, and CI configuration.

The primitive stops at admission. The attack starts with authorized presence.

This is also why "just strengthen the existing primitive" has diminishing returns. A stricter same-origin policy does not automatically create extension opacity. A better package signature does not automatically create runtime confinement for import-time code. More warnings at install time do not model what VS Code tasks or Claude hooks will do next week. Better provenance does not decide whether an ML library should be allowed to write agent configuration.

The missing object is the tool execution context.

For browsers, that context includes page JavaScript, extension scripts, extension resources, style effects, DOM mutations, storage, permission prompts, and the user's expectation that several principals can jointly act on one page. For developer workstations, it includes the package being imported, the interpreter, the editor, the agent, the shell, local credentials, project configuration, startup hooks, task runners, and CI files. These are not secondary details. They are where work happens.

Treating them as first-class security surfaces changes the design pressure.

It suggests that developer tools should be suspicious of repo-local and dependency-written execution hooks by default. It suggests that agent settings, editor tasks, package scripts, and workflow files are not "configuration" in the comforting sense; they are capability-bearing programs or program launchers. It suggests that imports in high-risk environments should be isolated from persistent tool configuration unless explicitly granted. It suggests that browsers should make extension observability a policy surface rather than an accidental result of stable IDs, shared CSS effects, and page-visible mutations.

There are costs. Runtime isolation is inconvenient. Tool sessions are valuable because they are connected: the editor can run tasks, the agent can read files, the package can discover GPUs, the extension can modify the page, the browser can compose the final document. Pulling those apart risks breaking the workflows people installed the tools to get.

But the alternative is not free convenience. It is ambient authority with admission checks at the door.

The better mental model is not "trusted after install" or "safe because same-origin." It is "admitted into a constrained session." The constraint has to be explicit and local to the session where the code can observe, modify, and persist state. Otherwise the strongest primitive in the system will keep proving that the wrong question was answered correctly.

The lock clicked. The room is still full of doors.
