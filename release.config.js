module.exports = {
  branches: ["main"],
  plugins: [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    [
      "@semantic-release/changelog",
      {
        changelogFile: "CHANGELOG.md"
      }
    ],
    [
      "@semantic-release/npm",
      {
        npmPublish: false
      }
    ],
    [
      "@semantic-release/exec",
      {
        prepareCmd: "npm version ${nextRelease.version} --prefix Frontend --no-git-tag-version --allow-same-version && npm version ${nextRelease.version} --prefix Backend --no-git-tag-version --allow-same-version"
      }
    ],
    [
      "@semantic-release/git",
      {
        assets: [
          "package.json",
          "CHANGELOG.md",
          "Frontend/package.json",
          "Backend/package.json"
        ],
        message: "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}"
      }
    ],
    "@semantic-release/github"
  ]
};
