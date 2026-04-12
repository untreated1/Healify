import { appConfig } from "@/lib/config/app";

const MOYASAR_API_BASE_URL = "https://api.moyasar.com/v1";
const MOYASAR_FORM_ASSET_VERSION = "1.15.0";

function requireEnv(name: "MOYASAR_SECRET_KEY" | "MOYASAR_PUBLISHABLE_KEY") {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required.`);
  }

  return value;
}

export function getMoyasarServerConfig() {
  return {
    secretKey: requireEnv("MOYASAR_SECRET_KEY"),
    publishableKey: requireEnv("MOYASAR_PUBLISHABLE_KEY"),
    apiBaseUrl: MOYASAR_API_BASE_URL,
    siteUrl: appConfig.siteUrl,
  };
}

export function getMoyasarClientConfig() {
  return {
    publishableKey: requireEnv("MOYASAR_PUBLISHABLE_KEY"),
    siteUrl: appConfig.siteUrl,
    scriptUrl: `https://cdn.moyasar.com/mpf/${MOYASAR_FORM_ASSET_VERSION}/moyasar.js`,
    stylesheetUrl: `https://cdn.moyasar.com/mpf/${MOYASAR_FORM_ASSET_VERSION}/moyasar.css`,
  };
}
