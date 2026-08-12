import { NextResponse } from "next/server";

const allowedUrls = [
  { url: "/contact", isDynamic: false },

  { url: "/management-hub/settings", isDynamic: true },
  { url: "/management-hub/settings", isDynamic: false },

  // { url: "/management-hub", isDynamic: true },
  // { url: "/management-hub", isDynamic: false },

  { url: "/operations/policy", isDynamic: true },
  { url: "/operations/policy", isDynamic: false },

  { url: "/operations/procedure", isDynamic: true },
  { url: "/operations/procedure", isDynamic: false },

  { url: "/operations/finding-Management", isDynamic: true },
  { url: "/operations/finding-Management", isDynamic: false },

  { url: "/industry/automobile/tisax", isDynamic: true },
  { url: "/industry/automobile/tisax", isDynamic: false },

  { url: "/dashboard", isDynamic: false },

  { url: "/login", isDynamic: true },
  { url: "/login", isDynamic: false },

  { url: "/", isDynamic: false },
];

// helper to stamp stage + path on the response (and log)
function withStage(res, stage, pathname) {
  // try {
  //   res.headers.set("x-mw-stage", stage);
  //   res.headers.set("x-mw-path", pathname);
  // } catch (_) {}
  // console.log(`[MW] ${stage}`, pathname);
  return res;
}

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // console.log("[MW] start", pathname);

  // Allow specific login path first (not under /login/**)
  if (pathname === "/banking-and-finance/RbiTrackerUser/user-login") {
    return withStage(NextResponse.next(), "allow:special-login", pathname);
  }

  // Allowlist gate: only these routes continue to auth
  const isAllowed = allowedUrls.some((allowed) => {
    if (allowed.url === "/") return pathname === "/";
    if (allowed.isDynamic) return pathname.startsWith(`${allowed.url}/`);
    return pathname === allowed.url;
  });

  // if (!isAllowed) {
  //   return withStage(
  //     NextResponse.redirect(new URL("/contact", req.url)),
  //     "deny:not-allowlisted→/contact",
  //     pathname
  //   );
  // }

  // Auth (and MFA) check if not in DEBUG mode
  if (!/^true$/i.test(process.env.DEBUG)) {
    const nonadminPageUrl = new URL(process.env.NONADMINPAGEURL, req.url);
    const adminPageUrl = new URL(process.env.ADMINPAGEURL, req.url); // unused, kept for parity
    const loginPageUrl = new URL(process.env.LOGINPAGEURL, req.url);
    const mfaPageUrl = new URL(
      process.env.MFAPAGEURL || "/login/mfaVerification",
      req.url
    );

    // console.log(
    //   "LOGIN:",
    //   loginPageUrl.toString(),
    //   "MFA:",
    //   mfaPageUrl.toString()
    // );

    if (req.headers.get("cookie")) {
      // keep your original header bundle as requested
      const axiosConfig = {
        host: req.headers.get("host"),
        "x-real-ip": req.headers.get("x-real-ip"),
        "x-forwarded-for": req.headers.get("x-forwarded-for"),
        "x-forwarded-proto": req.headers.get("x-forwarded-proto"),
        connection: req.headers.get("connection"),
        pragma: req.headers.get("pragma"),
        "cache-control": req.headers.get("cache-control"),
        accept: req.headers.get("accept"),
        "user-agent": req.headers.get("user-agent"),
        referer: req.headers.get("referer"),
        "accept-encoding": req.headers.get("accept-encoding"),
        "accept-language": req.headers.get("accept-language"),
        cookie: req.headers.get("cookie"),
      };

      try {
        // console.log("[MW] entering auth block");
        // console.log(process.env.LOGIN_CHECK_URL);
        const response = await fetch(process.env.LOGIN_CHECK_URL, {
          method: "GET",
          headers: axiosConfig,
        });
        // console.log("[MW] auth resp status:", response.status);

        if (![404, 500, 502].includes(response.status)) {
          let responseText = null;
          try {
            responseText = await response.json();
            // console.log(
            //   "[MW] auth body:",
            //   responseText?.message || responseText?.detail || "ok"
            // );
          } catch (e) {
            return withStage(
              NextResponse.redirect(loginPageUrl),
              "auth:bad-json→/login",
              pathname
            );
          }

          // === AUTH OK ===
          if (responseText.message === "You're authenticated!") {
            const setCookieHeader = response.headers.get("set-cookie");

            const cookieAttributes = {
              HttpOnly: false,
              sameSite: "Lax",
              expires: new Date(Date.now() + 6 * 3600 * 1000),
              path: "/",
            };

            // ----- MFA GATE (new) -----
            const mfaEnabled = !!responseText?.user_data?.mfaEnabled;
            const mfaVerified =
              !!responseText?.user_data?.afterLoginMfaVerified;

            // If MFA is required and not yet verified, send to MFA page (unless already there)
            if (
              mfaEnabled &&
              !mfaVerified &&
              pathname !== mfaPageUrl.pathname
            ) {
              const res = NextResponse.redirect(mfaPageUrl);

              // keep your cookie style (non-HttpOnly) as requested
              res.cookies.set({
                name: "user_data",
                value: JSON.stringify(responseText.user_data),
                ...cookieAttributes,
              });

              if (setCookieHeader) {
                res.headers.set("Set-Cookie", setCookieHeader);
              }

              return withStage(res, "auth:mfa-required→mfa-page", pathname);
            }

            // Super user check (unchanged)
            if (
              responseText["user_type"] !== "super_user" &&
              pathname.startsWith("/superuserportal")
            ) {
              const res = NextResponse.redirect(nonadminPageUrl);
              res.cookies.set({
                name: "user_data",
                value: JSON.stringify(responseText.user_data),
                ...cookieAttributes,
              });
              if (setCookieHeader) {
                res.headers.set("Set-Cookie", setCookieHeader);
              }
              return withStage(res, "auth:ok→gate:nonadmin-redirect", pathname);
            }

            // Auth (and MFA if applicable) passed → allow
            const res = NextResponse.next();
            res.cookies.set({
              name: "user_data",
              value: JSON.stringify(responseText.user_data),
              ...cookieAttributes,
            });
            if (setCookieHeader) {
              res.headers.set("Set-Cookie", setCookieHeader);
            }
            return withStage(
              res,
              mfaEnabled
                ? mfaVerified
                  ? "auth:ok+mfa→proceed"
                  : "auth:ok(no-mfa)→proceed"
                : "auth:ok(mfa-disabled)→proceed",
              pathname
            );
          }

          // Not Authenticated
          if (
            responseText.detail ===
              "Authentication credentials were not provided." ||
            (responseText.detail ===
              "Access token not provided or invalid Authorization header." &&
              response.status === 401)
          ) {
            return withStage(
              NextResponse.redirect(loginPageUrl),
              "auth:missing→/login",
              pathname
            );
          }

          // Access token expired, try refresh
          if (
            responseText.detail === "Given token not valid for any token type"
          ) {
            const refreshRes = await fetch(process.env.REFRESH_ACCESS_URL, {
              method: "GET",
              headers: axiosConfig,
            });

            const refreshText = await refreshRes.text();
            const setCookieHeader2 = refreshRes.headers.get("set-cookie");

            if (refreshText === "Access Token Refreshed Successfully.") {
              const res = NextResponse.next();
              if (setCookieHeader2) {
                res.headers.set("Set-Cookie", setCookieHeader2);
              }
              return withStage(res, "auth:refresh:success→proceed", pathname);
            } else {
              return withStage(
                NextResponse.redirect(loginPageUrl),
                "auth:refresh:fail→/login",
                pathname
              );
            }
          }

          // Unknown auth body → login
          return withStage(
            NextResponse.redirect(loginPageUrl),
            "auth:unknown-body→/login",
            pathname
          );
        } else {
          return withStage(
            new Response("Internal Server Error", {
              status: 500,
              headers: { "Content-Type": "text/plain" },
            }),
            "auth:upstream-" + response.status,
            pathname
          );
        }
      } catch (error) {
        return withStage(
          new Response("Internal Server Error", {
            status: 500,
            headers: { "Content-Type": "text/plain" },
          }),
          "auth:exception",
          pathname
        );
      }
    } else {
      return withStage(
        NextResponse.redirect(loginPageUrl),
        "auth:no-cookie→/login",
        pathname
      );
    }
  }

  // DEBUG=true or other fallthrough
  return withStage(NextResponse.next(), "end:fallthrough", pathname);
}

