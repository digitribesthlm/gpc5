<!-- ============================================ -->
<!-- STEP 1: Add to header.php (before </head>) -->
<!-- ============================================ -->
<script type="module" crossorigin src="https://reco.digigrowth.se/assets/widget.js"></script>


<!-- ============================================ -->
<!-- STEP 2: Add to single.php (after post content) -->
<!-- ============================================ -->
<div id="root" 
     data-api-host="https://reco.digigrowth.se" 
     data-widget-mode="embedded"
     data-page-context="<?php echo esc_attr(get_the_title()); ?>"
     data-persona-clues='{"Business": 1, "Tech": 1}'>
</div>


<!-- ============================================ -->
<!-- OPTIONAL: Add to footer.php for click tracking -->
<!-- ============================================ -->
<script>
document.addEventListener('DOMContentLoaded', function() {
    const articleLinks = document.querySelectorAll('main a, article a, .entry-content a');
    const cookieName = 'dg_hist';

    const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) {
            try {
                return decodeURIComponent(parts.pop().split(';').shift());
            } catch(e) {
                return null;
            }
        }
        return null;
    };

    articleLinks.forEach(link => {
        if (link.href.includes(window.location.hostname) && 
            !link.href.includes('/wp-admin') &&
            !link.href.includes('/wp-login')) {
            
            link.addEventListener('click', function(event) {
                const articleIdentifier = new URL(link.href).pathname;

                let history = [];
                try {
                    const existingCookie = getCookie(cookieName);
                    if (existingCookie && existingCookie.startsWith('[')) {
                        history = JSON.parse(existingCookie);
                    }
                } catch (e) {
                    history = [];
                }

                if (history[history.length - 1] !== articleIdentifier) {
                    history.push(articleIdentifier);
                }
                
                if (history.length > 10) {
                    history.shift();
                }

                const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString();
                document.cookie = `${cookieName}=${encodeURIComponent(JSON.stringify(history))}; expires=${expires}; path=/; domain=.digigrowth.se; SameSite=Lax`;
            });
        }
    });
});
</script>
