<?php
/**
 * Plugin Name:  Project Fields
 * Description:  Adds the Stack taxonomy and Notable Bits (highlights) post meta, exposed via the REST API for the headless front-end.
 * Version:      1.0.0
 * Author:       Nicola Mustone
 * License:      GPLv2 or later
 * License URI:  https://www.gnu.org/licenses/gpl-2.0.html
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // No direct access.
}

add_action( 'init', function () {
	register_taxonomy(
		'stack',
		'post',
		array(
			'labels'            => array(
				'name'          => 'Stack',
				'singular_name' => 'Stack item',
				'add_new_item'  => 'Add stack item',
				'search_items'  => 'Search stack',
				'not_found'     => 'No stack items yet',
			),
			'public'            => true,
			'hierarchical'      => true,
			'show_ui'           => true,
			'show_admin_column' => true,
			'show_in_rest'      => true,
			'rest_base'         => 'stack',
		)
	);
} );

add_action( 'init', function () {
	register_post_meta( 'post', 'highlights', array(
		'type'         => 'string',
		'single'       => false,
		'show_in_rest' => true,
	) );
} );
