import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding 4 more demo projects...');

  // ── 1. Markdown Note App ─────────────────────────────────────────────────────
  let markdownNoteApp = await prisma.project.findFirst({
    where: { name: 'Markdown Note App' },
  });

  if (!markdownNoteApp) {
    markdownNoteApp = await prisma.project.create({
      data: {
        name: 'Markdown Note App',
        description:
          'A minimal markdown note-taking app with local-first storage and real-time sync across devices.',
        type: 'concept',
        status: 'completed',
      },
    });
    console.log('Created project: Markdown Note App');
  } else {
    console.log('Project "Markdown Note App" already exists — skipping creation.');
  }

  const existingMarkdownEval = await prisma.evaluation.findUnique({
    where: { projectId: markdownNoteApp.id },
  });

  if (!existingMarkdownEval) {
    await prisma.evaluation.create({
      data: {
        projectId: markdownNoteApp.id,
        totalScore: 38,
        verdict: 'NEEDS_WORK',
        summary:
          'The Markdown Note App tackles a well-understood problem but struggles to differentiate itself in a saturated market. The local-first approach is technically sound but the growth path remains unclear without a compelling monetization strategy.',
        techScore: 9,
        techAnalysis:
          'The local-first architecture using IndexedDB or SQLite is a solid technical choice that ensures offline reliability. Real-time sync adds complexity and would require a CRDT-based approach (like Yjs or Automerge) to handle conflicts gracefully. The markdown rendering stack is mature, but handling edge cases like large files and embedded media needs careful attention.\n\nStrengths: Offline-first design, proven markdown rendering libraries, lightweight footprint\nImprovements: Define CRDT strategy for sync conflicts, add end-to-end encryption for cloud sync, document the sync protocol',
        marketScore: 6,
        marketAnalysis:
          'The note-taking market is extremely crowded with dominant players like Obsidian, Notion, Roam Research, and Bear already offering markdown support and sync. Winning on minimalism alone is difficult unless the app targets a very specific niche. The local-first angle resonates with privacy-conscious users but is insufficient as a standalone differentiator.\n\nStrengths: Growing privacy-conscious user segment, demand for lightweight tools, open-source positioning possible\nImprovements: Identify a specific underserved niche (e.g., developers, researchers), add a unique feature that incumbents lack, study why users leave Obsidian or Bear',
        uxScore: 7,
        uxAnalysis:
          'Markdown note apps benefit from clean, distraction-free interfaces, and a minimal design philosophy aligns well with the target audience. The core writing experience should be excellent, but discoverability of advanced features and keyboard shortcuts needs deliberate design. Onboarding new users who are unfamiliar with markdown syntax can be a friction point.\n\nStrengths: Distraction-free writing focus, keyboard-first navigation potential, clean aesthetic\nImprovements: Add a markdown cheatsheet or inline hints for beginners, design a compelling first-run experience, ensure mobile responsiveness is polished',
        feasibilityScore: 8,
        feasibilityAnalysis:
          'Building a markdown editor with local storage is achievable for a solo developer using existing libraries like CodeMirror or ProseMirror. The real-time sync component significantly increases complexity and infrastructure cost. A phased approach — ship local-only first, then add sync — is the most realistic path.\n\nStrengths: Well-defined scope for v1, excellent open-source libraries available, no AI/ML complexity required\nImprovements: Defer sync to v2 and validate local-only first, plan for cross-platform (Electron/Tauri vs. PWA), estimate infrastructure cost for sync backend',
        growthScore: 4,
        growthAnalysis:
          'User acquisition in the note-taking space relies heavily on word-of-mouth and community presence, but breaking through requires either a viral feature or strong niche positioning. Monetization options are limited — one-time purchase, subscription, or open-source with a hosted tier — all of which face resistance from free alternatives. Growth will be slow without a distinctive hook.\n\nStrengths: Open-source strategy can build community, developer communities are vocal advocates, plugin ecosystem could drive engagement\nImprovements: Define a monetization model before launch, engage early in note-taking communities (Reddit, HN), consider a freemium cloud sync tier',
        riskScore: 4,
        riskAnalysis:
          'The biggest risk is building a product that is functionally complete but commercially irrelevant due to strong competition. Technical risks around sync reliability and data loss could erode user trust quickly. Sustaining long-term development as a solo project without revenue is also a significant concern.\n\nStrengths: No regulatory or legal risks, low infrastructure costs for local-only version, proven technical patterns\nImprovements: Conduct user interviews before full development, set clear success metrics for the first 3 months, have a data backup strategy from day one',
      },
    });
    console.log('Created evaluation for: Markdown Note App');
  } else {
    console.log('Evaluation for "Markdown Note App" already exists — skipping.');
  }

  // ── 2. DevOps Dashboard ──────────────────────────────────────────────────────
  let devOpsDashboard = await prisma.project.findFirst({
    where: { name: 'DevOps Dashboard' },
  });

  if (!devOpsDashboard) {
    devOpsDashboard = await prisma.project.create({
      data: {
        name: 'DevOps Dashboard',
        description:
          'A unified dashboard for monitoring CI/CD pipelines, deployments, and infrastructure health across multiple cloud providers.',
        type: 'github',
        githubUrl: 'https://github.com/example/devops-dash',
        status: 'completed',
      },
    });
    console.log('Created project: DevOps Dashboard');
  } else {
    console.log('Project "DevOps Dashboard" already exists — skipping creation.');
  }

  const existingDevOpsEval = await prisma.evaluation.findUnique({
    where: { projectId: devOpsDashboard.id },
  });

  if (!existingDevOpsEval) {
    await prisma.evaluation.create({
      data: {
        projectId: devOpsDashboard.id,
        totalScore: 65,
        verdict: 'CONDITIONAL_PASS',
        summary:
          'DevOps Dashboard shows strong technical execution and addresses a real pain point for engineering teams managing multi-cloud environments. The main challenge is differentiating against entrenched players like Datadog, Grafana, and PagerDuty, but a focused open-source strategy could carve out a meaningful niche.',
        techScore: 15,
        techAnalysis:
          'The repository demonstrates solid architectural decisions with a plugin-based provider system that cleanly abstracts AWS, GCP, and Azure integrations. The use of WebSockets for real-time pipeline status updates is appropriate, and the backend shows good separation of concerns between data collection, aggregation, and presentation layers. Code quality is above average with consistent typing and reasonable test coverage around the integration adapters.\n\nStrengths: Clean plugin architecture for multi-cloud support, real-time data via WebSockets, strong TypeScript typing throughout\nImprovements: Increase test coverage for edge cases in CI/CD webhook parsing, add circuit breaker patterns for provider API failures, document the adapter interface for third-party contributors',
        marketScore: 13,
        marketAnalysis:
          'The DevOps observability market is large and growing, driven by increasing infrastructure complexity and the shift to multi-cloud. While Datadog dominates enterprise, there is genuine demand for open-source and self-hosted alternatives from cost-sensitive teams and privacy-conscious organizations. Grafana has proven this market exists, but differentiation requires either superior UX, better integrations, or a compelling open-core business model.\n\nStrengths: Large addressable market, strong demand from mid-market engineering teams, open-source positioning creates distribution advantages\nImprovements: Identify the specific Datadog/Grafana pain points this solves better, define an enterprise tier with RBAC and SSO, study successful open-source DevOps tools like Netdata or Upptime',
        uxScore: 9,
        uxAnalysis:
          'The dashboard UI shows good information density without feeling overwhelming, and the ability to customize widget layouts is a strong usability feature. Alert configuration is more complex than necessary — multiple clicks to set up a simple threshold alert is a friction point compared to PagerDuty. The mobile view is functional but not optimized for the on-call use case where engineers may be checking status from their phones.\n\nStrengths: Customizable dashboard layouts, clear visual hierarchy in status indicators, good use of color coding for health states\nImprovements: Simplify alert setup to a 2-step flow, optimize the mobile on-call view with larger touch targets, add a global search across all pipelines and services',
        feasibilityScore: 10,
        feasibilityAnalysis:
          'The core technical work is largely complete based on the repository state, with functioning integrations for major CI systems (GitHub Actions, GitLab CI, Jenkins) and cloud providers. Achieving production-level reliability for enterprise use will require additional hardening around authentication, high availability, and data retention. A self-hosted deployment path using Docker Compose is already present, which reduces the barrier to adoption.\n\nStrengths: Core integrations already implemented, Docker-based deployment ready, active development velocity visible in commit history\nImprovements: Add SAML/SSO support for enterprise adoption, implement data retention policies and archival, create a Helm chart for Kubernetes deployments',
        growthScore: 9,
        growthAnalysis:
          'Open-source DevOps tools have proven distribution channels through GitHub stars, Hacker News, and developer communities. The project could benefit from a clear open-core model where the base dashboard is free and enterprise features (SSO, team management, audit logs) are paid. Partnerships with cloud providers or CI vendors for featured integrations could accelerate adoption significantly.\n\nStrengths: Open-source strategy leverages developer word-of-mouth, self-hosted option appeals to compliance-sensitive organizations, strong use case for engineering blog content\nImprovements: Launch on Product Hunt and Hacker News Show HN, define the open-core paid tier, create integration badges for popular CI platforms',
        riskScore: 9,
        riskAnalysis:
          'The primary competitive risk is that Grafana or Datadog improves their CI/CD native integrations, reducing the differentiation gap. Technical risks center on maintaining reliable integrations as cloud provider APIs evolve — each breaking change requires immediate patches to avoid user churn. Security risks are significant since the dashboard has access to sensitive infrastructure credentials and deployment systems.\n\nStrengths: Modular architecture reduces blast radius of API changes, open-source model allows community-driven integration maintenance, no novel security research required\nImprovements: Implement secrets management using Vault or cloud KMS instead of environment variables, establish a security disclosure policy, plan for versioned integration adapters to handle API migrations gracefully',
      },
    });
    console.log('Created evaluation for: DevOps Dashboard');
  } else {
    console.log('Evaluation for "DevOps Dashboard" already exists — skipping.');
  }

  // ── 3. Recipe Social Network ─────────────────────────────────────────────────
  let recipeSocialNetwork = await prisma.project.findFirst({
    where: { name: 'Recipe Social Network' },
  });

  if (!recipeSocialNetwork) {
    recipeSocialNetwork = await prisma.project.create({
      data: {
        name: 'Recipe Social Network',
        description:
          'A social platform where home cooks share recipes, follow each other, and get AI-powered meal planning suggestions.',
        type: 'concept',
        status: 'completed',
      },
    });
    console.log('Created project: Recipe Social Network');
  } else {
    console.log('Project "Recipe Social Network" already exists — skipping creation.');
  }

  const existingRecipeEval = await prisma.evaluation.findUnique({
    where: { projectId: recipeSocialNetwork.id },
  });

  if (!existingRecipeEval) {
    await prisma.evaluation.create({
      data: {
        projectId: recipeSocialNetwork.id,
        totalScore: 47,
        verdict: 'NEEDS_WORK',
        summary:
          'The Recipe Social Network concept combines two proven categories — recipe sharing and social networking — but faces fierce competition from AllRecipes, Yummly, and TikTok\'s cooking content. The AI meal planning angle is the most compelling differentiator, but it needs to be the primary value proposition rather than a secondary feature.',
        techScore: 10,
        techAnalysis:
          'Building a recipe social platform requires standard CRUD infrastructure plus image handling, a recommendation engine, and AI integration for meal planning. The technical stack is straightforward but the AI meal planning feature introduces real complexity around personalization, dietary restriction handling, and ingredient-based recipe matching. Scaling image storage and delivery for user-generated recipe photos will require a CDN strategy from the start.\n\nStrengths: Well-understood technical domain, many open-source components available (recipe parsers, ingredient databases), AI APIs make meal planning feasible without ML expertise\nImprovements: Design the data model to support structured ingredients from day one (not just free text), plan CDN and image optimization early, define how AI meal plans handle dietary restrictions and allergies',
        marketScore: 9,
        marketAnalysis:
          'The recipe and food content market is enormous but dominated by SEO-optimized sites like AllRecipes and Epicurious, and increasingly by short-form video on TikTok and YouTube Shorts. Pure recipe sharing is a solved problem, but the combination of social following and AI-powered personalization could appeal to health-conscious meal preppers. Yummly\'s acquisition by Whirlpool shows strategic interest in this space, validating the market.\n\nStrengths: Large passionate food community, proven engagement patterns in recipe content, AI personalization is a genuine unmet need\nImprovements: Conduct user research to validate AI meal planning willingness-to-pay, define the specific user persona beyond "home cooks", analyze why Yummly and Allrecipes users are dissatisfied',
        uxScore: 8,
        uxAnalysis:
          'Recipe apps live or die by their visual design — beautiful food photography and clean recipe layouts drive engagement. The social following mechanic is familiar but needs to feel more like a community than a feed clone. The AI meal planning feature needs a delightful onboarding flow where users input preferences and see immediate value, not a buried settings screen.\n\nStrengths: Clear visual content format (recipes are inherently visual), familiar social patterns reduce learning curve, meal planning is a high-frequency use case\nImprovements: Invest heavily in recipe card design and food photography guidelines, make the AI meal planner the first-run experience, add a "cook mode" with large text and step-by-step navigation for use while cooking',
        feasibilityScore: 7,
        feasibilityAnalysis:
          'Building the social platform layer is feasible for a small team, but achieving the quality bar needed to compete with established recipe sites is significant. The AI meal planning feature depends on reliable ingredient parsing and a robust recipe database — either building this from scratch or licensing a third-party API adds cost and complexity. Moderating user-generated content at scale is an underestimated operational challenge.\n\nStrengths: Social platform patterns are well-understood, AI meal planning can leverage existing recipe APIs (Spoonacular, Edamam), MVP scope is cuttable\nImprovements: License a recipe ingredient database rather than building one, define moderation policies and tooling before launch, plan for the cold-start problem with a curated seed recipe collection',
        growthScore: 7,
        growthAnalysis:
          'Food content has natural virality through beautiful photos and shareable recipes, giving the platform organic growth channels. However, attracting creators away from established platforms requires a compelling creator proposition — better tools, a more engaged audience, or direct monetization. The AI meal planning feature could drive subscription revenue if it demonstrably saves users time and reduces food waste.\n\nStrengths: Food content naturally shareable on social media, potential for meal prep community to drive weekly active usage, AI feature is a defensible premium tier\nImprovements: Design a creator monetization program to attract top food bloggers, integrate with grocery delivery APIs (Instacart, Kroger) as a growth lever, build a referral mechanic around meal plan sharing',
        riskScore: 6,
        riskAnalysis:
          'The competitive landscape is the biggest risk — without a clear wedge into the market, user acquisition costs will be high and retention will be challenging. AI-generated meal plans introduce liability concerns around dietary advice and allergen information that need careful legal review. Content moderation and user-generated content policies are operationally expensive and legally important.\n\nStrengths: No novel technical risks, food content moderation is a solved operational problem, no regulatory barriers to entry\nImprovements: Consult a food/health attorney about AI dietary recommendation liability, define content moderation policies and tooling before launch, add prominent allergen disclaimers to AI-generated meal plans',
      },
    });
    console.log('Created evaluation for: Recipe Social Network');
  } else {
    console.log('Evaluation for "Recipe Social Network" already exists — skipping.');
  }

  // ── 4. API Rate Limiter (pending — no evaluation) ────────────────────────────
  const existingRateLimiter = await prisma.project.findFirst({
    where: { name: 'API Rate Limiter' },
  });

  if (!existingRateLimiter) {
    await prisma.project.create({
      data: {
        name: 'API Rate Limiter',
        description:
          'A lightweight, Redis-backed API rate limiting library with sliding window algorithm and distributed support.',
        type: 'github',
        githubUrl: 'https://github.com/example/rate-limiter',
        status: 'pending',
      },
    });
    console.log('Created project: API Rate Limiter (pending — no evaluation)');
  } else {
    console.log('Project "API Rate Limiter" already exists — skipping creation.');
  }

  console.log('\nDone. 4 demo projects processed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
