module.exports = {
  extends: ['@commitlint/config-conventional'],
  // Ignore merge commits and other auto-generated commits that don't follow
  // conventional commit format (e.g. GitHub merge commits).
  ignores: [
    (commit) => typeof commit === 'string' && commit.startsWith('Merge'),
  ],
  rules: {
    'header-max-length': [0],
    'body-max-line-length': [0],
    'footer-max-line-length': [0],
  },
};
