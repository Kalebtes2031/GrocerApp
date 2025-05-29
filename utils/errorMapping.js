// we map the raw backend string → our flat i18n key prefixes
const RAW_TO_KEY = {
  "Invalid login credentials": { title: "invalid_credentials_title",   message: "invalid_credentials_message" },
  "Account not activated":     { title: "inactive_title",              message: "inactive_message" },
  "Account deactivated":       { title: "deactivated_title",            message: "deactivated_message" },
};

// fallback keys
const DEFAULT_KEYS = { title: "default_title", message: "default_message" };

/**
 * raw — the exact string your backend sent in error.response.data.error or .detail  
 * t   — the i18n translator function from useTranslation('errormessage')
 */
export function mapAuthError(raw, t) {
  const keys = RAW_TO_KEY[raw] || DEFAULT_KEYS;

  return {
    title:   t(keys.title),
    message: t(keys.message),
  };
}
