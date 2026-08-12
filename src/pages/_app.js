import Head from "next/head";
import { useRouter } from "next/router";
import { NextSeo } from "next-seo";
import Script from "next/script";
import "react-toastify/dist/ReactToastify.css";
import DefaultDashboard from "@/layouts/DefaultDashboard";
import { Providers } from "@/reduxes/Providers";
import MyProvider from "@/context/Myprovider";
import { ToastContainer } from "react-toastify";
import "tailwindcss/tailwind.css";
import { SidebarProvider } from "@/context/SidebarContext.js";
import "../styles/globals.css";
import useGlobalLoading from "@/globalcomponents/loader/useGlobalLoading";
import Loader from "@/globalcomponents/loader/Loader";
import useTimeTracker from "./useractivityloger/userTimeTracker";
import useActivityLogger from "./useractivityloger";
import { useEffect } from "react";
import "@/utils/userDataStorage";
import "@/globalcomponents/CustomAxios";

// ✅ ADD THESE IMPORTS
import { getStoredAuthUser } from "@/auth/currentUser";
import { hasRouteAccess } from "@/auth/routeProtection";
import {
  getEffectivePermissionKeys,
  getUserAccessEntries,
} from "@/auth/accessModules";

const GA_TRACKING_ID = "G-9Y51KSV8Q3";
const PUBLIC_AUTH_ROUTES = new Set([
  "/",
  "/login",
  "/signup",
  "/vendor-trust/VendorLogin",
  "/third-parties-risk-management/ThirdPartyLogin",
  "/customer-trust/ReviewerLogin",
]);

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const pageURL = process.env.baseURL + router.pathname;
  const title = "GRC3";
  const description =
    "GRC is a fully responsive and yet modern premium Nextjs template & snippets. Geek is feature-rich Nextjs components and beautifully designed pages that help you create the best possible website and web application projects. Nextjs Snippet ";
  const keywords =
    "GRC, Nextjs, Next.js, Course, Sass, landing, Marketing, admin themes, Nextjs admin, Nextjs dashboard, ui kit, web app, multipurpose";

  const { loading } = useGlobalLoading();
  useTimeTracker();
  useActivityLogger();

  // ✅ NEW: Global module-based route protection
  useEffect(() => {
    // router.asPath is the REAL url path (includes dynamic segments and query)
    const path = (router.asPath || "").split("?")[0];
    const isPublicAuthRoute = PUBLIC_AUTH_ROUTES.has(path);

    // sessionStorage first (full user_data); cookie may be compact or missing
    const user = getStoredAuthUser();

    if (isPublicAuthRoute) {
      return;
    }

    // If not logged in -> login
    if (!user) {
      router.replace("/login");
      return;
    }

    // Normalize modules (supports ["privacy"] OR [{key:"privacy"}] OR [{moduleKey:"privacy"}])
    const userModules = getUserAccessEntries(user);

    const userPermissionKeys = getEffectivePermissionKeys(user);

    const ok = hasRouteAccess(
      path,
      userModules,
      user.roles,
      userPermissionKeys,
    );

    // ✅ Debug logs (keep until you confirm it works)
    console.log("✅ ROUTE GUARD", {
      path,
      userModules,
      userRoles: user.roles,
      ok,
    });

    if (!ok) {
      router.replace("/contact");
    }
  }, [router.asPath]);

  // Google Analytics route change tracking
  useEffect(() => {
    const handleRouteChange = (url) => {
      window.gtag("config", GA_TRACKING_ID, {
        page_path: url,
      });
    };
    router.events.on("routeChangeComplete", handleRouteChange);
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.events]);

  useEffect(() => {
    const cleanupBlocker = () => {
      const blk = document.getElementById("cmp-blocker");
      if (blk) blk.remove();
    };
    router.events.on("routeChangeStart", cleanupBlocker);
    return () => {
      router.events.off("routeChangeStart", cleanupBlocker);
    };
  }, [router.events]);

  return (
    <>
      {/* <Script
        strategy="afterInteractive"
        src="https://dev.grc3.io/priv/universal-translator.js"
        data-api-url="http://23.22.92.199:3333/translate"
        data-default-language="en"
        data-show-language-select="true"
        data-root-selectors="#cmp-banner,#cmp-floating-btn,#cmp-preferences-overlay,#f_child_consent_widget,[data-universal-translate]"
        data-dropdown-targets="#cmp-banner,#cmp-preferences-overlay,#f_child_consent_widget"
      /> */}
      <Script
        strategy="afterInteractive"
        src="https://dev.grc3.io/priv/universal-translator.js"
        data-api-url="http://23.22.92.199:3333/translate"
        data-default-language="en"
        data-show-language-select="true"
        // what should be translated
        data-root-selectors="#cmp-banner,#cmp-preferences-overlay,#f_child_consent_widget,[data-universal-translate]"
        // where dropdown should appear
        data-dropdown-targets="#cmp-language-target,#child-consent-language-target,#dsar-language-target"
        // append/prepend/replace
        data-dropdown-placement="append"
      />

      <Script
        strategy="afterInteractive"
        src="https://dev.grc3.io/priv/form-runtime.js"
        data-domain="https://dev.grc3.io"
        defer
      />

      <Script
        strategy="afterInteractive"
        src="https://dev.grc3.io/priv/banner-loader4u.js"
        data-website-id="6879f56a2e6221ee1ad491c8"
        // src="https://demo1.grc3.io/apiv2/banner-loader3.js"
        // data-website-id="68a9ae0fd6decd63f6148a2d"
        onLoad={() => {
          if (window.CMP) {
            // initCMP();
          } else {
            const interval = setInterval(() => {
              if (window.CMP) {
                clearInterval(interval);
                initCMP();
              }
            }, 50);
          }
        }}
        onError={(e) => {
          console.error("Failed to load banner-loader3.js", e);
        }}
      />

      {/* <Script
        strategy="afterInteractive"
        src="https://dev.grc3.io/dev2/form-runtime.js"
        data-domain="https://dev.grc3.io"
        defer
      /> */}
      {/* <Script
        // id="grc-form-runtime"
        strategy="afterInteractive"
        src="https://dev.grc3.io/dev2/form-runtime.js"
        data-domain="https://dev.grc3.io"
        data-vf-pdf-url="https://dev.grc3.io/dev2/DPDPA_consent_form_for_data_processing.pdf"
        data-vf-pdf-title="DPDPA Consent Form Preview"
         data-vf-consent-portal-uri="https://consent.grc3.io/"
      />
      <Script
        src="https://dev.grc3.io/dev2/dsar-runtime.js"
        data-domain="https://dev.grc3.io"
      />
      <Script
        src="https://dev.grc3.io/dev2/dsar-widget.js"
        data-domain="https://dev.grc3.io"
      />
        <div id="f_child_consent_widget"></div>

      <Script
        src="https://dev.grc3.io/dev2/child-consent-runtime.js"
        data-domain="dev.grc3.io"
        data-form-id="f_child_consent_widget"
        defer
      />
      <Script
        strategy="afterInteractive"
        src="https://dev.grc3.io/priv/banner-loader4u.js"
        data-website-id="6879f56a2e6221ee1ad491c8"
        // src="https://demo1.grc3.io/apiv2/banner-loader3.js"
        // data-website-id="68a9ae0fd6decd63f6148a2d"
        onLoad={() => {
          if (window.CMP) {
            // initCMP();
          } else {
            const interval = setInterval(() => {
              if (window.CMP) {
                clearInterval(interval);
                initCMP();
              }
            }, 50);
          }
        }}
        onError={(e) => {
          console.error("Failed to load banner-loader3.js", e);
        }}
      />
      <Script
        src="https://scanner.grc3.io/priv/banner-loader3.js"
        data-website-id="69dc960680bf772b734a0551"
        onLoad={() => {
          if (window.CMP) {
            // initCMP();
          } else {
            const interval = setInterval(() => {
              if (window.CMP) {
                clearInterval(interval);
                initCMP();
              }
            }, 50);
          }
        }}
      />

      {loading && <Loader />}

      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="keywords" content={keywords} />
      </Head>

      {/* Google Analytics Script */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_TRACKING_ID}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>

      <NextSeo
        title={title}
        description={description}
        canonical={pageURL}
        openGraph={{
          url: pageURL,
          title: title,
          description: description,
          site_name: process.env.siteName,
        }}
      />

      <SidebarProvider>
        <MyProvider>
          <Providers>
            <DefaultDashboard>
              <ToastContainer />
              <Component {...pageProps} />
            </DefaultDashboard>
          </Providers>
        </MyProvider>
      </SidebarProvider>
    </>
  );
}

export default MyApp;
