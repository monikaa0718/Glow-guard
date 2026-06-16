import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import FloatingProducts from "@/components/FloatingProducts";
import IngredientInput from "@/components/IngredientInput";
import ResultsDisplay from "@/components/ResultsDisplay";

interface AnalysisResult {
  overall_score: number;
  summary: string;
  ingredients: {
    name: string;
    safety: "safe" | "caution" | "harmful";
    rating: number;
    description: string;
  }[];
}

const Index = () => {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyze = async (ingredients: string, imageBase64?: string, skinType?: string) => {
    setIsLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-ingredients", {
        body: { ingredients, imageBase64, skinType },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setResult(data);
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Failed to analyze ingredients. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-hero relative overflow-hidden">
      <FloatingProducts />

      <div className="relative z-10 container mx-auto px-4 py-8 md:py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 md:mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
          >
            <Sparkles className="w-4 h-4" />
            AI-Powered Analysis
          </motion.div>

          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-4 tracking-tight">
            Know What's{" "}
            <span className="bg-gradient-to-r from-primary to-rose-gold bg-clip-text text-transparent">
              On Your Skin
            </span>
          </h1>

          <p className="text-muted-foreground font-body text-base md:text-lg max-w-lg mx-auto leading-relaxed">
            Paste your ingredient list or snap a photo — we'll instantly tell you what's safe and what to avoid.
          </p>
        </motion.div>

        {/* Input */}
        <IngredientInput onAnalyze={handleAnalyze} isLoading={isLoading} />

        {/* Results */}
        {result && <ResultsDisplay result={result} />}

        {/* Footer hint */}
        {!result && !isLoading && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-center text-muted-foreground/60 text-xs mt-12 font-body"
          >
            Powered by AI · Results are for informational purposes only
          </motion.p>
        )}
      </div>
    </div>
  );
};

export default Index;
