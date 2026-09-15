import { motion } from "framer-motion";

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-black">

      {/* Subtle neutral glow (x.ai style) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_right,_rgba(255,255,255,0.06),_transparent_60%)]"></div>

      {/* Outer fade-in */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-[90%] max-w-5xl h-[550px]
          bg-white/5 backdrop-blur-xl
          border border-white/10
          rounded-2xl shadow-2xl
          flex overflow-hidden"
      >

        {/* LEFT: Form (slides from left) */}
        <motion.div
          initial={{ x: -60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="w-full md:w-1/2 p-10 flex flex-col justify-center"
        >
          {children}
        </motion.div>

        {/* RIGHT: Image (slides from right) */}
        <motion.div
          initial={{ x: 60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="hidden md:flex w-1/2 items-center justify-center
            bg-white/[0.02]"
        >
          <div className="text-gray-500 text-sm">
            Image placeholder
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
}
