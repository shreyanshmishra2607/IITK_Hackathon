import { useEffect, useState } from "react";
import { motion } from "framer-motion"; // Import framer-motion

// const API_URL = import.meta.env.VITE_API_URL;

// Define TypeScript interface for API response
interface ClassificationScores {
  precision: number;
  recall: number;
  "f1-score": number;
  support: number;
}

interface ModelMetricsResponse {
  accuracy: number;
  roc_auc: number;
  classification_report: {
    [key: string]: ClassificationScores | number; // Allows dynamic access
  };
}

export default function ModelMetrics() {
  const [data, setData] = useState<ModelMetricsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const mockData: ModelMetricsResponse = {
      accuracy: 0.88,
      roc_auc: 0.9354291080524054,
      classification_report: {
        "0": { precision: 0.88, recall: 0.95, "f1-score": 0.91, support: 4974 },
        "1": { precision: 0.88, recall: 0.75, "f1-score": 0.81, support: 2514 },
        accuracy: 0.88,
        "macro avg": { precision: 0.88, recall: 0.85, "f1-score": 0.86, support: 7488 },
        "weighted avg": { precision: 0.88, recall: 0.88, "f1-score": 0.88, support: 7488 },
      },
    };

    setData(mockData);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <motion.div
        className="text-white text-center mt-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        Loading...
      </motion.div>
    );
  }

  return (
    <motion.div
      className="bg-gray-900 text-white p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h1 className="text-4xl font-bold mb-4 text-center">ML Model Metrics</motion.h1>
      <div className="bg-gray-800 p-6 rounded-lg shadow-md">
        <pre className="text-lg">Accuracy: {data?.accuracy.toFixed(2)}</pre>
        <pre className="text-lg">ROC AUC: {data?.roc_auc.toFixed(2)}</pre>

        <h2 className="text-xl font-semibold mt-4 mb-2">Classification Report</h2>
        <table className="w-full border-collapse border border-gray-700">
          <thead>
            <tr className="bg-gray-700 text-[0.625rem] md:text-md lg:text-lg">
              <th className="p-1 md:p-2  border border-gray-600">Label</th>
              <th className="p-1 md:p-2  border border-gray-600">Precision</th>
              <th className="p-1 md:p-2  border border-gray-600">Recall</th>
              <th className="p-1 md:p-2  border border-gray-600">F1-score</th>
              <th className="p-1 md:p-2  border border-gray-600">Support</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(data?.classification_report || {}).map(([label, scores]) => {
              if (typeof scores === "number") return null; // Skip "accuracy" key
              return (
                <motion.tr
                  key={label}
                  className="border border-gray-700 text-[0.625rem] md:text-md lg:text-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <td className="p-1 md:p-2  border border-gray-600 text-center">{label}</td>
                  <td className="p-1 md:p-2  border border-gray-600 text-center">{scores.precision?.toFixed(2) ?? "N/A"}</td>
                  <td className="p-1 md:p-2  border border-gray-600 text-center">{scores.recall.toFixed(2)}</td>
                  <td className="p-1 md:p-2 border border-gray-600 text-center">{scores["f1-score"].toFixed(2)}</td>
                  <td className="p-1 md:p-2  border border-gray-600 text-center">{scores.support}</td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}