import { useEffect } from 'react';

// Keeps the browser tab title in step with the storefront page during client-side
// navigation; the server already sends the right <title> for a direct visit.
export default (title: string | undefined) => {
    useEffect(() => {
        if (title) {
            document.title = title;
        }
    }, [ title ]);
};
