import { createBrowserRouter } from "react-router-dom";
import FitTrackPage from "@/pages/fittrack/page";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <FitTrackPage />,
  },
  // We can keep the admin routes around if needed later, but they are unlinked.
]);
