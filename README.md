🌾 Kisaan Vision Page
Kisaan Vision is a next-generation agriculture landing page built with React, Vite, and Framer Motion. It features a high-performance video-scrubbing (play-on-scroll) hero section that allows users to explore precision farming through an immersive drone-shot experience.

🚀 Key Features
Cinematic Video Scrubbing: Interactive hero section where the drone footage playback is synced directly to the user's scroll progress using Framer Motion and useScroll.

AI-Driven Interface: Deep-green aesthetic designed for modern AgTech solutions.

Responsive Design: Optimized for all screen sizes using Tailwind CSS.

Glassmorphism UI: High-end glass effects and green glow accents for a premium look.

🛠️ Tech Stack
Framework: React (Vite)

Styling: Tailwind CSS

Animations: Framer Motion

Icons: Lucide React

State Management: React Hooks (useRef, useEffect)

📦 Getting Started
1. Clone the repository
Bash
git clone https://github.com/vanshsxn/kisaan-vision-landing.git
cd kisaan-vision-landing
2. Install dependencies
Bash
npm install
3. Setup the Video
Since high-quality video files can be heavy for Git, follow these steps:

Place your hero-farm.mp4 in the public/ folder.

Ensure the video is encoded with a high keyframe frequency for smooth scrolling.

4. Run the development server
Bash
npm run dev
🎥 Implementation Detail: Play-on-Scroll
The core experience of this landing page is the "Scrub-on-Scroll" logic found in HeroSection.tsx. We map the scrollYProgress to the currentTime of the video:

JavaScript
useMotionValueEvent(scrollYProgress, "change", (latest) => {
  if (videoRef.current) {
    videoRef.current.currentTime = latest * videoRef.current.duration;
  }
});
🔗 Connect with MV Studios
Built with precision by MV Studios Japan.

Website: mvstudiosjapan.lovable.app

Instagram: @mvstudiosjapan

LinkedIn: Vansh Saxena

How to use this:
Create a new file in your root folder named README.md.

Copy and paste the text above into it.

Commit and push:

Bash
git add README.md
git commit -m "docs: add comprehensive readme"
git push