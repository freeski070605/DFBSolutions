import { motion } from "framer-motion";

export default function AnimatedGridBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_5%,rgba(53,167,255,.22),transparent_30%),radial-gradient(circle_at_82%_10%,rgba(50,255,157,.16),transparent_24%),linear-gradient(180deg,#04070d_0%,#090f1a_48%,#04070d_100%)]" />
      <motion.div
        className="absolute inset-0 bg-control-grid bg-[length:42px_42px] opacity-[0.12]"
        animate={{ backgroundPosition: ["0px 0px", "42px 42px"] }}
        transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
      />
      <div className="noise-layer absolute inset-0 opacity-[0.09]" />
      <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-voltage/15 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black to-transparent" />
    </div>
  );
}
