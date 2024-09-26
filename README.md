# Medispeak

Medispeak is a powerful utility built in ReactJS that enables context-based voice autofill for medical forms. It can be used as a Chrome Extension or injected into any website, making it compatible with Electronic Medical Record (EMR) systems worldwide.

## Features

- Voice-to-text autofill for medical forms
- Compatible with any EMR system
- Available as a Chrome Extension
- Can be injected into any website
- Context-aware for improved accuracy
- Built with ReactJS and styled with TailwindCSS
- Powered by a Rails backend API

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Chrome browser (for extension use)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-username/medispeak.git
   cd medispeak
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Build the project:
   ```
   npm run build
   ```

4. For Chrome Extension use:
   - Open Chrome and navigate to `chrome://extensions`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `build` directory

## Usage

For website injection:
   - Include the built JavaScript file in your HTML:
     ```html
<script src="https://medispeak-app.pages.dev/assets/index.html.js" crossorigin="" type="module"></script>
     ```

## Development

### Available Scripts

- `npm run dev`: Starts the development server using Vite. Use this for local development and testing.
- `npm run build`: Builds the project for production. This creates optimized files in the `dist` directory.
- `npm run preview`: Serves the production build locally for preview before deployment.

To run the development server:

```
npm run dev
```

##
