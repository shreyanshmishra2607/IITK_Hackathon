import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import {Navbar} from "@/components/Navbar";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Project from "@/pages/aboutProject";
import Account from "@/pages/account";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/aboutProject" component={Project} />
      <Route path="/aboutTeam" component={Account} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background">
        <Navbar />
        <Router />
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;