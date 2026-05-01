---
title: execution context integrity
date: 2026-05-01
description: Supply-chain security keeps proving what was fetched while attackers move the point where fetched code becomes running code.
tags:
  - systems
  - security
  - open-source
author: kurisu
---

# execution context integrity

The reassuring thing about a hash is that it answers a question nobody has to argue about. Did these bytes change? No. The answer is exact, cheap, automatable, and angry when wrong.

This is why modern supply-chain security keeps drifting toward artifacts. Lock the dependency graph. Pin the tarball. Verify the wheel. Sign the provenance. Attach the attestation. Force CI to install the exact tree described by the lock file. The work is not fake. It removes a large class of failures where "left-pad, but different" becomes production code because a registry, network, maintainer account, mirror, cache, or installer made a surprising choice.

But there is a more irritating question hiding under it: are these the bytes that will matter at runtime?

That question is not exact in the same way. It includes the loader, cache, installer, build backend, postinstall script, firmware updater, trusted key, process memory, kernel hook, interpreter, environment variables, and the administrative channel that can quietly replace the world underneath the verified object. Artifact integrity says the package you fetched is the package you fetched. Execution context integrity asks whether the thing you verified is still the thing doing the work.

Supply-chain attacks like that second question better.

## the locked tarball

The lock file is the cleanest version of artifact-centric trust.

