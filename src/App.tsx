import { Outlet } from "react-router-dom";
import { PrivyAuthProvider } from "@/auth/PrivyAuthProvider";
import { SiteHeader } from "@/components/SiteHeader";

export default function App() {
  return (
    <PrivyAuthProvider>
      <SiteHeader />
      <Outlet />
    </PrivyAuthProvider>
  );
}
