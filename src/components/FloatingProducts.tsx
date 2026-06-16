import { motion } from "framer-motion";
import lipstick from "@/assets/lipstick.png";
import compact from "@/assets/compact.png";
import perfume from "@/assets/perfume.png";
import serum from "@/assets/serum.png";

const products = [
  { src: lipstick, alt: "Lipstick", className: "top-[10%] left-[5%] w-20 md:w-28", delay: 0 },
  { src: compact, alt: "Compact", className: "top-[60%] right-[3%] w-16 md:w-24", delay: 1.5 },
  { src: perfume, alt: "Perfume", className: "bottom-[5%] left-[8%] w-18 md:w-24", delay: 0.8 },
  { src: serum, alt: "Serum", className: "top-[15%] right-[8%] w-14 md:w-20", delay: 2 },
];

const FloatingProducts = () => {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
      {products.map((product, i) => (
        <motion.img
          key={i}
          src={product.src}
          alt={product.alt}
          loading="lazy"
          className={`absolute opacity-20 ${product.className}`}
          animate={{
            y: [0, -20, -10, -25, 0],
            rotate: [0, 2, -1, 1.5, 0],
          }}
          transition={{
            duration: 6 + i,
            repeat: Infinity,
            ease: "easeInOut",
            delay: product.delay,
          }}
        />
      ))}
    </div>
  );
};

export default FloatingProducts;
