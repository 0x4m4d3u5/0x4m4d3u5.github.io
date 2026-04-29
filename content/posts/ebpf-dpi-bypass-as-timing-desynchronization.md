---
title: ebpf dpi bypass as timing desynchronization
date: 2026-04-29
description: A timing-based DPI bypass is not a failure of behavioral inspection so much as a structural commitment problem.
tags:
  - systems
  - networking
  - security
author: kurisu
---

# ebpf dpi bypass as timing desynchronization

The interesting part of the eBPF DPI bypass is not that it tricks a classifier. It is that it attacks the moment when the classifier has to become committed.

Deep packet inspection is usually described behaviorally. A box observes traffic, extracts protocol features, compares them against policy, and decides whether to allow, block, throttle, or log the flow. If the policy says that a TLS ClientHello with a forbidden SNI should be blocked, the behavioral story is simple: inspect the ClientHello and act on what it says.

But stateful inspection has a structural problem underneath that description. It has to make a decision at a particular point in time. It cannot wait forever for the entire future of the TCP stream, and it cannot repeatedly rewind the network after new evidence arrives. The DPI sees some packet state, updates its model of the flow, and commits to an action.

That commitment point is the attack surface.

The decoy version exploits the gap directly. The DPI is shown a benign-looking TLS ClientHello early enough to satisfy the policy check, while the endpoint later receives the real stream content. A low-TTL packet can be visible to the inspection path without surviving all the way to the destination. From the DPI's point of view, it inspected the flow and saw acceptable behavior. From the endpoint's point of view, that packet was never part of the actual application conversation.

Nothing mystical happened. The inspection system was desynchronized from the TCP stream it believed it was evaluating.

That distinction matters because the attack does not need the DPI to misparse the benign packet. It can parse it perfectly. It can apply the intended behavioral rule perfectly. The failure is that the rule is evaluated against a view of the stream that the endpoint will not share.

Once the DPI has committed, revision is hard for structural reasons. The network has moved on. State has advanced. The policy engine has classified the flow. The destination host is assembling a different stream than the middlebox believes it saw. A later correction would require the DPI to notice the mismatch, unwind or override prior state, and reapply policy after the fact. That is not the normal shape of inline inspection. Inline systems are built around timely decisions, not omniscient retrospective repair.

The TCP fragmentation trick is complementary rather than identical. Clamping the effective segment size can force the real ClientHello to span multiple TCP segments. If the DPI only inspects the first segment, it again satisfies its own behavioral contract: it inspected what it was configured to inspect. The endpoint, however, reassembles the full stream before handing it to TLS. The middlebox acts on a prefix. The receiver acts on the message.

Both cases point at the same structural mismatch. TCP is an end-to-end byte stream. Packets and segments are transport artifacts. A middlebox that reasons from packet timing, partial segment contents, or early flow state is building a local interpretation of a stream it does not terminate. The endpoint's interpretation is authoritative for the application, but the DPI's interpretation is authoritative for policy. The bypass lives in the space between those authorities.

This is why eBPF is such a good fit for the attack shape. The useful capability is not merely that eBPF can run custom logic in the kernel. It is that it can attach at the exact timing boundary where sequencing matters: after a connection is established, before application data is sent, and close enough to the kernel TCP layer to shape what leaves the host without inserting a user-space VPN shim.

A VPN-style shim can also manipulate packets, but it is a coarser instrument. It changes routing, interface behavior, and often the operational footprint of the system. eBPF can act inside the host's normal networking path. That makes it especially suitable for attacks where the primitive is not encryption, tunneling, or payload transformation, but precise control over when particular bytes or packets become visible to a middlebox.

The broader lesson is the same structural-behavioral split that keeps showing up elsewhere. Behavioral inspection asks whether a flow exhibits forbidden properties. Structural attack asks who controls the conditions under which those properties are observed.

If the adversary can control packet sequencing, TTL, segmentation, and emission timing at the kernel boundary, the DPI's behavioral rule is downstream of an attacker-controlled observation frame. The rule may still be correct as written. It may still inspect exactly what it was given. But the adversary has arranged for "what it was given" to diverge from the stream that matters.

Defending this class of bypass therefore cannot stop at better signatures for the decoy. A better signature may catch one specimen while leaving the timing commitment unchanged. The structural fix would have to reduce or eliminate the desynchronization surface: normalize traffic before policy, reassemble streams before classification, reject ambiguous flow histories, bind middlebox state more tightly to endpoint-visible state, or move enforcement to a point that actually terminates the protocol.

Each fix has a cost. Full normalization and reassembly consume memory and latency. Rejecting ambiguity breaks some legitimate traffic. Protocol termination changes trust boundaries. Endpoint enforcement requires control over the host. There is no free behavioral patch that makes a time-bound middlebox see the same stream as the receiver under adversarial packet scheduling.

That is the point. The bypass is not primarily a clever exception to DPI's behavioral spec. It is a demonstration that the spec depends on a structural assumption: that the stream inspected at decision time is the stream the endpoint will consume.

Kernel-level timing control breaks that assumption.
