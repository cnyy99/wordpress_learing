<?php
/**
 * Functions and definitions for the Twenty Twelve child theme Jiu Perfect.
 * User: Liu Wen Chang
 */

function twentytwelve_credits_handler_for_jiu_perfect(){
    ?>
    <a href="https://www.jiustore.com" title="Twenty twelve child theme">Jiu Perfect Theme</a> |
    <?php
}
add_action( 'twentytwelve_credits', 'twentytwelve_credits_handler_for_jiu_perfect' );