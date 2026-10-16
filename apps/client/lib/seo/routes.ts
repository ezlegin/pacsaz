/**
 * Which routes crawlers may index, in one place.
 *
 * `robots.ts` and `sitemap.ts` must agree: a URL the sitemap advertises and
 * robots.txt forbids is reported in Search Console as "indexed, though blocked
 * by robots.txt", and a URL robots.txt forbids that the sitemap omits is simply
 * invisible. Deriving both from these lists is what keeps them in step.
 */

/**
 * Paths that require a session or return machine-only JSON.
 *
 * Trailing slashes are meaningful here: `/panel/` disallows everything below the
 * user panel without also disallowing a sibling route that merely starts with the
 * same characters.
 */
export const DISALLOWED_PATHS = [
  "/api/",
  "/panel/",
  "/onboarding",
  "/login",
  "/payment/result",
] as const;

/**
 * Paths that are reachable without a session and worth crawling, but that must
 * never appear in the sitemap because they are per-visitor or transient.
 */
export const NON_SITEMAP_PATHS = ["/payment", "/api", "/login"] as const;

/**
 * AI and answer-engine crawlers, split by what they do with the page.
 *
 * Both groups are allowed: `citation` agents fetch a page to answer a user's
 * question and link back to it, which is free qualified traffic; `training`
 * agents build model weights, which is how the brand ends up known to a model
 * that is later asked about dieline tools. Blocking either would only remove the
 * site from the answer, not from the model's memory of the wider web.
 *
 * They are listed explicitly rather than left to the `*` rule so that the policy
 * is auditable — and so each one is a named entry an operator can flip.
 */
export const AI_CITATION_BOTS = [
  "OAI-SearchBot",
  "ChatGPT-User",
  "PerplexityBot",
  "Perplexity-User",
  "Claude-User",
  "Claude-SearchBot",
  "Applebot-Extended",
  "DuckAssistBot",
  "YouBot",
  "PhindBot",
  "MistralAI-User",
  "Amazonbot",
  "Meta-ExternalAgent",
] as const;

export const AI_TRAINING_BOTS = [
  "GPTBot",
  "ClaudeBot",
  "anthropic-ai",
  "Google-Extended",
  "CCBot",
  "cohere-ai",
  "Bytespider",
  "img2dataset",
  "PetalBot",
  "Diffbot",
] as const;

/**
 * Classic search and social crawlers. Googlebot and Bingbot are already covered
 * by `*`, but naming them keeps the intent explicit and gives each one an entry
 * that can carry its own directives.
 */
export const SEARCH_BOTS = [
  "Googlebot",
  "Googlebot-Image",
  "Googlebot-News",
  "Bingbot",
  "YandexBot",
  "Slurp",
  "DuckDuckBot",
  "Baiduspider",
  "Sogou",
  "Twitterbot",
  "facebookexternalhit",
  "LinkedInBot",
  "TelegramBot",
  "WhatsApp",
  "Slackbot",
  "Discordbot",
] as const;
