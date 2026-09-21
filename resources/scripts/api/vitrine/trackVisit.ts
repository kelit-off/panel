let firstView = true;

const xsrfToken = (): string => {
    const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);

    return match ? decodeURIComponent(match[1]) : 'nil';
};

/**
 * Reports a storefront page view. Uses fetch rather than the shared axios
 * client so tracking never drives the global progress bar, and never surfaces
 * an error: analytics must not get in the way of a visitor.
 */
export default (path: string): void => {
    if (navigator.doNotTrack === '1') {
        return;
    }

    // Only the landing page of a visit has a meaningful external referrer.
    const referrer = firstView ? document.referrer : '';
    firstView = false;

    fetch('/api/vitrine/track', {
        method: 'POST',
        credentials: 'same-origin',
        keepalive: true,
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-XSRF-TOKEN': xsrfToken(),
        },
        body: JSON.stringify({ path, referrer }),
    }).catch(() => undefined);
};
