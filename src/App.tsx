import { Outlet } from "react-router-dom";
import { PrivyAuthProvider } from "@/auth/PrivyAuthProvider";
import { FundloomAuthProvider } from "@/auth/useFundloomAuth";
import { SiteHeader } from "@/components/SiteHeader";

export default function App() {
  return (
    <PrivyAuthProvider>
      <FundloomAuthProvider>
        <SiteHeader />
        <Outlet />
      </FundloomAuthProvider>
    </PrivyAuthProvider>
  );
}
