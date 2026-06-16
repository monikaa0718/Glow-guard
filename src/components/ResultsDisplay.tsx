import { motion } from "framer-motion";
import { Shield, AlertTriangle, XCircle, CheckCircle } from "lucide-react";

interface Ingredient {
  name: string;
  safety: "safe" | "caution" | "harmful";
  rating: number;
  description: string;
}

interface AnalysisResult {
  overall_score: number;
  summary: string;
  ingredients: Ingredient[];
}

interface ResultsDisplayProps {
  result: AnalysisResult;
}

const safetyConfig = {
  safe: {
    icon: CheckCircle,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    label: "Safe",
  },
  caution: {
    icon: AlertTriangle,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    label: "Caution",
  },
  harmful: {
    icon: XCircle,
    color: "text-red-500",
    bg: "bg-red-50",
    border: "border-red-200",
    label: "Harmful",
  },
};

const getScoreColor = (score: number) => {
  if (score >= 7) return "text-emerald-600";
  if (score >= 4) return "text-amber-600";
  return "text-red-500";
};

const getScoreGradient = (score: number) => {
  if (score >= 7) return "from-emerald-400 to-emerald-600";
  if (score >= 4) return "from-amber-400 to-amber-600";
  return "from-red-400 to-red-600";
};

const ResultsDisplay = ({ result }: ResultsDisplayProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-2xl mx-auto mt-8"
    >
      {/* Overall Score */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-2xl p-6 md:p-8 shadow-soft mb-6 text-center"
      >
        <div className="flex items-center justify-center gap-2 mb-3">
          <Shield className="w-6 h-6 text-primary" />
          <h3 className="font-display text-xl font-semibold text-foreground">Safety Score</h3>
        </div>
        <div className="relative inline-flex items-center justify-center w-28 h-28 mb-4">
          <svg className="w-28 h-28 -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(var(--border))" strokeWidth="8" />
            <motion.circle
              cx="60" cy="60" r="52" fill="none"
              strokeWidth="8"
              strokeLinecap="round"
              className={`stroke-current ${getScoreColor(result.overall_score)}`}
              strokeDasharray={`${2 * Math.PI * 52}`}
              initial={{ strokeDashoffset: 2 * Math.PI * 52 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 52 * (1 - result.overall_score / 10) }}
              transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
            />
          </svg>
          <span className={`absolute text-3xl font-display font-bold ${getScoreColor(result.overall_score)}`}>
            {result.overall_score}
          </span>
        </div>
        <p className="text-muted-foreground font-body text-sm max-w-md mx-auto">{result.summary}</p>
      </motion.div>

      {/* Ingredients List */}
      <div className="space-y-3">
        {result.ingredients.map((ingredient, i) => {
          const config = safetyConfig[ingredient.safety];
          const Icon = config.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.08 }}
              className={`glass rounded-xl p-4 border ${config.border} shadow-soft`}
            >
              <div className="flex items-start gap-3">
                <div className={`${config.bg} rounded-lg p-2 mt-0.5`}>
                  <Icon className={`w-4 h-4 ${config.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-display font-semibold text-foreground text-sm">
                      {ingredient.name}
                    </h4>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${config.bg} ${config.color}`}>
                        {config.label}
                      </span>
                      <div className="flex items-center gap-1">
                        <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full rounded-full bg-gradient-to-r ${getScoreGradient(ingredient.rating)}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${ingredient.rating * 10}%` }}
                            transition={{ delay: 0.6 + i * 0.08, duration: 0.5 }}
                          />
                        </div>
                        <span className={`text-xs font-medium ${getScoreColor(ingredient.rating)}`}>
                          {ingredient.rating}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-xs mt-1 font-body leading-relaxed">
                    {ingredient.description}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default ResultsDisplay;