export const config = {
  matcher: [
    "/((?!apiv1|apiv2|apiv2test|apiv2jay|vendor-trust/VendorLogin|customer-trust/ReviewerLogin|projectrisk|login|signup|images|fonts|_next/static|_vercel|favicon.ico).*)",
  ],
};

// import { NextResponse } from "next/server";

// export async function middleware(req) {
//   const { pathname } = req.nextUrl;

//   // Allow access to the specific user login URL without further checks
//   if (pathname === "/banking-and-finance/RbiTrackerUser/user-login") {
//     return NextResponse.next();
//   }

//   if (!/^true$/i.test(process.env.DEBUG)) {
//     // req.cookies.get('access')?.value

//     const nonadminPageUrl = new URL(process.env.NONADMINPAGEURL, req.url);
//     const adminPageUrl = new URL(process.env.ADMINPAGEURL, req.url);

//     const loginPageUrl = new URL(process.env.LOGINPAGEURL, req.url);
//     // loginPageUrl.searchParams.set('from', req.nextUrl.pathname)

//     if (req.headers.get("cookie")) {
//       const axiosConfig = {
//         host: req.headers.get("host"),
//         "x-real-ip": req.headers.get("x-real-ip"),
//         "x-forwarded-for": req.headers.get("x-forwarded-for"),
//         "x-forwarded-proto": req.headers.get("x-forwarded-proto"),
//         connection: req.headers.get("connection"),
//         pragma: req.headers.get("pragma"),
//         "cache-control": req.headers.get("cache-control"),
//         accept: req.headers.get("accept"),
//         "user-agent": req.headers.get("user-agent"),
//         referer: req.headers.get("referer"),
//         "accept-encoding": req.headers.get("accept-encoding"),
//         "accept-language": req.headers.get("accept-language"),
//         cookie: req.headers.get("cookie"),
//       };
//       try {
//         // console.log('axiosConfig',axiosConfig,'axiosConfig');
//         const response = await fetch(process.env.LOGIN_CHECK_URL, {
//           method: "GET",
//           headers: axiosConfig,
//         });
//         // console.log("response ",response)
//         if (
//           response.status !== 404 &&
//           response.status !== 500 &&
//           response.status !== 502
//         ) {
//           const responseText = await response.json();
//           if (responseText.message === "You're authenticated!") {
//             const setCookieHeader = response.headers.get("set-cookie");
//             const cookieAttributes = {};
//             cookieAttributes.HttpOnly = false;
//             cookieAttributes.sameSite = "Lax";
//             cookieAttributes.expires = new Date(Date.now() + 6 * 3600 * 1000);
//             console.log(
//               cookieAttributes.expires,
//               cookieAttributes.expires.toUTCString()
//             );
//             cookieAttributes.path = "/";
//             // NEW MFA check: if MFA is enabled and MFA hasn't been verified,
//             // then redirect to the MFA verification page.
//             // if (
//             //   responseText.user_data.mfaEnabled &&
//             //   !responseText.user_data.afterLoginMfaVerified
//             // ) {
//             //   // Avoid infinite redirect loop: only redirect if not already on the MFA page.
//             //   if (pathname !== "/login/mfaVerification") {
//             //     const mfaPageUrl = new URL(
//             //       process.env.MFAPAGEURL || "/login/mfaVerification",
//             //       req.url
//             //     );
//             //     return NextResponse.redirect(mfaPageUrl);
//             //   }
//             // }
//             if (
//               responseText["user_type"] !== "super_user" &&
//               pathname.startsWith("/superuserportal")
//             ) {
//               const return_response = NextResponse.redirect(nonadminPageUrl);
//               return_response.cookies.set({
//                 name: "user_data",
//                 value: JSON.stringify(responseText.user_data),
//                 httpOnly: cookieAttributes.HttpOnly,
//                 path: cookieAttributes.path,
//                 sameSite: cookieAttributes.sameSite,
//                 expires: cookieAttributes.expires,
//               });
//               if (setCookieHeader) {
//                 return_response.headers.set("Set-Cookie", setCookieHeader);
//               }
//               return return_response;
//             }
//             const return_response = NextResponse.next();
//             return_response.cookies.set({
//               name: "user_data",
//               value: JSON.stringify(responseText.user_data),
//               httpOnly: cookieAttributes.HttpOnly,
//               path: cookieAttributes.path,
//               sameSite: cookieAttributes.sameSite,
//               expires: cookieAttributes.expires,
//             });
//             if (setCookieHeader) {
//               return_response.headers.set("Set-Cookie", setCookieHeader);
//             }
//             return return_response;
//           } else if (
//             responseText.detail ===
//             "Authentication credentials were not provided."
//           ) {
//             return NextResponse.redirect(loginPageUrl);
//           } else if (
//             responseText.detail === "Given token not valid for any token type"
//           ) {
//             const refresh_access_response = await fetch(
//               process.env.REFRESH_ACCESS_URL,
//               { method: "GET", headers: axiosConfig }
//             );
//             //
//             const refresh_access_responseText =
//               await refresh_access_response.text();

