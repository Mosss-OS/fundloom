import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { lazy, Suspense } from "react";
import App from "./App";
import Index from "./routes/index";

const Login = lazy(() => import("./routes/login"));
const Explore = lazy(() => import("./routes/explore"));
const Create = lazy(() => import("./routes/create"));
const CampaignDetail = lazy(() => import("./routes/c.$id"));
const Dashboard = lazy(() => import("./routes/dashboard"));

function PageFallback() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
      <div className="h-8 w-40 animate-pulse rounded-full bg-paper" />
    </div>
  );
}

const wrap = (el: React.ReactNode) => <Suspense fallback={<PageFallback />}>{el}</Suspense>;

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Index /> },
      { path: "login", element: wrap(<Login />) },
      { path: "explore", element: wrap(<Explore />) },
      { path: "create", element: wrap(<Create />) },
      { path: "c/:id", element: wrap(<CampaignDetail />) },
      { path: "dashboard", element: wrap(<Dashboard />) },
    ],
  },
]);

export function Router() {
  return <RouterProvider router={router} />;
}
