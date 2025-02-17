import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader } from "@/components/ui/Loader";
import { motion } from "framer-motion";

const formSchema = z.object({
  handle: z
    .string()
    .min(1, "Twitter handle is required")
    .regex(/^[A-Za-z0-9_]{1,15}$/, "Invalid Twitter handle format"),
});

interface TwitterFormProps {
  onSubmit: (handle: string) => void;
}

interface AnalysisResult {
  id: string;
  bot_probability: number;
}

export function TwitterForm({ onSubmit }: TwitterFormProps) {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Hook form initialization
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      handle: "",
    },
  });

  async function handleSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    
    try {
      console.log("Sending request with payload:", { username: values.handle });

      // Create FormData (since FastAPI expects form-data)
      const formData = new FormData();
      formData.append("username", values.handle);

      const response = await fetch("http://localhost:8000/predict-user/", {
        method: "POST",
        body: formData, // Send form-data instead of JSON
      });

      if (response.ok) {
        const result = await response.json();
        setAnalysisResult(result);
        onSubmit(values.handle);
      } else {
        console.error("Analysis failed:", response.statusText);
        setError("Analysis failed: " + response.statusText);
      }
    } catch (error) {
      console.error("Error analyzing Twitter handle:", error);
      setError("Error analyzing Twitter handle: " + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  const getLabel = (probability: number) => {
    return probability > 50 ? "Bot" : "Human";
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="handle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Twitter Handle</FormLabel>
                <FormControl>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-2.5 text-muted-foreground">@</span>
                      {/* Ensure correct field binding */}
                      <Input
                        {...field}
                        value={field.value}
                        onChange={field.onChange}
                        className="pl-7"
                        placeholder="username"
                      />
                    </div>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? <Loader /> : "Analyze"}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-md">
          <h2 className="text-lg font-semibold">Error</h2>
          <p>{error}</p>
        </div>
      )}

      {analysisResult && (
        <motion.div className="mt-4 p-4 bg-gray-800 text-white rounded-md">
          <motion.h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">
            Analysis Result
          </motion.h2>
          <motion.div
            key={analysisResult.id}
            className="mb-2 flex items-center justify-between"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-sm w-1/3 font-medium">{analysisResult.id}</p>
            <p className="text-sm w-1/3 font-medium">{analysisResult.bot_probability}%</p>
            <p className="text-sm w-1/3 font-medium">{getLabel(analysisResult.bot_probability)}</p>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
