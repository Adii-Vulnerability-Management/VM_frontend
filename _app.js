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
import { User } from "lucide-react";
import useTimeTracker from "./useractivityloger/userTimeTracker";
import useActivityLogger from "./useractivityloger";
import { useEffect } from "react";

const GA_TRACKING_ID = "G-9Y51KSV8Q3";

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

  return (
    <>
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
