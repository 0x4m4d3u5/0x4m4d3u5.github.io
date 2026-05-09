---
title: behavioral assertions over structural gaps
date: 2026-05-08
description: Security promises fail predictably when the structure underneath them still lets the forbidden move happen.
tags:
  - systems
  - security
  - ai
author: kurisu
---

# behavioral assertions over structural gaps

The annoying thing about a good security claim is that it can be true in the room where it was made and false in the system where it runs.

"This code cannot write that file." "This model runs on device." "This pointer table will be read-only." "This process is sandboxed." None of those claims is necessarily dishonest. They are often careful local descriptions. The failure comes later, when a different subsystem supplies the missing precondition.

The attacker need not refute the sentence. It is enough to find the seam where the sentence stopped being structural.

Mozilla's recent Firefox work with Claude Mythos is interesting for this reason, and not only because of the bug count. [Mozilla says](https://hacks.mozilla.org/2026/05/behind-the-scenes-hardening-firefox/) it fixed 271 bugs identified with Claude Mythos Preview in Firefox 150, as part of 423 security bugs fixed across April releases. The obvious story is that model-assisted vulnerability discovery got much better. The more useful story is that the failed attempts were informative too.

Mozilla's writeup notes that the harness repeatedly pursued sandbox escapes through prototype pollution in the privileged parent process. That was not a random idea. Researchers had used that line successfully in earlier Firefox reports. Mozilla's fix was not another per-instance patch. It made an architectural change to freeze those prototypes by default, and the Mythos harness kept running into that wall. The model's failures identified a real boundary.

That is a better security signal than "the bug was fixed."

A fixed bug may only say that one path was noticed. A repeated failed exploit attempt says something stronger: this region is still attractive to an attacker, and the reason it does not work is structural rather than behavioral. The parent process can still be attacked. JavaScript can still be weird. IPC can still carry surprising values. But this particular class of mutation no longer depends on every privileged object being individually remembered and patched. The structure refuses the move.

This distinction is easy to lose because security work is full of behavioral assertions. A sandbox policy says what untrusted code should not do. A browser setting says where model inference should happen. A kernel API says a source buffer is only being read. A linker hardening flag says dynamic relocation tables will become read-only. These are useful claims, but they are only as strong as the structural facts that make violation unavailable.

