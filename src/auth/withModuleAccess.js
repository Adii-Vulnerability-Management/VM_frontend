import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { hasRouteAccess } from "./routeProtection";
import {
  getEffectivePermissionKeys,
  getUserAccessEntries,
} from "./accessModules";
import { getUserData } from "@/utils/userDataStorage";

export function withModuleAccess(Component) {
  return function ProtectedPage(props) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
      if (!router.isReady) return;

      const user = getUserData();

      if (!user) {
        setIsLoading(false);
        router.push("/login");
        return;
      }

      const userModules = getUserAccessEntries(user);

      const ok = hasRouteAccess(
        router.pathname,
        userModules,
        user?.roles || [],
        getEffectivePermissionKeys(user),
      );

      setIsAuthorized(ok);
      setIsLoading(false);

      if (!ok) {
        router.push("/contact");
      }
    }, [router.isReady, router.pathname]);

    if (isLoading) return <div>Loading...</div>;
    if (!isAuthorized) return null;

    return <Component {...props} />;
  };
}
