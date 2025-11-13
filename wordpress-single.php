<?php
/**
 * DigiGen Recommendation Widget - Single Post Template Integration
 * 
 * Add this code to your single.php template where you want the widget to appear
 * (typically after the post content)
 */
?>

<!-- DigiGen Recommendation Widget Container -->
<div id="root" 
     data-api-host="https://reco.digigrowth.se" 
     data-widget-mode="embedded"
     data-page-context="<?php echo esc_attr(get_the_title()); ?>"
     data-persona-clues='{"Business": 1, "Tech": 1}'>
</div>

<!-- Click Tracking Script -->
<script>
document.addEventListener('DOMContentLoaded', function() {
    // Track clicks on article links for personalization
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
        // Only track internal article links
        if (link.href.includes(window.location.hostname) && 
            !link.href.includes('/wp-admin') &&
            !link.href.includes('/wp-login')) {
            
            link.addEventListener('click', function(event) {
                const articleIdentifier = new URL(link.href).pathname;

                let history = [];
                try {
                    const existingCookie = getCookie(cookieName);
                    if (existingCookie && existingCookie.startsWith('[') && existingCookie.endsWith(']')) {
                        history = JSON.parse(existingCookie);
                    }
                } catch (e) {
                    console.warn('Could not parse click history cookie.', e);
                    history = [];
                }

                // Add new article to history
                if (history[history.length - 1] !== articleIdentifier) {
                    history.push(articleIdentifier);
                }
                
                // Keep only last 10 articles
                if (history.length > 10) {
                    history.shift();
                }

                // Save cookie
                const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString();
                document.cookie = `${cookieName}=${encodeURIComponent(JSON.stringify(history))}; expires=${expires}; path=/; domain=.digigrowth.se; SameSite=Lax`;
            });
        }
    });
});
</script>

<?php
/**
 * IMPORTANT: Customize the data-persona-clues based on your article categories
 * 
 * Examples:
 * - Technical SEO article: {"Tech": 2, "Advanced": 1, "Innovation": 1, "Efficiency-Focused": 3}
 * - Business strategy: {"Business": 2, "Basic": 1, "Cost-Conscious": 2, "Risk": 2}
 * - Social media tips: {"Business": 1, "Basic": 2, "Growth": 2}
 * 
 * You can dynamically set these based on post categories/tags:
 */
?>

<!-- Dynamic Persona Clues Example -->
<?php
/*
$persona_clues = array('Business' => 1, 'Tech' => 1);

// Customize based on categories
if (has_category('technical-seo')) {
    $persona_clues = array('Tech' => 2, 'Advanced' => 1, 'Innovation' => 1, 'Efficiency-Focused' => 3);
} elseif (has_category('business-strategy')) {
    $persona_clues = array('Business' => 2, 'Basic' => 1, 'Cost-Conscious' => 2, 'Risk' => 2);
} elseif (has_category('social-media')) {
    $persona_clues = array('Business' => 1, 'Basic' => 2, 'Growth' => 2);
}

$persona_json = json_encode($persona_clues);
*/
?>
