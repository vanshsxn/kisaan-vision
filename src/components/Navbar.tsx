import { motion } from "framer-motion";

const Navbar = () => {
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 glass-strong"
    >
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <div className="select-none leading-none">
          <div className="text-xl font-black tracking-wider text-foreground">
            KISAAN
          </div>
          <div className="text-xl font-black tracking-wider text-gradient-green">
            VISION
          </div>
        </div>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          {["Solutions", "Technology", "AI Lab", "Contact"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(" ", "-")}`}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-300"
            >
              {item}
            </a>
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="glass glow-green-subtle rounded-full px-5 py-2 text-sm font-semibold text-primary transition-all hover:glow-green"
        >
          Get Started
        </motion.button>
      </div>
    </motion.nav>
  );
};

export default Navbar;
