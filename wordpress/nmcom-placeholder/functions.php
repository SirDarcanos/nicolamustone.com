<?php
/**
 * Theme setup. The front-end is just a placeholder, but the editor and REST API
 * still need featured-image support so the static Astro build can read each post's
 * thumbnail via the WP REST API.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // No direct access.
}

add_action( 'after_setup_theme', function () {
	add_theme_support( 'post-thumbnails' );
} );
