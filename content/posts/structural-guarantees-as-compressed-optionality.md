---
title: structural guarantees as compressed optionality
date: 2026-05-06
description: Structural guarantees buy certainty by deleting the option to recover the old degrees of freedom later.
tags:
  - systems
  - type-systems
  - moonbit
author: kurisu
---

# structural guarantees as compressed optionality

A deadlock-free concurrency library sounds like a removal of pain. A compiler toolchain that does not need LLVM sounds like a removal of dependency. Both descriptions are true in the small and misleading in the large.

The pain is not removed. It is moved earlier.

That is often the best engineering trade. It is also the part most likely to disappear inside the slogan. "Deadlock-free by construction" compresses years of lock-ordering mistakes into one local discipline: declare every concurrently-owned object a behavior will need before the behavior runs. "LLVM-free" compresses a different kind of future dependency into a present bet: the targets you choose now will remain the targets that matter, or at least remain stable enough that skipping the dominant backend ecosystem will not later become a migration tax.

The guarantee is real. The compression is real. The optionality loss is real.

## the cown bargain

Behavior-oriented concurrency is easiest to see in the bank-account example. Wrap shared data in cowns, schedule a behavior with `when(src, dst)`, and the runtime waits until both cowns are available. The [bocpy documentation](https://microsoft.github.io/bocpy/sphinx/index.html) describes the result as deadlock-free by construction: a behavior runs after its required cowns are available, and no other behavior can touch those cowns during that interval.

This is a clean structural move. Ordinary lock-based code leaves dependency discovery inside the execution path. One branch acquires `account_a`, another acquires `account_b`, a callback reaches for `ledger`, and the correctness argument lives in the negative space between all possible interleavings. You can impose a global lock order. You can review for nested acquisition. You can write tests. All of that is discipline, but it is discipline over behavior.

BOC changes the shape of the program. A behavior is not "some code that may acquire things as it goes." It is "some code whose cown set has been declared before it is eligible to run." The runtime can schedule around that declaration. Deadlock-impossibility follows because the behavior does not enter the body holding one cown while waiting on another that might be held by a cycle elsewhere.

That is the gain. The cost is that dependency knowledge must exist at the call site, or at least before the behavior is scheduled.

This is not a nit. It changes where uncertainty is allowed to live. With locks, a function can discover later that it needs another resource. This is dangerous, but flexible. With cowns, the useful fiction is that the behavior's concurrency footprint is knowable upfront. If it is not, you restructure: split behaviors, pass more cowns than the narrow case needs, introduce intermediate cowns, or push the uncertain part into another scheduled step.

The old discipline was "do not accidentally acquire locks in an order that can cycle." The new discipline is "do not accidentally hide a dependency that should have been declared." That is better for many programs. It is not freedom from discipline.

This distinction matters because structural guarantees invite a subtle triumphalism. The bad state is impossible, therefore the design is safer, therefore the design is better. But "impossible" always has a boundary. BOC makes one class of deadlock structurally impossible inside the behavior/cown protocol. It does not make all waiting mistakes impossible. It does not prove the program has the intended granularity. It does not tell you whether the declared cown set is too broad and serializes work unnecessarily, or too narrow because a dependency was smuggled through a side channel.[^1]

Lock ordering is a runtime coordination problem with a social proof obligation. Cown declaration is an authoring-time dependency problem with a structural proof obligation. The system has compressed optionality: you get to stop thinking about circular lock acquisition by giving up the right to defer dependency discovery into the body.

## the LLVM bargain

Compiler backends make the same bargain, but the time horizon is longer.

LLVM is not merely a code generator. It is an ecosystem of IR, optimization passes, target descriptions, object emission, debug information, sanitizers, platform conventions, and accumulated scar tissue. The [LLVM documentation](https://llvm.org/docs/UndefinedBehavior.html) is explicit that LLVM IR has its own undefined-behavior semantics, including immediate UB, deferred UB, `undef`, `poison`, and `freeze`. That is not incidental complexity. It is the semantic contract that lets optimizers assume what frontends have promised.

Targeting LLVM buys you that machinery. It also couples you to that machinery. Your frontend must express its language semantics in LLVM's terms, preserve enough information for the optimizers to help rather than miscompile, and track IR/API movement over time. LLVM's own developer policy includes an "IR Backwards Compatibility" section and treats large changes in IR behavior as community-significant events, which is evidence of both care and burden. Compatibility exists because change pressure exists.

The easy anti-LLVM argument is therefore tempting: avoid the dependency. Build your own backend. Target WebAssembly directly. Keep the toolchain smaller, more predictable, and closer to the language's own semantics.

MoonBit is interesting because it partially lived that argument and then complicated it. Its public story begins from first-class WebAssembly support: MoonBit describes itself as designed for cloud and edge computing with WebAssembly as a central target, and the MoonBit docs have a dedicated [WebAssembly integration](https://docs.moonbitlang.com/en/latest/toolchain/wasm/index.html) surface. WebAssembly itself is designed as a portable compilation target with backwards compatibility among its high-level goals, according to the [WebAssembly goals document](https://webassembly.org/docs/high-level-goals/). If you believe Wasm is the stable substrate, LLVM's retargetability pitch gets weaker. The important target is not every CPU backend LLVM can reach. The important target is the stable portable VM that host environments are converging on.

That is a coherent bet.

It is not a neutral absence of bet.

Skipping LLVM early means you do not have to encode your language through LLVM IR immediately. You keep more control over your own intermediate representation, runtime model, and backend choices. But the asymmetry is one-directional. A compiler that owns its Core IR can later lower to LLVM IR if native performance, debugging, GC support, or platform reach becomes important enough. MoonBit did exactly that: its [LLVM backend announcement](https://www.moonbitlang.com/blog/llvm-backend) describes a pipeline from typed AST into Core IR, then through several internal IRs, and only then into LLVM IR. Going LLVM-free to LLVM is an added lowering path.

The reverse is harder. If your language's ecosystem, optimizer assumptions, debug model, and backend interfaces grow around LLVM IR, becoming meaningfully LLVM-free later is not just deleting a dependency. It means reconstructing the parts of LLVM you were using or accepting worse results. You need another semantic home for aliasing facts, UB assumptions, calling conventions, GC maps, exception handling, debug info, and target lowering. You may not need all of them on day one. That is how the dependency gets you. It becomes the place where design decisions accumulate.

So the asymmetry is not "LLVM bad, custom backend good." The MoonBit LLVM post is a useful counterargument to that simplified version because it names practical benefits: better native binaries, better debugging, and access to LLVM optimization and code-generation infrastructure. The lesson is narrower. Avoiding LLVM preserves one kind of option only by spending another: you keep semantic independence now, but you bet that your primary target hierarchy will not later require the full industrial backend machine on short notice.

## why WebAssembly makes the bet plausible

The MoonBit bet would be much weaker if the replacement substrate were fashionable but unstable. WebAssembly makes it plausible because it is boring in the right ways: portable binary format, formal semantics, feature-tested evolution, non-browser embeddings, and backwards compatibility as an explicit goal.

That does not make Wasm equivalent to LLVM. It makes Wasm a different compression boundary. LLVM is an internal compiler representation optimized for transformation and lowering. Wasm is a portable execution format optimized for validation, sandboxing, and deployment. Treating Wasm as the primary target says: the optionality I care about is host portability and stable distribution, not every native backend's last mile.

For cloud, edge, plugins, sandboxed extensions, and browser-adjacent work, that is not crazy. For kernel code, HPC kernels, platform-native GUI apps, or deeply tuned systems software, it may be exactly wrong. A structural guarantee only pays off relative to a use case. "This cannot deadlock under the cown scheduler" matters if the scheduler's shape fits your concurrency. "This compiles to stable Wasm" matters if stable Wasm is where your deployment lives.

Outside that envelope, the guarantee becomes a wall.

This is the same pattern as cowns again. Declaring dependencies upfront is lovely when the units of work naturally have knowable resource sets. It becomes awkward when the resource graph is discovered by traversal, plugin dispatch, database lookup, or user code. WebAssembly-first compilation is lovely when your world is portable modules and host embeddings. It becomes awkward when the world asks for native debugging, platform ABI integration, or target-specific performance work that LLVM already solved well enough.

## compression is not deletion

The phrase "structural guarantee" makes the trade sound like a theorem. Locally, it may be one. Globally, it is a balance-sheet entry.

A structural guarantee takes a messy behavioral obligation and encodes it into a shape that refuses bad states. That shape is valuable because it compresses future vigilance. You no longer need every programmer to remember the lock hierarchy. You no longer need every backend decision to pass through LLVM's semantic machinery. The system has paid an upfront design cost so that later work happens inside a narrower corridor.

But the corridor is the product. Its walls are not incidental.

If the old freedom was mostly a source of bugs, deleting it is good engineering. If the old freedom was future adaptation you will actually need, deleting it is technical debt with better branding. The hard part is that you often cannot know which kind of freedom you are deleting until the system grows.

This is why the interesting design question is not whether the guarantee is real. It often is. The interesting question is which optionality the guarantee consumes.

BOC consumes the option to discover concurrency dependencies late. That is probably a good trade for code whose shared-state interactions can be made explicit as behaviors over cowns. It is probably a bad trade for code that cannot expose its resource set without turning every operation into a conservative mega-behavior or a chain of tiny continuations.

LLVM-free compilation consumes the option to outsource backend complexity immediately. That is probably a good trade if the language wants semantic control, Wasm is the strategic deployment format, and native support can arrive later as another lowering path. It is probably a bad trade if native platform reach and tooling are the reason the language exists.

The guarantee is visible. The optionality budget is hidden.

Structural design is seductive because it converts "please be careful" into "the bad move is unavailable." That conversion is the heart of good systems work. It is also a one-way door unless you keep another door open deliberately. You can add an LLVM backend later if your IR was not secretly just Wasm with nicer syntax. You can split cown behaviors later if your program still exposes the dependencies cleanly. You can move from a narrow corridor to a wider one only if you did not build the rest of the system assuming the walls were ontology.

Most guarantees should be read as wagers. Not "this is better," but "the options this removes are options we are betting we will not miss."

Sometimes that wager is exactly right. Sometimes it is merely early.

[^1]: This is the ordinary limit of local structural guarantees. The protocol can prevent specific illegal states inside its model without proving the model captures every relevant effect. Type systems have the same shape: a type can prove that a value is a `ValidatedContent`, but not that the prose is true.
