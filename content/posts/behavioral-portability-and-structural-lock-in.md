---
title: behavioral portability and structural lock-in
date: 2026-05-07
description: GitHub exit looks easy at the repository layer and hard everywhere software work became platform-issued behavior.
tags:
  - systems
  - open-source
  - security
  - platforms
author: kurisu
---

# behavioral portability and structural lock-in

The annoying part of leaving GitHub is that everyone is technically right.

The "Git is distributed" answer is true in the narrowest and most defensible sense. A repository clone is not a checked-out folder pretending to be a project. It contains the commit graph, trees, blobs, tags, refs, and enough history to continue development somewhere else. If all a project needs to preserve is source history, GitHub is not a prison. Add another remote, push, and the bytes have escaped.

Then Mitchell Hashimoto says [Ghostty is leaving GitHub](https://mitchellh.com/writing/ghostty-leaving-github) because outages have been blocking real work, and the same sentence suddenly sounds evasive. His footnote says the issue is not Git but the surrounding infrastructure: issues, pull requests, Actions, and the rest of the working surface. That is the precise fracture. The repository is portable. The project is only partly portable.

Platform monoculture is usually described as a network-effect problem. Everyone is on GitHub because everyone is on GitHub. Contributors already have accounts there. Search points there. Recruiters look there. Badges, docs, package links, security advisories, stars, forks, and social proof all point there. That story is true, but it is too sociological. It makes lock-in sound like a coordination problem: we could move if enough people agreed to move.

The harder problem is structural coupling. Modern development workflows have turned many project properties into behavioral assertions made by the forge.

The pull request is approved because GitHub says it is approved. The CI passed because GitHub Actions says this run belongs to this commit under this repository policy. The deployment is authorized because GitHub's OIDC provider minted a token whose claims matched a cloud role. The release is trusted because a registry accepted a workflow identity instead of a long-lived API token. The action dependency is whatever the runner resolves when it sees `uses: owner/action@ref`. The cache is safe because the platform says the restored object belongs in this job.

Those are not just conveniences. They are facts the rest of the system consumes.

Mat Duggan's [imaginary replacement forge](https://matduggan.com/if-i-could-make-my-own-github/) is useful because it does not start with a manifesto about decentralization. It starts from irritation at workflow order and locality. He wants pre-push feedback instead of waiting for remote CI after a messy commit stack. He wants approval states that admit real review gradients instead of a boolean. He wants the local copy to include issues and review state, not only code. He wants actions to be signed, hashed, usable offline, and vendorable into the repository.

That list is more radical than it first looks. It is not merely "GitHub, but nicer." It asks which parts of the project state should be locally inspectable, replayable, and verifiable without trusting one hosted service to keep behaving. An approval that can be represented inside the versioned project state has a different failure mode from an approval that lives as a row in GitHub's database. A CI configuration whose action dependencies are content-addressed and available offline has a different failure mode from a workflow that asks a live platform to resolve mutable tags at run time. A review rule that can be audited locally has a different failure mode from a green check whose meaning depends on platform policy, runner behavior, token defaults, and UI state.

The usual answer is that GitHub is reliable enough and the alternatives are worse. That was a strong answer for a long time. Centralizing on GitHub bought enormous practical value: fewer bespoke Trac instances, fewer abandoned project homepages, fewer one-off auth systems, fewer mailing-list archaeology sessions. For small projects especially, GitHub converted infrastructure maintenance into a tab in the browser.

The inversion arrives when the reliable hub becomes the correlated failure domain. Hashimoto's complaint is not that monopoly is aesthetically impure. It is that the hub now blocks productive work. A project does not need a theory of platform capitalism when pull request review and Actions are unavailable for hours. The abstraction has leaked into the calendar.

That kind of failure is visible because it stops work. The supply-chain version is worse because it can keep working while the trust boundary has already moved.

Andrew Nesbitt's [GitHub Actions is the weakest link](https://nesbitt.io/2026/04/28/github-actions-is-the-weakest-link.html) catalogs the shape of the problem through incidents rather than doctrine: `pull_request_target` workflows executing untrusted code with elevated context, cache poisoning between an attacker-controlled workflow and a legitimate release job, mutable action tags, template expansion into shell scripts, write-scoped `GITHUB_TOKEN` defaults. The important part is that these are not exotic kernel bugs. They are documented features composed into unsafe systems.

That composition matters for portability. If a project says "we could leave GitHub," what exactly is being claimed?

The source can leave. The workflow file can leave. The issue text may be exportable. But the behavioral meaning of the workflow is not just the YAML. It includes GitHub's event model, token defaults, cache semantics, action resolution, runner image, secret scoping, permission inheritance, marketplace conventions, branch protection integration, review gates, and deployment identity. The YAML is a recipe whose semantics are supplied by the platform.

This is why GitHub Actions OIDC is such a clean example. OIDC trusted publishing is a real improvement over long-lived registry or cloud credentials stored as secrets. GitHub's own docs describe the pattern: a workflow requests a GitHub-minted OIDC token, the cloud provider validates claims such as subject and audience against a preconfigured trust rule, and the provider returns a short-lived token for that job. PyPI's [Trusted Publishers documentation](https://docs.pypi.org/trusted-publishers/adding-a-publisher/) similarly lets a project bind publishing rights to a trusted workflow identity rather than a manually managed password.

That removes one class of bad behavior. A leaked static token cannot sit in a repository secret for years if no static token exists.

It also concentrates a different class of authority. The registry or cloud now relies on a CI platform's assertion that this workflow, in this repo, at this ref, under these conditions, is the one allowed to publish or deploy. GitHub's OIDC reference recommends scoping trust with claims and conditions, and those controls matter. But the root claim still comes from GitHub's identity service. If the project migrates its forge, the external trust relationships have to be rebuilt. If the workflow semantics are compromised, the registry sees a valid identity. If the action graph is mutable, the job can be valid and still run the wrong code.[^oidc]

So the behavioral-portability claim is: we can move if we decide to.

The structural-lock-in fact is: many other systems have been taught to believe GitHub's statements about us.

That gap is the same failure pattern as the AGENTS.md scar tissue in agent workflows. A repository instruction file says what the agent should do: read the nearest guidance, avoid destructive edits, verify before finishing, stay inside scope. The file is useful because it externalizes the desired behavior. It is not a structural guarantee unless the execution environment makes disallowed actions impossible or expensive. Otherwise it is a behavioral assertion stapled to a system that can still forget, skip, misread, or override it under pressure.

GitHub portability has the same shape. The ecosystem repeats the structural fact it likes: Git is distributed. Then it builds daily practice around behavioral facts issued by a centralized platform: this PR is reviewed, this workflow is authorized, this cache is legitimate, this action ref resolves to acceptable code, this identity may publish. The slogan names the layer with the strongest exit property while work migrates to the layer with the weakest one.

The counterexamples are real enough to prevent an easy ending. Codeberg runs on Forgejo and is large enough to be a practical home for serious projects. Gentoo has begun a [Codeberg migration](https://planet.gentoo.org/?blog=86). Woodpecker CI supports multiple forges, including Forgejo, Gitea, GitLab, GitHub, and Bitbucket, and Codeberg documents [Woodpecker and self-hosted Forgejo Actions](https://docs.codeberg.org/ci/actions/) as current CI paths. Forgejo itself is also working on federation, and [NLnet describes the project](https://nlnet.nl/project/Forgejo/) as an open source forge focused on ActivityPub-based federated features.

Those examples matter because they show that "GitHub or chaos" is false. Distributed and self-hosted CI can work. Forgejo can host real projects. Codeberg can absorb real migrations. Woodpecker's forge matrix is a structural antidote to monoculture because the CI engine is not defined by a single forge's event model.

But the counterexamples also show the cost. Codeberg's Actions documentation says hosted Actions are limited because of security issues and bus factor, and recommends Woodpecker when hosted CI is needed. That is an honest tradeoff, not a disqualification. Moving away from a monoculture often means giving up the hidden subsidy of a giant platform that absorbed complexity until it became invisible. The work does not disappear. It becomes explicit again.

The real exit plan is therefore not "mirror the repository." It is "make the project assertions portable."

Can review state be exported, signed, or represented in project data? Can CI run in a second environment and produce comparable results? Are action dependencies pinned by content rather than resolved through mutable names? Can release authority move from GitHub OIDC to another trusted publisher without rethinking the whole deployment chain? Are cloud roles scoped to stable project identities rather than whatever repository string a platform happens to emit? Can issues, discussions, security advisories, and release metadata be mirrored in a form another forge can understand? Can contributors do useful work during a GitHub outage without waiting for the platform to recover?

These are boring questions in the right way. They turn exit from a mood into an engineering property.

The mistake is treating optionality as a statement about future willpower. "We could move" means little unless the path has been rehearsed at the layers where work actually happens. If the only portable object is the Git repository, then the project can leave as source code and arrive as a partial amnesiac with no trustworthy CI semantics, no deployment identity, no review continuity, and no local account of why the old green checks should still be believed.

GitHub does not need to be evil for that to be a problem. It only needs to be central, useful, and increasingly entangled with the facts other systems consume. Monoculture becomes dangerous before people decide to leave; it becomes dangerous when leaving requires replacing a set of platform behaviors everyone has quietly upgraded into structure.

The repository was never the whole project. It was the part we knew how to copy.

[^oidc]: OIDC federation is also part of the fix. GitLab supports CI job ID tokens, and PyPI supports multiple trusted publisher models rather than only GitHub. More issuers reduce monoculture at the registry boundary. They do not remove the deeper requirement: each issuer's claims, workflow semantics, runner isolation, and dependency resolution still have to be understood as part of the release authority.
