import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { baseurl, initURL } from "../../BaseUrl"; // Ensure these are defined

export const MyContext = createContext();

const MyProvider = ({ children }) => {
  const [scanCookiesData, setScanCookiesData] = useState(null);
  const [scanPrivacySetting, setPrivacySetting] = useState(null);
  const [scanURL, setScanURL] = useState(null);
  const [key, setKey] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState('es');
  const [customPrivacydata, setCustomPrivacydata] = useState(` <div>
  <p>
    <strong>Privacy policy</strong>
  </p>
  <p>
    <strong>Privacy policy overview</strong>
  </p>
  <p>We are committed to protecting and respecting your privacy</p>
  <p>
    <strong>Collecting and processing your personal information</strong>
  </p>
  <p>
    For the purpose of this Privacy Policy, Secure Privacy is a Data
    Controller of your personal information. Our legal basis for collecting
    and using your personal information, as described in this Privacy
    Policy, depends on the information we collect and the specific context
    in which we collect it. We may process your personal information
    because:
  </p>
  <ul>
    <li>
      We need to perform a contract with you, such as when you create a
      Policy with us
    </li>
    <li>You have given us permission to do so</li>
    <li>
      The processing is in our legitimate interests and it's not overridden
      by your rights
    </li>
    <li>For payment processing purposes</li>
    <li>To comply with the law</li>
  </ul>
  <p>
    We may also collect personal information that you give us during your
    communication with us regarding our services, such as technical support
    threads. In addition to the above, we may need to use your personal
    information for audits and compliance with our legal obligations under
    applicable law.
  </p>
  <p>
    For your rights regarding your personal information, please see "What
    are your rights as the owner of the personal information" section below.
  </p>
  <p>
    <strong>How we collect your personal data</strong>
  </p>
  <p>We collect data in two ways:</p>
  <ul>
    <li>Data that you provide to us</li>
    <li>Data that we collect through third-party services.</li>
  </ul>
  <p>
    We collect your data during your communication with us regarding our
    services, such as technical support threads. That’s the data that you
    provide to us.
  </p>
  <p>
    We also use third-party tools to facilitate, operate and manage our
    website. These tools use cookies and other tracking technologies. Such
    tools are created and managed by parties outside our control. As such,
    Secure Privacy is not responsible for what information is actually
    captured by such third parties or how such third parties use and protect
    that information.
  </p>
  <p>
    The third-party tools we use on our website will only insert cookies and
    other tracking technologies if consented by you. We track your consent
    once you click ‘Accept’ on our Privacy center. You can manage your
    permissions by clicking our Trust Badge below:
  </p>
  <p>
    <a
      href="https://www.meity.gov.in/writereaddata/files/Digital%20Personal%20Data%20Protection%20Act%202023.pdf"
      target="_blank"
    >
      Privacy
    </a>
  </p>
  <p>
    <strong>With whom we share the collected personal information</strong>
  </p>
  <p>
    We employ third party companies and individuals ('Service Providers') to
    facilitate and make our website accessible to our visitors. We share and
    disclose your personal information with these tools. They use cookies
    and other tracking technologies. Such tools are created and managed by
    parties outside our control. As such, Secure Privacy is not responsible
    for what information is actually captured by such third parties or how
    such third parties use and protect that information.
  </p>
  <p>
    These service providers have access to your personal information only to
    perform these tasks on our behalf and are obligated not to disclose or
    use it for any other purpose. They may track your online behavior over
    time and across different internet websites or online services. We share
    or disclose your personal information with the following third-party
    service providers:
  </p>
  <p>
    <strong>Analytics</strong>
  </p>
  <p>
    We use a 3rd party analytical software to gather statistical information
    about our website visitors. The services we use include:
  </p>
  <ul>
    <li>Kissmetrics</li>
    <li>Google Analytics</li>
  </ul>
  <p>
    <strong>
      What are your rights as the owner of personal information
    </strong>
  </p>
  <p>You have the following data protection rights:</p>
  <ul>
    <li>The right to access to your data</li>
    <li>The right to update or correct your data</li>
    <li>The right to object to the use of your data</li>
    <li>The right to restrict the use of your data</li>
    <li>The right to transfer your data to another data controller</li>
    <li>The right to the erasure of your data</li>
    <li>The right to withdraw consent</li>
    <li>
      The right to non-discrimination related to the exercising of your
      rights under the GDPR and CCPA
    </li>
    <li>
      The right to obtain information about the personal data we have
      collected from you and sold or disclosed to other subjects, if you are
      a California resident
    </li>
    <li>
      The right to opt-out from sales of your personal information to third
      parties
    </li>
    <li>
      In addition, if you are a California resident, you have the right to
      request from us to disclose to you the following:
    </li>
    <li>
      The categories of personal information we have collected about you
    </li>
    <li>
      The categories of sources from which the personal information is
      collected
    </li>
    <li>
      The business or commercial purpose for collecting or selling your
      personal information
    </li>
    <li>
      The categories of third parties with whom we share personal
      information
    </li>
    <li>
      The specific pieces of personal information we have collected about
      you
    </li>
  </ul>
  <p>
    <strong>
      How can you exercise your rights as the owner of personal information
    </strong>
  </p>
  <p>
    You may submit your requests to exercise your right under the GDPR and
    CCPA by:
  </p>
  <p>
    Please note that we may ask you to verify your identity before
    responding to such requests. You have the right to complain to a Data
    Protection Authority about our collection and use of your personal
    information. For more information, please contact your local data
    protection authority.
  </p>
  <p>
    <strong>Do not track signals</strong>
  </p>
  <p>
    We do not track your online behavior over time and across different
    internet websites or online services. However, some of the third-party
    services we use may do so. If you want to prevent them from tracking
    you, you can do so right from your browser.
  </p>
  <p>
    <strong>Location and transfer of your personal information</strong>
  </p>
  <p>
    We use third party service providers including Kissmetrics, Google
    Analytics, All such service providers are contractually bound to keep
    your personal information secure and confidential and to use it only for
    the above purposes, consistent with this Privacy Policy. You understand
    and accept that data protection legislation applicable to such service
    providers may not be as protective as in your country of residence. By
    accepting this Privacy Policy, you consent to such use of your personal
    information by these third party service providers. We will take all
    steps reasonably necessary to ensure that your data is treated securely
    and in accordance with this Privacy Policy and no transfer of your
    Personal Data will take place to an organization or a country unless
    there are adequate controls in place including the security of your data
    and other personal information.
  </p>
  <p>
    <strong>Security of your personal information</strong>
  </p>
  <p>
    We take appropriate technical measures for keeping your personal
    information confidential and protected against accidental or unlawful
    destruction or loss, alteration, unauthorised disclosure or access. We
    use technical safeguards measures including
  </p>
  <p>
    Finally, our sub-contractors are contractually bound to keep your
    personal information secure and confidential, consistent with this
    Privacy Policy, and are kept up-to-date on our security and privacy
    practices.
  </p>
  <p>
    The security of your personal information also depends on your
    protection of your user account. Please use a unique and strong
    password, and keep your login credentials secret. Also, be sure to log
    out after having used our services from a shared computer.
  </p>
  <p>
    <strong>Links to third-party Websites</strong>
  </p>
  <p>
    Our service may contain links to other sites that are not operated by
    us. If you click on a third party link, you will be directed to that
    third party's site. We strongly advise you to review the Privacy Policy
    of every site you visit. We have no control over and assume no
    responsibility for the content, privacy policies or practices of any
    third party sites or services.
  </p>
  <p>
    <strong>Protecting your child’s privacy</strong>
  </p>
  <p>
    Our Service does not address anyone under the age of 16 ('Children'). We
    do not knowingly collect personally identifiable information from anyone
    under the age of 18. If you are a parent or guardian and you are aware
    that your Children have provided us with Personal Data, please contact
    us. If we become aware that we have collected personal data from
    children without verification of parental consent, we take steps to
    remove that information from our servers.
  </p>
  <p>
    <strong>Changes to this privacy policy</strong>
  </p>
  <p>
    From time to time we may update this Privacy Policy. If we do, we will
    update the “last updated” sections at the top of the Privacy Policy. If
    we make material changes to this policy, we may notify you on our
    website, by a blog post, by email, or by any method we determine. Your
    continued use of this website or our service and/or continued provision
    of information to us will be subject to the terms of the then-current
    Privacy Policy.
  </p>
</div>`); // Your privacy data HTML here

const generateContent = (scanCookiesData) => {
  return `
    <div>
      <p><strong>Cookie declaration overview</strong></p>
      <p>This website uses cookies. Cookies are small text files stored on your device (computer, tablet, smartphone, or another device) to enhance your experience on the website.</p>
      <p>Websites use cookies for many different purposes, including but not limited to:</p>
      <ul>
        <li>Get information about the traffic on our website</li>
        <li>Provide you with essential functionalities of our website</li>
        <li>Track your browsing behavior</li>
        <li>Track your engagement with social services</li>
        <li>Collect information about how users use our website</li>
        <li>Remember your preferences for our website</li>
        <li>Personalize content and advertisements.</li>
      </ul>
      <p>We use cookies according to applicable national and international laws.</p>
      <p>This cookie declaration aims to inform you about our use of cookies, what types of cookies we use, and why we use them. We are committed to full transparency regarding your privacy while using our website. In the rest of this cookie declaration, you’ll find all the essential information about it.</p>
      <p>We use the following types of cookies:</p>
      <ul>
        ${scanCookiesData && Object.keys(scanCookiesData).map(category => `<li>${category}</li>`).join("")}
      </ul>
      ${scanCookiesData && Object.keys(scanCookiesData).map(category => (
        category === "Necessary" && `
        <p><strong>Necessary cookies</strong></p>
        <p>We always use the Necessary cookies. They allow us to provide you with the Necessary features of our website, such as website navigation or logging in the secured areas. Using them is in your best interest, hence all the applicable personal data protection laws allow us to use them freely. We use the following Necessary cookies:</p>
        <div key="${category}" class="cookie-declaration">
          <table>
            <thead>
              <tr>
                <th>Cookie ID</th>
                <th>Cookie Name</th>
                <th>Duration</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              ${scanCookiesData && scanCookiesData.Necessary?.map(cookie => `
                <tr>
                  <td>${cookie.cookie_id}</td>
                  <td>${cookie.cookie_name}</td>
                  <td>${cookie.duration}</td>
                  <td>${cookie.description}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>`
      )).join("")}
      <p>We use other types of cookies only with your prior explicit consent. If you give us consent to store them on your computer, we do so. If you don’t consent to their use, we don’t use them. It’s that simple.</p>
      <p>We don’t discriminate users based on consent. Your consent applies to the following domains:</p>
      <p>The rest of the cookies we use are:</p>
      ${scanCookiesData && Object.keys(scanCookiesData).map(category => (
        category === "Analytics" && `
        <p><strong>Analytics cookies</strong></p>
        <p>Analytics cookies provide us with information about the traffic and users’ behavior on our website. This includes the number of visitors, number of clicks to pages, and others. Most often, the data these cookies collect is anonymous.</p>
        <p>However, in some cases, the data may be related to a pseudonymous identifier that may be related to your device. That may possibly make you identifiable and that’s why we ask you for consent before using analytics cookies.</p>
        <div key="${category}" class="cookie-declaration">
          <table>
            <thead>
              <tr>
                <th>Cookie ID</th>
                <th>Cookie Name</th>
                <th>Duration</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              ${scanCookiesData && scanCookiesData.Analytics?.map(cookie => `
                <tr>
                  <td>${cookie.cookie_id}</td>
                  <td>${cookie.cookie_name}</td>
                  <td>${cookie.duration}</td>
                  <td>${cookie.description}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>`
      )).join("")}
      <p><strong>Deleting or disabling cookies</strong></p>
      <p>You may delete or disable cookies through your browser settings. However, you should keep in mind that deleting or disabling cookies may lead to inconvenience while using our website that would not have happened if you consented to the use of cookies.</p>
      <p>On the following links, you’ll find information about how to delete or disable cookies from your browser settings:</p>
      <ul>
        <li><a href="https://support.google.com/accounts/answer/61416?co=GENIE.Platform%3DDesktop&amp;hl=en" target="_blank">Chrome</a></li>
        <li><a href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop" target="_blank">Firefox</a></li>
        <li><a href="https://support.apple.com/en-in/guide/safari/sfri11471/mac" target="_blank">Safari (iOS)</a></li>
        <li><a href="https://blogs.opera.com/news/2015/08/how-to-manage-cookies-in-opera/" target="_blank">Opera</a></li>
        <li><a href="https://www.cookiesandyou.com/disable-cookies/windows/edge/" target="_blank">Edge</a></li>
      </ul>
      <p><strong>Changes to this cookie declaration</strong></p>
      <p>Secure Privacy may change this cookie declaration at any time without prior notice. That may happen due to changes in cookie regulations, changes in our website, or another reason. Ensure to check out this cookie declaration regularly to stay updated for any changes.</p>
      <p>Cookie declaration last updated on 2023-12-18</p>
    </div>
  `;
};
const [customCookiesdata, setCustomCookiesdata] = useState(generateContent(scanCookiesData));




  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await CustomAxios.get(`${baseurl}/${initURL}/cookies/cookies-data`);
        // console.log('response',response)
        const categorizedCookies = response.data[0]["cookieData"]?.reduce((acc, cookie) => {
          if (!acc[cookie.category]) {
            acc[cookie.category] = [];
          }
          acc[cookie.category].push(cookie);
          return acc;
        }, {});
        SetPrivacySetting(response.data[0]["cookieData"]);
        SetScanCookiesData(categorizedCookies);
        categorizedCookies && setKey(Object.keys(categorizedCookies)[0]);
      } catch (error) {
        // if(!error.response.status === 403)
        if (error.response && error.response.status === 403)
        toast.error(error.message);
      }
    };
    if (scanCookiesData === null || scanCookiesData === undefined) {
      fetchData();
    }
  }, [scanCookiesData, scanPrivacySetting]);


  
  useEffect(() => {
    setConsentData((prevData) => ({
      ...prevData,
      privacySetting: {
        privacySettingData: scanPrivacySetting,
      },
    }));
  }, [scanPrivacySetting, scanCookiesData]);

  useEffect(() => {
    setConsentData((prevData) => ({
      ...prevData,
      cookiesData: {
        cookiesDataCustom: customCookiesdata,
      },
    }));
  }, [customCookiesdata, scanCookiesData]);

  const [consentData, setConsentData] = useState({
    user_uuid: "",
    consentBannerData: {
      heading: "Cookies Consent GRC",
      description: "",
      backgroundColors: `#FFFFF5`,
      backgroundColorsAccept: `#5AE31B`,
      ColorsAccept: `#FFFFFF`,
      backgroundColorsReject: `#FC2803`,
      ColorsReject: `#FFFFFF`,
    },
    privacyData: {
      privacyDataCustom: customPrivacydata,
    },
    cookiesData: {
      cookiesDataCustom: "",
    },
    privacySetting: {
      privacySettingData: null,
    },
  });

 // console.log("MyProvider: Initializing context with consentData", consentData);

  useEffect(() => {
   // console.log("Custom Privacy Data:", customPrivacydata);
  }, [customPrivacydata]);

  return (
    <MyContext.Provider
      value={{
        setCustomPrivacydata,
        consentData,
        setConsentData,
        setSelectedLanguage,
        selectedLanguage,
        scanCookiesData,
        setScanCookiesData,
        scanPrivacySetting,
        setPrivacySetting,
        scanURL,
        setScanURL,
        key,
        setKey,
      }}
    >
      {children}
    </MyContext.Provider>
  );
};

export default MyProvider;
