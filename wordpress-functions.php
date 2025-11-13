<?php
/**
 * DigiGen Recommendation Widget - WordPress Integration
 * 
 * Add this code to your theme's functions.php file
 */

function enqueue_gemini_widget_assets() {
    // The widget is hosted on Vercel, so we load it from there
    $widget_host = 'https://reco.digigrowth.se'; // Your Vercel deployment URL
    
    // Load the main JavaScript bundle
    // Note: After deploying to Vercel, check the actual filename in the dist/assets folder
    wp_enqueue_script(
        'gemini-recommendation-widget',
        $widget_host . '/assets/index.js', // Vercel serves from /assets/
        array(),
        null,
        true
    );

    // Load the CSS
    wp_enqueue_style(
        'gemini-recommendation-widget-styles',
        $widget_host . '/assets/index.css'
    );
}

add_action('wp_enqueue_scripts', 'enqueue_gemini_widget_assets');

/**
 * Alternative: Load widget directly via script tag (simpler approach)
 * 
 * If the above doesn't work, you can add this to your theme's header.php or footer.php:
 * 
 * <script type="module" crossorigin src="https://reco.digigrowth.se/assets/index.js"></script>
 * <link rel="stylesheet" href="https://reco.digigrowth.se/assets/index.css">
 */
