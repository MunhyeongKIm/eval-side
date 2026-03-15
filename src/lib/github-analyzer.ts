import { RepoAnalysis } from './types';

const GITHUB_API = 'https://api.github.com';

export function parseGithubUrl(url: string): { owner: string; repo: string } | null {
  const match = url.match(/github\.com\/([\w.-]+)\/([\w.-]+)/);
  if (!match) return null;
  return { owner: match[1], repo: match[2].replace(/\.git$/, '') };
}

async function githubFetch(path: string): Promise<Response> {
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'SideProjectEvaluator/1.0',
  };

  const token = process.env.GITHUB_TOKEN;
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${GITHUB_API}${path}`, { headers });

  if (res.status === 403 || res.status === 429) {
    throw new Error('GitHub API rate limit exceeded. Set GITHUB_TOKEN env var for higher limits.');
  }

  return res;
}

export async function analyzeRepo(url: string): Promise<RepoAnalysis> {
  const parsed = parseGithubUrl(url);
  if (!parsed) throw new Error(`Invalid GitHub URL: ${url}`);

  const { owner, repo } = parsed;

  // Fetch repo info, README, tree, commits, issues, pulls, languages in parallel
  const [repoRes, readmeRes, treeRes, commitsRes, issuesRes, pullsRes, languagesRes] = await Promise.all([
    githubFetch(`/repos/${owner}/${repo}`),
    githubFetch(`/repos/${owner}/${repo}/readme`),
    githubFetch(`/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`),
    githubFetch(`/repos/${owner}/${repo}/commits?per_page=30`),
    githubFetch(`/repos/${owner}/${repo}/issues?state=open&per_page=100`),
    githubFetch(`/repos/${owner}/${repo}/pulls?state=open&per_page=100`),
    githubFetch(`/repos/${owner}/${repo}/languages`),
  ]);

  const repoData = await repoRes.json();

  // README
  let readme = '';
  if (readmeRes.ok) {
    const readmeData = await readmeRes.json();
    readme = Buffer.from(readmeData.content || '', 'base64').toString('utf-8');
  }

  // Languages
  let languages: Record<string, number> | undefined;
  if (languagesRes.ok) {
    const langData: Record<string, number> = await languagesRes.json();
    const totalBytes = Object.values(langData).reduce((a, b) => a + b, 0);
    if (totalBytes > 0) {
      languages = {};
      for (const [lang, bytes] of Object.entries(langData)) {
        languages[lang] = Math.round((bytes / totalBytes) * 100);
      }
    }
  }

  // Directory structure
  let directoryStructure: string[] = [];
  let hasTests = false;
  let hasCICD = false;
  let hasTypeScript = false;
  let hasLinting = false;
  let dependencies: Record<string, string> = {};

  if (treeRes.ok) {
    const treeData = await treeRes.json();
    directoryStructure = (treeData.tree || [])
      .filter((item: { type: string }) => item.type === 'blob')
      .map((item: { path: string }) => item.path)
      .slice(0, 200);

    hasTests = directoryStructure.some((p: string) =>
      /\.(test|spec)\.(ts|js|tsx|jsx)$/.test(p) ||
      p.includes('__tests__') ||
      p.includes('/tests/') ||
      p.includes('/test/')
    );

    hasCICD = directoryStructure.some((p: string) =>
      p.includes('.github/workflows') ||
      p === '.gitlab-ci.yml' ||
      p === 'Jenkinsfile' ||
      p === '.circleci/config.yml'
    );

    hasTypeScript = directoryStructure.some((p: string) =>
      p === 'tsconfig.json' || p.startsWith('tsconfig.')
    );

    hasLinting = directoryStructure.some((p: string) =>
      p.match(/^\.eslintrc/) !== null ||
      p === '.eslintrc.json' ||
      p === '.eslintrc.js' ||
      p === '.eslintrc.cjs' ||
      p === 'eslint.config.js' ||
      p === 'eslint.config.mjs' ||
      p === 'eslint.config.ts' ||
      p === '.prettierrc' ||
      p === 'biome.json'
    );

    // Try to find and parse package.json for dependencies
    const hasPkgJson = directoryStructure.includes('package.json');
    if (hasPkgJson) {
      try {
        const pkgRes = await githubFetch(`/repos/${owner}/${repo}/contents/package.json`);
        if (pkgRes.ok) {
          const pkgData = await pkgRes.json();
          const pkgContent = JSON.parse(Buffer.from(pkgData.content, 'base64').toString('utf-8'));
          dependencies = { ...pkgContent.dependencies, ...pkgContent.devDependencies };
        }
      } catch { /* ignore parse errors */ }
    }
  }

  // Commits
  let recentCommitCount = 0;
  let lastCommitDate: string | null = null;
  let commitFrequency: 'daily' | 'weekly' | 'monthly' | 'inactive' | undefined;
  if (commitsRes.ok) {
    const commits = await commitsRes.json();
    recentCommitCount = Array.isArray(commits) ? commits.length : 0;
    if (Array.isArray(commits) && commits.length > 0) {
      lastCommitDate = commits[0]?.commit?.committer?.date || null;

      // Calculate commit frequency
      if (commits.length === 1) {
        commitFrequency = 'inactive';
      } else if (commits.length >= 2) {
        const firstDate = new Date(commits[commits.length - 1]?.commit?.committer?.date);
        const lastDate = new Date(commits[0]?.commit?.committer?.date);
        const daySpan = Math.max(1, (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24));
        const commitsPerDay = commits.length / daySpan;

        if (commitsPerDay >= 1) commitFrequency = 'daily';
        else if (commitsPerDay >= 1 / 7) commitFrequency = 'weekly';
        else if (commitsPerDay >= 1 / 30) commitFrequency = 'monthly';
        else commitFrequency = 'inactive';
      }
    }
  }

  // Issues and PRs
  const openIssues = issuesRes.ok ? (await issuesRes.json()).length : 0;
  const openPRs = pullsRes.ok ? (await pullsRes.json()).length : 0;

  return {
    name: repoData.name || repo,
    description: repoData.description || '',
    url,
    stars: repoData.stargazers_count || 0,
    forks: repoData.forks_count || 0,
    language: repoData.language || null,
    topics: repoData.topics || [],
    license: repoData.license?.spdx_id || null,
    readme,
    hasTests,
    hasCICD,
    directoryStructure,
    dependencies,
    recentCommitCount,
    openIssues,
    openPRs,
    lastCommitDate,
    createdAt: repoData.created_at || '',
    updatedAt: repoData.updated_at || '',
    // Enhanced fields
    languages,
    hasTypeScript,
    hasLinting,
    commitFrequency,
  };
}
