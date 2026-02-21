import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { Layout } from "@/components/Layout";
import HomePage from "@/pages/HomePage";
import OngoingPage from "@/pages/OngoingPage";
import CompletedPage from "@/pages/CompletedPage";
import SearchPage from "@/pages/SearchPage";
import DetailPage from "@/pages/DetailPage";
import ReaderPage from "@/pages/ReaderPage";
import HistoryPage from "@/pages/HistoryPage";
import BookmarksPage from "@/pages/BookmarksPage";
import AuthPage from "@/pages/AuthPage";
import NotificationsPage from "@/pages/NotificationsPage";
import ProfilePage from "@/pages/ProfilePage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/ongoing" element={<OngoingPage />} />
              <Route path="/completed" element={<CompletedPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/detail/:slug" element={<DetailPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/bookmarks" element={<BookmarksPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
            <Route path="/read/:slug" element={<ReaderPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
