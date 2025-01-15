# 🐝 Pollinations Hive
<!-- Placeholder for deployment simplification changes -->

Welcome to Pollinations Hive - a revolutionary repository where AI meets collaborative development! This project showcases a unique approach to software development where applications are created and modified entirely through AI assistance.

## 📱 Available Apps

| App | Source | Last Updated |
|-----|--------|--------------|
| [llm-feedback](https://pollinations.github.io/hive/llm-feedback/) | [./llm-feedback](./llm-feedback) | 2025-01-14 |
| [tarot-reader](https://pollinations.github.io/hive/tarot-reader/) | [./tarot-reader](./tarot-reader) | 2025-01-14 |
| [pollinations-image-show](https://pollinations.github.io/hive/pollinations-image-show/) | [./pollinations-image-show](./pollinations-image-show) | 2025-01-14 |
| [image-prompt](https://pollinations.github.io/hive/image-prompt/) | [./image-prompt](./image-prompt) | 2025-01-15 |
| [graphics-editor](https://pollinations.github.io/hive/graphics-editor/) | [./graphics-editor](./graphics-editor) | 2025-01-15 |
| [placeholder-generator](https://pollinations.github.io/hive/placeholder-generator/) | [./placeholder-generator](./placeholder-generator) | 2025-01-14 |
| [ai-chat](https://pollinations.github.io/hive/ai-chat/) | [./ai-chat](./ai-chat) | 2025-01-15 |
## 📚 Documentation

### 🔍 Pull Request Previews

Every pull request in this repository gets an automatic preview deployment. Here's how it works:

#### Triggers
- Preview deployments are created when a PR is opened, synchronized, or reopened
- The deployment workflow runs when changes are made to:
  - Any `package.json` file
  - Any `index.html` file
  - Any files within app directories

#### What Gets Deployed
- Each app in the repository is built and deployed
- For Node.js apps (with package.json):
  - The app is built using `npm run build`
  - Build output from `build/` or `dist/` is deployed
- For static sites (with index.html):
  - Files are copied directly to the preview

#### Accessing Previews
- Each PR gets a dedicated preview URL
- The GitHub Actions bot comments on the PR with preview links
- Preview URL format: `https://pollinations.github.io/hive/pr-{PR_NUMBER}/`
- Each preview includes an index page that lists all apps available in that preview
- You can find active PR previews by:
  1. Looking at open pull requests in the repository
  2. Finding the GitHub Actions bot comment with the preview link
  3. Visiting the index page at `https://pollinations.github.io/hive/pr-{PR_NUMBER}/`

## 🔍 Active PR Previews

| PR | Title | Preview |
|-----|--------|---------|
| [#123](https://github.com/pollinations/hive/pull/123) | Update package.json | [Preview](https://pollinations.github.io/hive/pr-123/) |

_This list is automatically updated when PRs are opened or closed._
## 🌈 Features
## 💡 Submit Your App Idea

Want to add your app to the Hive? It's easy:

1. Create an issue describing your app idea
2. Tag @MentatBot or check the box in its comment to start the AI-powered development
3. Provide feedback as the AI builds your app
4. Review and refine until your app is ready

The AI will handle all the coding - you just need to describe what you want!

## 🙏 Credits

This repository is powered by:

- [Mentat.ai](https://mentat.ai/) - The AI coding agent that enables automated development through GitHub
- [Pollinations AI Platform](https://pollinations.ai) - The AI platform ecosystem this repository is part of

## 🔗 Related Resources

- [API Documentation](POLLINATIONS_APIDOCS.md)
- [Code Examples](POLLINATIONS_CODE_EXAMPLES.MD)

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

Built with 🤖 by AI, guided by humans. Part of the [Pollinations](https://pollinations.ai) ecosystem.
