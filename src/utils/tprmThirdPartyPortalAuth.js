import Cookies from "js-cookie";

export const THIRD_PARTY_ASSESSMENT_VIEW_PERMISSION =
  "access.third_party_assessment.view";

const normalize = (value) => String(value || "").trim().toLowerCase();

export function getThirdPartyPortalPermissions(user = {}) {
  const modulePermissions = Array.isArray(user?.modules)
    ? user.modules.flatMap((module) =>
        Array.isArray(module?.permissions) ? module.permissions : [],
      )
    : [];
  const directPermissions = Array.isArray(user?.permissions)
    ? user.permissions
    : [];
  const permissionKeys = Array.isArray(user?.permissionKeys)
    ? user.permissionKeys
    : [];

  return Array.from(
    new Set(
      [...modulePermissions, ...directPermissions, ...permissionKeys]
        .map(normalize)
        .filter(Boolean),
    ),
  );
}

export function hasThirdPartyAssessmentAccess(user = {}) {
  return getThirdPartyPortalPermissions(user).includes(
    THIRD_PARTY_ASSESSMENT_VIEW_PERMISSION,
  );
}

export function getThirdPartyPortalIds(user = {}) {
  return {
    thirdPartyId:
      user.thirdParty_uuid ||
      user.thirdPartyId ||
      // user.vendor_uuid ||
      // user.vendorId ||
      user.thirdParty_id ||
      "",
    assessmentId:
      user.thirdPartyAssessmentSchedule ||
      user.thirdPartySchedule ||
      user.thirdPartyScheduleId ||
      user.assessmentId ||
      user.thirdPartyScheduleId ||
      "",
  };
}

export function readThirdPartyPortalUser() {
  try {
    const stored = Cookies.get("user_data");
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error("Unable to parse third-party portal user_data", error);
    return null;
  }
}
