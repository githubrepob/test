import { motion } from "framer-motion";
import PlasmaBackground from "../components/PlasmaBackground";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function ModuleLayout({ title, subtitle, children }) {
  return (
    <div className="relative min-h-screen text-slate-100 bg-[#090d16] font-body overflow-x-hidden">
      {/* Background */}
      <PlasmaBackground />

      {/* UI */}
      <Navbar />

      {/* Content */}
      <motion.main
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative z-10 pt-28 px-4 sm:px-8 max-w-6xl mx-auto min-h-[85vh] flex flex-col justify-between"
      >
        <div>
          {title && (
            <header className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">{title}</h1>
              {subtitle && (
                <p className="text-slate-400 text-sm tracking-wide max-w-2xl mt-2 font-normal">
                  {subtitle}
                </p>
              )}
            </header>
          )}

          {children}
        </div>
        
        <div className="mt-16">
          <Footer />
        </div>
      </motion.main>
    </div>
  );
}
