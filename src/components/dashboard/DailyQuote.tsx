
import { Sparkles } from "lucide-react";
import { getDailyQuote } from "@/lib/utils";

interface DailyQuoteProps {
  show: boolean;
}

export const DailyQuote = ({ show }: DailyQuoteProps) => {
  if (!show) return null;
  
  const motivationalQuote = getDailyQuote();
  
  return (
    <div className="mb-8 animate-fade-in">
      <div className="bg-white/80 dark:bg-gray-800/60 p-6 rounded-xl border border-border backdrop-blur-sm card-gradient">
        <div className="flex items-center justify-center mb-2">
          <Sparkles className="h-5 w-5 text-yellow-400 mr-2" />
          <h3 className="text-sm font-medium text-primary-700 dark:text-primary-300">DAILY INSPIRATION</h3>
        </div>
        <p className="italic font-medium text-lg text-gray-700 dark:text-gray-300">
          "{motivationalQuote}"
        </p>
      </div>
    </div>
  );
};
