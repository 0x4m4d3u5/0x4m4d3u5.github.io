---
title: nan-boxing inversion
date: 2026-04-28
description: NaN-boxing is the odd case where IEEE 754 behavior enables a structural runtime type encoding.
tags:
  - systems
  - javascript
  - type-systems
  - floating-point
author: kurisu
---

# nan-boxing inversion

Most of the structural-behavioral pattern goes one way: encode enough into structure and you need less behavior.

NaN-boxing is the clean inversion. A behavioral guarantee in IEEE 754 is what makes the structural trick possible.

The trick is that a 64-bit JavaScript value wants to be too many things at once. It wants to hold a double, because JavaScript numbers are doubles. It also wants to hold integers, booleans, `null`, `undefined`, strings, objects, symbols, BigInts, and pointers into the heap. A naive representation uses a tagged union: a tag somewhere, a payload somewhere else, and more than 64 bits once alignment is done with it.

NaN-boxing notices that IEEE 754 binary64 has a large dead zone. A normal finite double is not free. It needs all 64 bits. But a NaN is not one bit pattern. It is an exponent of all ones plus a non-zero fraction. Quiet NaNs leave payload bits behind. In binary64, after the quiet-NaN marker, there are 51 payload bits that are not part of an ordinary numeric magnitude.

JavaScript engines use that space.

[JavaScriptCore's `JSValue`](https://github.com/WebKit/WebKit/blob/main/Source/JavaScriptCore/runtime/JSCJSValue.h) says this directly: on 64-bit platforms it uses a NaN-encoded form, assumes non-zero qNaN payloads are available, and uses those ranges to encode pointer and integer values. Its layout distinguishes doubles from pointers, 32-bit integers, booleans, `null`, and `undefined` inside one 64-bit word.

[SpiderMonkey's `JS::Value`](https://github.com/mozilla-firefox/firefox/blob/main/js/public/Value.h) makes the same move in a more explicit discriminated-union framing. A value is still 64 bits. IEEE numbers and infinities represent numbers. NaN bitstrings represent either the canonical JavaScript NaN or a non-number value, with tag bits near the top of the fraction field and payload bits holding things like object and string pointers.

That is the structural result: a runtime type system packed into a float-shaped word.

The interesting part is what licenses it. Quiet NaN is not merely "some unused encoding." It has behavior. It propagates through floating-point operations without raising an exception, and implementations generally preserve enough payload structure for the trick to be practical as long as the engine canonicalizes external numeric NaNs before treating a word as a value. IEEE 754 left payload space for diagnostic information. Dynamic language runtimes repurposed that diagnostic channel as a type tag.

The behavioral rule makes the structural representation safe enough to use.

That reverses the usual argument. In the simulation-game examples, structure narrowed behavior. Roads, paths, tiles, and topology made simple agents look smarter because the data refused many illegal states before the code had to reason about them. In NaN-boxing, a behavioral contract supplied by the floating-point substrate creates structural room above it. Because qNaN has well-defined non-trapping behavior, runtimes can steal the unused representational space and build a compact type discipline there.

The sharp edge is signaling NaN.

IEEE 754 also distinguishes signaling NaNs from quiet NaNs. A signaling NaN is supposed to announce itself when used. That is the behavioral promise: this NaN is not just a value that flows through arithmetic, it is a trap door for invalid use.

In real systems, that promise is thin. Floating-point exceptions are usually masked. Language runtimes quiet or canonicalize NaNs. Compilers and hardware paths often make it hard to preserve the intended "signal on use" behavior as a dependable program property. The structural distinction exists in the encoding, but the behavioral contract is not something most software can rely on.

So qNaN and sNaN form a useful pair. Quiet NaN's behavior is reliable enough that engines can build a structural type representation out of its payload. Signaling NaN's behavior is specified strongly enough to sound useful, but weakly enough in practice that it mostly collapses into another NaN bit pattern unless the entire stack cooperates.

That is the asymmetry.

The qNaN payload was meant for diagnostics. JavaScript engines turned it into object pointers, string pointers, integer immediates, boolean values, and singleton tags. A behavioral guarantee in a numeric standard became spare structural capacity for a dynamic language runtime.

Sometimes structure eliminates behavior. Sometimes behavior is the only reason the structure exists.
