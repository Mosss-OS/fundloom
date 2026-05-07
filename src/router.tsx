import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import Index from "./routes/index";
import Login from "./routes/login";
import Explore from "./routes/explore";
import Create from "./routes/create";
import CampaignDetail from "./routes/c.$id";
import Dashboard from "./routes/dashboard";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <Index />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "explore",
        element: <Explore />,
      },
      {
        path: "create",
        element: <Create />,
      },
      {
        path: "c/:id",
        element: <CampaignDetail />,
      },
      {
        path: "dashboard",
        element: <Dashboard />,
      },
    ],
  },
]);

export function Router() {
  return <RouterProvider router={router} />;
}
