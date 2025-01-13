# 🐝 Pollinations Hive

Welcome to Pollinations Hive - a revolutionary repository where AI meets collaborative development! This project showcases a unique approach to software development where applications are created and modified entirely through AI assistance.

## 🌟 Overview

Pollinations Hive is a collection of self-contained applications, each residing in its own folder at the root of the repository. What makes this repository special is:
- **100% AI-Generated Code**: Created through collaboration between humans and AI assistants
- **Automatic Deployment**: Each app is automatically deployed to its own subdomain
- **Simple App Creation**: Just add your app folder to the root directory

## 🤖 How It Works

1. **Issue-Driven Development**: All new features and modifications start with a GitHub issue
2. **AI Assistance**: Our AI coding assistant (@MentatBot) implements the requested features
3. **Interactive Refinement**: Developers can comment on issues to guide and refine the implementation
4. **Continuous Evolution**: The codebase grows and improves through this AI-human collaboration

## 📂 Repository Structure

Each folder in the root directory contains a self-contained application that is automatically deployed. This modular structure ensures:
- Clear separation of concerns
- Easy navigation
- Independent functionality
- Simplified maintenance
- Automatic deployment to unique subdomains

### Types of Apps Supported

1. **Static HTML Apps**
   - Create a folder in the root directory with an `index.html` file
   - Add any static assets (CSS, JavaScript, images)
   - Example: See `hello-world` folder

2. **Node.js/React Apps**
   - Create a folder in the root directory with a `package.json`
   - Include a `build` script for production builds
   - Example: See `react-example` folder

## 🚀 Getting Started

### Creating or Modifying an App

1. **Create a New App**
   - Create a new directory in the root of the repository
   - For static sites: Add an `index.html` file
   - For Node.js apps: Add a `package.json` with a `build` script

2. **Automatic Deployment**
   - Push your changes to the `main` branch
   - GitHub Actions will automatically:
     - Build Node.js apps if needed
     - Deploy all apps to GitHub Pages
     - Update the index page
   - Access your app at `https://{username}.github.io/hive/{app-name}/`

3. **App Types**
   - **Static HTML Apps**: Just add an `index.html` file
   - **Node.js/React Apps**: Include `package.json` with a `build` script

## 📚 Documentation

For detailed API documentation and examples:
- [API Documentation](POLLINATIONS_APIDOCS.md)
- [Code Examples](POLLINATIONS_CODE_EXAMPLES.MD)

## 🌈 Features

- **AI-Driven Development**: Leverage AI to implement features and fix bugs
- **Interactive Development**: Real-time collaboration between humans and AI
- **Self-Contained Apps**: Each application is independent and modular
- **Automatic Deployment**: Apps are deployed to `{app-name}.hive.pollinations.ai`
- **Version Control**: Full Git history of AI-generated changes
- **Community-Driven**: Open for contributions and improvements

### Deployment Features

- **Automatic Detection**: System detects when apps are added or modified
- **Smart Builds**: 
  - Static sites deploy directly
  - Node.js apps are built automatically
- **Efficient Updates**: Only changed apps are redeployed
- **Custom Domains**: Each app gets its own subdomain

## 🤝 Contributing

1. Create an issue describing your proposed change
2. Tag @MentatBot to begin implementation
3. Provide feedback on the AI's implementation
4. Review and refine through comments

## 🔗 Related Resources

- [Pollinations AI Platform](https://pollinations.ai)
- [API Documentation](POLLINATIONS_APIDOCS.md)
- [Code Examples](POLLINATIONS_CODE_EXAMPLES.MD)

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

Built with 🤖 by AI, guided by humans. Part of the [Pollinations](https://pollinations.ai) ecosystem.