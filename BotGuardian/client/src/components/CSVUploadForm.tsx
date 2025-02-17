import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import { cn } from '@/lib/utils';

interface CSVUploadFormProps {
  onSubmit: (file: File) => void;
}

interface AnalysisResult {
  id: string;
  bot_probability: number;
}


// const Progress = React.forwardRef<
//   React.ElementRef<typeof ProgressPrimitive.Root>,
//   React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
// >(({ className, value, ...props }, ref) => (
//   <ProgressPrimitive.Root
//     ref={ref}
//     className={cn(
//       'relative h-4 w-full overflow-hidden rounded-full bg-gray-700',
//       className
//     )}
//     {...props}
//   >
//     <ProgressPrimitive.Indicator
//       className="h-full w-full flex-1 bg-blue-500 transition-all"
//       style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
//     />
//   </ProgressPrimitive.Root>
// ));
// Progress.displayName = ProgressPrimitive.Root.displayName;

export const CSVUploadForm: React.FC<CSVUploadFormProps> = ({ onSubmit }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult[]>([]); // Initialize as an empty array
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (selectedFile) {
      const formData = new FormData();
      formData.append('file', selectedFile);

      setIsLoading(true);
      setError(null);
      setAnalysisResult([]); // Reset to an empty array

      try {
        const response = await fetch('http://localhost:8000/predict-csv/', {
          method: 'POST',
          body: formData,
        });
        if (response.ok) {
          const result = await response.json();
          setAnalysisResult(result.results); // Assuming the result contains an array of objects with 'username' and 'score' fields
          onSubmit(selectedFile);
        } else {
          console.error('File upload failed:', response.statusText);
          setError('File upload failed: ' + response.statusText);
        }
      } catch (error) {
        console.error('Error uploading file:', error);
        setError('Error analyzing Twitter handle: ' + (error as Error).message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getLabel = (score: number) => (score > 50 ? 'Bot' : 'User');

  const handleResult = (result: AnalysisResult) => {
    return (
      <motion.div
        key={result.id}
        className="mb-2 flex items-center justify-between"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-sm w-1/3 font-medium">{result.id}</p>
        <p className="text-sm w-1/3 font-medium">{result.bot_probability}%</p>
        <p className="text-sm w-1/3 font-medium">{getLabel(result.bot_probability)}</p>
      </motion.div>
    );
  };

  return (
    <div className="bg-gray-900 text-white p-6 rounded-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
        />
        {selectedFile && (
          <p className="text-sm text-gray-400">Selected file: {selectedFile.name}</p>
        )}
        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          disabled={isLoading}
        >
          {isLoading ? 'Uploading...' : 'Upload CSV'}
        </button>
      </form>
      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-md">
          <h2 className="text-lg font-semibold">Error</h2>
          <p>{error}</p>
        </div>
      )}
      {analysisResult.length > 0 && (
        <motion.div
          className="mt-4 p-4 bg-gray-800 rounded-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">Analysis Result</motion.h2>
          {analysisResult.map((result, index) => (
            <React.Fragment key={index}>
              {handleResult(result)}
            </React.Fragment>
          ))}
        </motion.div>
      )}
    </div>
  );
};