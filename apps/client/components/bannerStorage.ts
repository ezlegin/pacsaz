/** Shared with the inline script in the root layout. */
export const BANNER_STORAGE_KEY = "pacsaz:subscription-banner-dismissed";

/** Runs before paint so a dismissed banner never flashes on reload. */
export const BANNER_INLINE_SCRIPT = `try{if(localStorage.getItem("${BANNER_STORAGE_KEY}")==="1"){window.__pacsazBannerDismissed=true}}catch(e){}`;

declare global {
  interface Window {
    __pacsazBannerDismissed?: boolean;
  }
}
