import { Card, CardContent } from "@/components/ui/card";
// import { BotAnalysis } from "@/components/BotAnalysis";
import { TwitterForm } from "@/components/TwitterForm";
import { CSVUploadForm } from "@/components/CSVUploadForm";
import { useState } from "react";
import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {  
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function Home() {
  const [selectedHandle, setSelectedHandle] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [selectedForm, setSelectedForm] = useState<'twitter' | 'csv'>('twitter');

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-7xl mx-auto"
      >
        <motion.span 
          variants={item}
          className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text"
        >
          BotGuardian
        </motion.span>
        <motion.p 
          variants={item}
          className="text-muted-foreground mb-8"
        >
          Analyze twitter accounts to detect automated behavior and bot patterns.
        </motion.p>

        <motion.div variants={item} className="mb-8">
          <div className="flex items-center space-x-4">
            <label className="flex items-center cursor-pointer">
              <motion.input
                type="radio"
                name="formSelector"
                value="twitter"
                checked={selectedForm === 'twitter'}
                onChange={() => setSelectedForm('twitter')}
                className="form-radio hidden"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              />
              <motion.span
                className={`w-4 h-4 rounded-full border-2 border-blue-500 flex items-center justify-center ${selectedForm === 'twitter' ? 'bg-blue-500' : ''}`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {selectedForm === 'twitter' && <span className="w-2 h-2 bg-white rounded-full"></span>}
              </motion.span>
              <span className="ml-2">Twitter Form</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <motion.input
                type="radio"
                name="formSelector"
                value="csv"
                checked={selectedForm === 'csv'}
                onChange={() => setSelectedForm('csv')}
                className="form-radio hidden"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              />
              <motion.span
                className={`w-4 h-4 rounded-full border-2 border-blue-500 flex items-center justify-center ${selectedForm === 'csv' ? 'bg-blue-500' : ''}`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {selectedForm === 'csv' && <span className="w-2 h-2 bg-white rounded-full"></span>}
              </motion.span>
              <span className="ml-2">CSV Upload Form</span>
            </label>
          </div>
        </motion.div>

        {selectedForm === 'twitter' && (
          <motion.div variants={item}>
            <Card className="backdrop-blur-sm bg-card/50">
              <CardContent className="pt-6">
                <TwitterForm onSubmit={setSelectedHandle} />
              </CardContent>
            </Card>
          </motion.div>
        )}

        {selectedForm === 'csv' && (
          <motion.div variants={item} className="mt-8">
            <Card className="backdrop-blur-sm bg-card/50">
              <p className="text-md font-bold text-cyan-700 px-6 py-2">Note: Selected file should be in following format {"{id, default_profile, favourites_count, followers_count, friends_count, geo_enabled, statuses_count, verified, average_tweets_per_day, account_age_days}"} </p>
              <CardContent className="pt-6">
                <CSVUploadForm onSubmit={setUploadedFile} />
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* {selectedHandle && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8"
          >
            <BotAnalysis handle={selectedHandle} />
          </motion.div>
        )} */}

        {uploadedFile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8"
          >
            <p className="text-lg text-gray-400">Uploaded file: {uploadedFile.name}</p>
            {/* Add any additional processing or display for the uploaded file here */}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}