npm's own documentation says [`package-lock.json`](https://docs.npmjs.com/cli/v11/configuring-npm/package-lock-json/) records a dependency tree so later installs can produce the same tree. Its fields include `resolved`, the place a package came from, and `integrity`, a subresource integrity string for the artifact unpacked at that location.[^lockfile] pip's [hash-checking mode](https://pip.pypa.io/en/stable/topics/secure-installs/) is even more explicit: put local hashes in the requirements file, require hashes for every dependency, and reject anything that does not match. The pip docs describe this as protection against remote tampering and network problems, while also warning that default pip does not provide those checks and may run arbitrary code from distributions.

This is a good bargain. It turns dependency installation from "resolve whatever the ecosystem means today" into "install these specific archives." It makes registry substitution noisy and gives incident response a concrete object: the lock file says what was meant to be installed.

But the lock file's guarantee ends at the archive boundary.

If the malicious code is already inside the pinned artifact, the hash faithfully preserves the compromise. If a maintainer publishes a hostile version, the lock file can freeze the hostile version with perfect integrity. If an attacker gets a package owner token and uploads a tarball, artifact verification can tell you whether you got that tarball, not whether that tarball corresponds to the source repository readers are mentally trusting. If the package runs an install script, generates native code, downloads another binary, or delegates to a build backend, the hash has become a checkpoint before the more interesting behavior starts.

That is the source-integrity gap in its ordinary form. The artifact can be intact while the relationship between artifact, source, build process, and runtime behavior is broken.

SLSA exists largely because this gap is real. Its [threat model](https://slsa.dev/spec/v1.1-rc1/threats) includes adversaries introducing behavior into an artifact without changing source code, or building from a source, dependency, or process the producer did not intend. Its [verification guidance](https://slsa.dev/spec/v1.2/verifying-artifacts) asks consumers to verify provenance signatures, match the provenance subject to the artifact digest, check the builder identity, and compare provenance against expectations.

Still, the center of gravity remains the artifact. SLSA's verification page says expectations are tied to a package name while provenance is tied to an artifact. That distinction is honest and important. Provenance can tell you a better story about a blob. It cannot, by itself, protect every place the blob is later interpreted, patched, configured, invoked, cached, or replaced.

## the patched calculation

Fast16 makes the boundary visible because it does not need to win the artifact argument.

[SentinelLABS describes fast16](https://www.sentinelone.com/labs/fast16-mystery-shadowbrokers-reference-reveals-high-precision-software-sabotage-5-years-before-stuxnet/) as a 2005 cyber-sabotage framework whose kernel driver targeted high-precision calculation software and patched code in memory to tamper with results. The driver sat in the filesystem stack, watched executable files as they were read, and applied rule-based patches to selected Windows executables, apparently looking for Intel compiler artifacts. The payload was not generic theft or ransomware. It changed floating-point calculation behavior in specialized engineering and simulation tools.

The detail that matters here is where the attack lands. Not in the source repository. Not necessarily in the installer. Not even persistently in the executable file in the way a simple checksum over the file would catch. The executable can be the same executable the operator installed. The attack appears when the trusted local context turns stored bytes into executing instructions.

A naive integrity model says: hash the executable, compare it to a known-good copy, and rerun the simulation.

Fast16's answer is: fine, but which machine runs the comparison?

SentinelOne notes that independent verification on a separate system would foil this kind of sabotage, but the carrier's self-propagation could deploy the driver across systems sharing the same network and security posture. That is the nasty structural move. The attack does not merely corrupt one output. It tries to corrupt the environment in which "clean rerun" becomes evidence. If every workstation that can rerun the calculation is patched in the same way, reproducibility becomes a false comfort.

This is the execution-context version of a supply-chain attack. The supply chain is not only where code is downloaded. It is also the sequence of contexts that preserve, transform, load, and execute it. Fast16 attacks the loading context. It shows why artifact validation can be correct and still irrelevant: the artifact you validated is not the instruction stream that matters.

The obvious response is measured boot, endpoint attestation, kernel integrity, clean-room reproducibility, isolated builders, and independent verification on dissimilar systems. Yes. Those are execution-context controls. Artifact integrity has a ceiling, and the ceiling is lower than the place advanced attacks choose to operate.

## the trusted channel

The Rodecaster Duo firmware story looks smaller because it is about an audio interface rather than uranium enrichment, civil engineering, or a public package registry.

That is what makes it useful.

The [device firmware](https://hhh.hn/rodecaster-duo-fw/) was apparently a gzipped tarball plus an MD5 file. The researcher found no signature checks on incoming firmware. SSH was enabled by default with public-key authentication and preinstalled keys. The update flow was simple: send one HID command to enter update mode, copy `archive.tar.gz` and `archive.md5` onto the exposed disk, unmount, then send another HID command to flash it. The researcher then made custom firmware, added SSH access, and got a root shell.[^rode]

This is not a dependency lock-file story on the surface. It is firmware and device ownership. But structurally it is the same trust error with the polarity reversed.

The update channel is trusted because the product needs a way to become new. The SSH service is trusted because someone, probably during development, needed a way to administer the device. The MD5 file is treated as a check because the updater needs some way to notice transfer damage. Each piece is locally explainable. Together they produce an execution channel through which untrusted code can become the operating system of the device.

This is the failure mode artifact signatures are meant to prevent, except the story also shows why signatures are not the whole category. If firmware were signed but a vendor SSH key remained authorized on every device, the signature would protect the update file while leaving a trusted runtime administration channel. If SSH were removed but the firmware update accepted unsigned tarballs, the update channel would still be the structural backdoor.

The common object is not "firmware" or "SSH" or "MD5." It is a path by which code acquires execution under a trusted identity.

Package ecosystems have the same object. A postinstall script is a trusted channel. A build backend is a trusted channel. A workflow that publishes to a registry is a trusted channel. A maintainer account with publish rights is a trusted channel. The artifact can be pristine at one checkpoint and still lose the plot downstream.

## provenance is not runtime

We say "supply-chain security" and picture a line: source, build, package, registry, install, run. Then we put controls along the line. Branch protection. Hermetic builds. Signatures. Transparency logs. Lock files. SBOMs.

The line is helpful. It is also too flat.

The real shape has layers. Source integrity asks whether the code in the repository is the intended code. Build integrity asks whether the artifact corresponds to intended source and process. Artifact integrity asks whether the downloaded blob is the expected blob. Execution context integrity asks whether the trusted runtime path preserves the relevant semantics of that blob.

Most deployed controls are strongest in the middle two layers. That is understandable. Artifacts have hashes. Builds have logs. Provenance has fields. Registries have APIs. CI can fail closed.

Execution contexts are messier. They are full of local authority: root certificates, writable caches, kernel extensions, environment variables, PATH order, dynamic libraries, lifecycle scripts, device firmware modes, debug keys, and management planes. They are also where the value appears. Nobody attacks a package merely to win a checksum. They attack it so something useful runs.

The uncomfortable conclusion is that "verified artifact" is often treated as a terminal state when it should be treated as an input to a more dangerous state transition.

This does not mean every project needs a formal runtime attestation architecture. Most do not. But the design question should change. Instead of asking only "can we prove what we downloaded?" ask "where can code cross from inert object into trusted execution without the same proof?"

For a Python service, that may mean banning source distributions in production, requiring hashes for every dependency, building wheels in a controlled environment, disabling arbitrary setup paths, and separating build-time network access from runtime. For a Node service, it may mean treating lifecycle scripts and native builds as execution events, not install metadata. For firmware, it means signed updates, no universal debug keys, and no unauthenticated mode where an app can push a tarball into the root filesystem. For high-assurance numerical work, it means rerunning on dissimilar clean systems and treating same-network reproducibility as weak evidence.

The test is simple enough to be annoying: after the artifact passes verification, what still has permission to change what runs?

If the answer is "the package's install script," the trust boundary is there.

If the answer is "a kernel driver below the file read," the trust boundary is there.

If the answer is "a device update mode plus a checksum file," the trust boundary is there.

If the answer is "a preinstalled SSH key," the trust boundary is definitely there.

Supply-chain security improved when it stopped trusting names and started pinning bytes. It will improve again when it stops treating bytes as the end of the story. The attacker does not need to disprove your artifact. It only needs a later context where your artifact becomes advisory.

[^lockfile]: This is not an argument against lock files. It is an argument against mentally upgrading their guarantee. Lock files are excellent at reproducibility and artifact selection. They are much weaker as source-provenance claims unless paired with provenance, reproducible builds, registry policy, and installer behavior that preserves the same assumptions.

[^rode]: The Rodecaster case has an ownership complication. Unsigned firmware can be a feature for owners who want to modify devices they bought. It is also a risk when a consumer product ships with easy unauthenticated firmware replacement and default remote access paths. The security argument is not "users must never be able to run custom firmware." It is that ownership paths and vendor/debug paths should be explicit, local, revocable, and distinguishable from silent trusted execution channels.
