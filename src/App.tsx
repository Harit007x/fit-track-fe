import { RouterProvider } from "react-router-dom";
import { router } from "@/routes";
import { ThemeProvider } from "@/components/theme-provider";
import { SettingsProvider } from "@/components/language-provider";
import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <SettingsProvider>
        <RouterProvider router={router} />
        <Toaster />
      </SettingsProvider>
    </ThemeProvider>
  );
}

export default App;