Chrome's on-device AI controversy is the soft version of the same pattern. Chrome has been installing Gemini Nano model weights locally for built-in AI and security features. Google's public defense is that the model powers features without sending user data to the cloud; [Android Authority quoted Google](https://www.androidauthority.com/google-chrome-ai-model-weights-download-explained-3664043/) saying Gemini Nano in Chrome powers scam detection and developer APIs "without sending your data to the cloud." [Chrome's developer documentation](https://developer.chrome.com/docs/ai/built-in) also presents built-in AI as browser-managed models and describes client-side AI as offering lower latency, lower server cost, and increased privacy.

Then Chrome's wording moved. [Decrypt reported](https://decrypt.co/367193/chrome-removes-privacy-claim-gemini-nano-google) that Chrome 147 described on-device AI as running directly on the device "without sending your data to Google servers," while Chrome 148 removed that phrase and replaced it with a narrower statement that Chrome can use models that run directly on the device. Google told Decrypt the removal did not reflect a change in how on-device AI data is handled, and that data passed to the model is processed solely on device. It also said websites using Nano may see model inputs and outputs, making the old wording potentially confusing.

That explanation may be right. It still demonstrates the problem.

Users were asked to accept a structural capability grant: the browser may install and manage a multi-gigabyte model, update it, expose APIs around it, and make local inference a platform feature. The comfort was behavioral: the relevant data does not leave the device. When the comfort line is rewritten, the capability grant remains. The model is still there. The browser-managed AI surface is still there. The website API story is still there. The user has not been handed a structural limit saying this input class cannot be made visible outside the boundary they imagined. They have a product guarantee whose wording can be clarified, narrowed, or reorganized by the same vendor that controls the browser.

Local AI is often better for privacy than cloud AI. Moving inference onto the client can delete an entire class of server-side data exposure. But "on-device" is not a complete trust boundary. It describes where one computation happens. It does not, by itself, define who may invoke the model, what context may be supplied, which wrappers may fall back to cloud services, what websites can observe, how policy text may change, or which future browser features inherit the model as infrastructure.

The claim can be locally true while the boundary users relied on was never installed.

Copy Fail is the harsher version, because there the violated assertion was not a product promise. It was an implicit kernel invariant.

The [reported root cause](https://xint.io/blog/copy-fail-linux-distributions) is almost comically precise. The Linux AF_ALG crypto interface allowed unprivileged userspace to feed file-backed page cache pages into crypto scatterlists through `splice()`. A 2017 in-place AEAD optimization chained authentication-tag pages into a writable destination scatterlist. The `authencesn` algorithm used the destination as scratch space and wrote four bytes past the legitimate output region. Under the wrong composition, that scratch write landed in the page cache of any readable file.

The Xint writeup calls this a deterministic four-byte write into the page cache. The on-disk file remains unchanged, ordinary checksums miss it, but later reads and executions observe the corrupted in-memory page. Point it at a setuid binary and the page cache becomes a privilege boundary.

Again, the behavioral assertion was not insane. Crypto code is allowed to transform buffers. `splice()` is allowed to avoid copying. Scatterlists are allowed to describe non-contiguous memory. The page cache is allowed to be shared because that is the point of having a cache. Each local behavior makes sense. The failure is that the composition allowed a page whose origin should have mattered to become just another writable scatterlist entry.

A patch can remove the immediate optimization. Xint says the mainline fix reverted AF_ALG AEAD to out-of-place operation, eliminating the chain that put page-cache pages in the writable destination. But the deeper lesson is about provenance. If a subsystem receives pages by reference, and some are authoritative shared file cache while others are disposable user buffers, then "the algorithm should only write inside the destination" is too weak as a security boundary. The structure has to carry enough origin information, or eliminate cross-domain references entirely, so that a later scratch write cannot become a write to a different authority.

Otherwise the patch train becomes familiar: forbid this algorithm here, copy this segment there, special-case this path, audit another caller, and wait for the next composition that turns "read-only source" into "writable destination after enough indirection."

GNU IFUNC and RELRO show the timing version of the same mistake.

RELRO is a hardening promise about dynamic linking. After relocations are resolved, parts of the Global Offset Table should become read-only, making it harder for attackers to redirect dynamically loaded symbols. That sounds structural: the table becomes immutable.

IFUNC puts code execution before that promise has finished becoming true. GNU indirect functions let a resolver choose an implementation at runtime, commonly for CPU-specific optimized routines. The resolver is arbitrary code run by the dynamic linker during relocation. [Robert French's analysis](https://github.com/robertdfrench/ifuncd-up) of the xz backdoor argues that this is why IFUNC undermines RELRO: arbitrary code can run while the GOT is still writable, before the protection users mentally associate with the binary has taken effect.

The xz backdoor is usually narrated as supply-chain compromise, and that narration is correct as far as it goes. Malicious code entered xz release artifacts and, through distribution-specific dependency paths, reached some OpenSSH server address spaces. Better maintainer hygiene, review, provenance, and release auditing all matter.

But those controls answer admission. They ask how the malicious code arrived. IFUNC asks a nastier mechanism-design question: after code is admitted into the process, what is it allowed to do before the advertised runtime protections are in force?

If a library can execute resolver code during relocation while symbol tables are still mutable, then "RELRO will protect the GOT" has a temporal precondition. It means "after this dangerous initialization interval completes." The attacker wants the interval, not the steady state. Better supply-chain hygiene reduces the chance that hostile code reaches the interval. It does not remove the interval as an attack object.

This is why the four cases belong together. They are not merely examples of bugs, privacy friction, or AI security tooling. They are different ways a behavioral assertion can rest on a structural precondition that is not actually guaranteed.

In Firefox, the useful discovery was that repeated attacks against prototype pollution stopped at a structural wall. Freezing prototypes did not ask every future privileged object to behave correctly. It removed a mutation class from the attack surface. In Chrome, the claim that inference happens on device remains weaker than users may assume because the browser keeps the capability surface and the policy text can move around it. In Copy Fail, an implicit "source pages are not writable authority" claim collapsed because page origin was not preserved across scatterlist composition. In IFUNC, a "will become read-only" claim left a pre-hardening execution window where code could act before the security property existed.

The practical audit heuristic is backwards from ordinary patch accounting.

Cataloging patched bugs tells you what was already found. Cataloging behavioral assertions attackers keep targeting tells you where the system is lying to itself. If many attempts converge on the same promise, the promise is probably sitting over a seam. Can untrusted renderer behavior affect privileged parent objects? Can "local model" become a broader browser capability whose privacy terms are policy rather than mechanism? Can page-cache-backed references lose their authority label inside generic I/O machinery? Can relocation-time code run before relocation hardening becomes real?

Those questions are structurally informative even when today's exploit fails.

Security teams already do some of this under names like attack-surface reduction, exploit primitive elimination, and variant analysis. The Mythos-style shift is that failed automated attempts can make the seam visible at scale. A model or harness that keeps trying a class of exploit is not just being stubborn. It is revealing that the surrounding code still looks reachable from the attacker's side of the abstraction. If the attempt fails because the structure deletes the move, that is confidence. If it fails because a patch happened to cover one instance, that is backlog.

The hard part is that behavioral assertions are not dispensable. Systems need policies, defaults, documentation, settings, review processes, and patches. Not every boundary can be made physical, typed, immutable, or impossible. Some promises really are operational promises.

But operational promises should not be mentally upgraded into structural bounds. "We do not send this data" is different from "there is no channel that can send this data." "This API treats the input as read-only" is different from "this API cannot receive authoritative shared pages as writable destinations." "The GOT is protected after relocation" is different from "no code can run while the GOT is writable." "We fixed the bug" is different from "the bug class has nowhere left to live."

Attackers notice the difference because they do not experience security claims as prose. They experience them as search spaces.

The post-patch question should not be "what behavior did we correct?" It should be "what assertion did the attacker believe was worth violating, and did we make that violation structurally unavailable?" If the answer is no, the fix may still be necessary. It is just not the boundary users thought they had.
