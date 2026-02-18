# Teardown: Video Storyboard Creator

A high-end video analysis tool that converts video files into visual storyboards with AI-driven phrase splitting and automatic frame capturing.

## 🚀 Getting Started

### Local Development
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory and add your Gemini API Key:
   ```env
   VITE_API_KEY=your_api_key_here
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

## 📦 Deployment to GitHub Pages

1. **Create a GitHub Repository**: Name it `teardown`.
2. **Set Secrets**: Go to your repository settings -> Secrets and Variables -> Actions. Add a "New repository secret":
   - Name: `VITE_API_KEY`
   - Value: `(Your Gemini API Key)`
3. **Build and Deploy**:
   You can run `npm run build` and push the `dist` folder, or set up a GitHub Action to do it automatically using the `vite.config.ts` provided.

## 🖼️ Embedding in Squarespace

To place this tool on your Squarespace site:

1. Copy your published GitHub Pages URL (e.g., `https://yourusername.github.io/teardown/`).
2. In Squarespace, add a **Code Block** or **Embed Block** to your page.
3. Paste the following iFrame code:

```html
<iframe 
  src="https://yourusername.github.io/teardown/" 
  style="width:100%; height:800px; border:none; border-radius:12px;" 
  allow="camera; microphone; clipboard-write"
  title="Teardown Video Storyboarder">
</iframe>
```

## 🐍 Python CLI Tool
The repository also includes `teardown.py`, a command-line version of the tool.
To use it:
```bash
export API_KEY='your_api_key'
python teardown.py path/to/video.mp4 --output my_storyboard
```