//             const setCookieHeader =
//               refresh_access_response.headers.get("set-cookie");
//             if (
//               refresh_access_responseText ===
//               "Access Token Refreshed Successfully."
//             ) {
//               // Set the cookie in the response
//               const response = NextResponse.next();
//               // Check if set-cookie header is present in the response
//               if (setCookieHeader) {
//                 response.headers.set("Set-Cookie", setCookieHeader);
//               }

//               return response;
//             } else {
//               return NextResponse.redirect(loginPageUrl);
//             }
//           }
//         } else {
//           const customResponse = new Response("Internal Server Error", {
//             status: 500,
//             headers: { "Content-Type": "text/plain" },
//           });

//           // Return the custom response.
//           return customResponse;
//         }
//       } catch (error) {
//         const customResponse = new Response("Internal Server Error", {
//           status: 500,
//           headers: { "Content-Type": "text/plain" },
//         });

//         // Return the custom response.
//         return customResponse;
//       }
//     } else if (!req.headers.get("cookie")) {
//       return NextResponse.redirect(loginPageUrl);
//     }
//   }
// }

// export const config = {
//   matcher: [
//     "/((?!apiv1|apiv2|apiv2test|apiv2jay|vendor-trust/VendorLogin|customer-trust/ReviewerLogin|projectrisk|login|images|fonts|_next/static|_vercel|favicon.ico).*)",
//   ],
// };
