import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function AboutProject() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        <h1 className="text-4xl font-bold mb-8">About the Project</h1>
        
        {/* Project Overview Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-4">Project Overview</h2>
          <p className="text-lg text-muted-foreground">
            BotDetect is a cutting-edge cybersecurity project aimed at detecting and mitigating bot attacks in real-time. Our platform leverages advanced machine learning algorithms to identify suspicious activities and protect your digital assets.
          </p>
        </section>

        {/* Features Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-4">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="backdrop-blur-sm bg-card/50">
                <CardHeader>
                  <CardTitle>Real-Time Detection</CardTitle>--
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Our system detects bot attacks as they happen, providing instant alerts and automated responses.</p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="backdrop-blur-sm bg-card/50">
                <CardHeader>
                  <CardTitle>Machine Learning</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Utilizing state-of-the-art machine learning models to accurately identify and classify bot activities.</p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="backdrop-blur-sm bg-card/50">
                <CardHeader>
                  <CardTitle>Comprehensive Reports</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Detailed reports and analytics to help you understand the nature and impact of bot attacks on your system.</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>
      </motion.div>
    </div>
  );
}