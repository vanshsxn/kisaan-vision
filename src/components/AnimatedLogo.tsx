import { useEffect, useState } from "react";

const AnimatedLogo = () => {
  const [active, setActive] = useState(false);
  const word1 = "KISAAN".split("");
  const word2 = "VISION".split("");
  
  // Mapping unique animations to each letter index
  const anims = [
    "anim-balance", "anim-shrinkjump", "anim-falling", "anim-rotate", "anim-toplong", "anim-balance",
    "anim-shrinkjump", "anim-falling", "anim-rotate", "anim-toplong", "anim-balance", "anim-shrinkjump"
  ];

  useEffect(() => {
    // Short delay to ensure page is visible before animation starts
    const timer = setTimeout(() => setActive(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const renderLetter = (char: string, i: number, isGreen: boolean) => (
    <span
      key={i}
      className={`letter-anim font-black inline-block cursor-pointer ${isGreen ? "text-primary" : "text-white"} ${active ? anims[i] : ""}`}
      onClick={(e) => {
        // Re-trigger animation on click
        e.currentTarget.classList.remove(anims[i]);
        void e.currentTarget.offsetWidth; // Force reflow
        e.currentTarget.classList.add(anims[i]);
      }}
    >
      {char}
    </span>
  );

  return (
    <div className="flex flex-col items-center select-none leading-[0.8] overflow-visible py-4">
      <div className="text-4xl md:text-6xl flex gap-1 uppercase font-black tracking-tighter">
        {word1.map((c, i) => renderLetter(c, i, false))}
      </div>
      <div className="text-4xl md:text-6xl flex gap-1 uppercase font-black tracking-tighter">
        {word2.map((c, i) => renderLetter(c, i + 6, true))}
      </div>
    </div>
  );
};

export default AnimatedLogo;