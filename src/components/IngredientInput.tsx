import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Upload, X, Camera, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const SKIN_TYPES = ["Normal", "Oily", "Dry", "Combination", "Sensitive"] as const;
type SkinType = (typeof SKIN_TYPES)[number];

interface IngredientInputProps {
  onAnalyze: (ingredients: string, imageBase64?: string, skinType?: string) => void;
  isLoading: boolean;
}

const IngredientInput = ({ onAnalyze, isLoading }: IngredientInputProps) => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [skinType, setSkinType] = useState<SkinType | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImagePreview(result);
      setImageBase64(result.split(",")[1]);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleSubmit = () => {
    if (imageBase64) {
      onAnalyze("", imageBase64, skinType || undefined);
    } else if (text.trim()) {
      onAnalyze(text.trim(), undefined, skinType || undefined);
    }
  };

  const clearImage = () => {
    setImagePreview(null);
    setImageBase64(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="glass rounded-2xl p-6 md:p-8 shadow-soft">
        <div className="flex items-center gap-2 mb-4">
          <Search className="w-5 h-5 text-primary" />
          <h2 className="font-display text-lg font-semibold text-foreground">
            Check Your Ingredients
          </h2>
        </div>

        {/* Skin Type Selector */}
        <div className="mb-4">
          <p className="text-sm font-body text-muted-foreground mb-2">Select your skin type for personalized analysis:</p>
          <div className="flex flex-wrap gap-2">
            {SKIN_TYPES.map((type) => (
              <motion.button
                key={type}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSkinType(skinType === type ? null : type)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium font-body transition-all border ${
                  skinType === type
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-background/50 text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
                }`}
              >
                {type}
              </motion.button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {imagePreview ? (
            <motion.div
              key="image"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative mb-4"
            >
              <img
                src={imagePreview}
                alt="Ingredient label"
                className="w-full max-h-48 object-contain rounded-xl border border-border"
              />
              <button
                onClick={clearImage}
                className="absolute top-2 right-2 bg-foreground/80 text-primary-foreground rounded-full p-1 hover:bg-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ) : (
            <motion.div key="textarea" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste your ingredient list here... e.g. Water, Glycerin, Niacinamide, Sodium Lauryl Sulfate, Paraben..."
                className="w-full h-32 bg-background/50 border border-border rounded-xl p-4 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground placeholder:text-muted-foreground font-body text-sm transition-all"
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          <Button
            variant="outline"
            className="flex-1 gap-2 border-primary/20 text-primary hover:bg-primary/5"
            onClick={() => fileRef.current?.click()}
          >
            <Camera className="w-4 h-4" />
            Scan Label Photo
          </Button>
          <Button
            className="flex-1 gap-2 gradient-accent text-primary-foreground hover:opacity-90 transition-opacity"
            onClick={handleSubmit}
            disabled={isLoading || (!text.trim() && !imageBase64)}
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-4 h-4" />
              </motion.div>
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {isLoading ? "Analyzing..." : "Analyze"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default IngredientInput;
