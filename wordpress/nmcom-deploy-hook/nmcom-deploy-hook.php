<?php
/**
 * Plugin Name:  nmcom Deploy Hook
 * Description:  Pings a Cloudflare Pages deploy hook when a post/page is published, updated, or unpublished, so the static front-end rebuilds. Set the URL under Settings → Deploy Hook.
 * Version:      1.0.0
 * Author:       Nicola Mustone
 * License:      GPLv2 or later
 * License URI:  https://www.gnu.org/licenses/gpl-2.0.html
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // No direct access.
}

const NMCOM_DEPLOY_HOOK_OPTION = 'nmcom_deploy_hook_url';

/**
 * Resolve the deploy-hook URL. A defined NMCOM_DEPLOY_HOOK_URL constant wins;
 * otherwise the value saved on the settings page.
 */
function nmcom_deploy_hook_url() {
	if ( defined( 'NMCOM_DEPLOY_HOOK_URL' ) && NMCOM_DEPLOY_HOOK_URL ) {
		return NMCOM_DEPLOY_HOOK_URL;
	}
	return (string) get_option( NMCOM_DEPLOY_HOOK_OPTION, '' );
}

/* ----------------------------------------------------------------------------
 * Settings page (Settings → Deploy Hook)
 * ------------------------------------------------------------------------- */

add_action( 'admin_init', function () {
	register_setting( 'nmcom_deploy_hook', NMCOM_DEPLOY_HOOK_OPTION, array(
		'type'              => 'string',
		'sanitize_callback' => 'esc_url_raw',
		'default'           => '',
	) );

	add_settings_section( 'nmcom_deploy_hook_main', '', '__return_false', 'nmcom-deploy-hook' );

	add_settings_field(
		NMCOM_DEPLOY_HOOK_OPTION,
		'Deploy hook URL',
		function () {
			printf(
				'<input type="url" name="%s" value="%s" class="regular-text" placeholder="https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/…" />',
				esc_attr( NMCOM_DEPLOY_HOOK_OPTION ),
				esc_attr( get_option( NMCOM_DEPLOY_HOOK_OPTION, '' ) )
			);
			echo '<p class="description">Cloudflare Pages → Settings → Builds &amp; deployments → Deploy hooks. Pinged on publish, update, and unpublish. Leave blank to disable.</p>';
		},
		'nmcom-deploy-hook',
		'nmcom_deploy_hook_main'
	);
} );

add_action( 'admin_menu', function () {
	add_options_page(
		'Deploy Hook',
		'Deploy Hook',
		'manage_options',
		'nmcom-deploy-hook',
		function () {
			if ( ! current_user_can( 'manage_options' ) ) {
				return;
			}
			echo '<div class="wrap"><h1>Deploy Hook</h1><form action="options.php" method="post">';
			settings_fields( 'nmcom_deploy_hook' );
			do_settings_sections( 'nmcom-deploy-hook' );
			submit_button();
			echo '</form></div>';
		}
	);
} );

/* ----------------------------------------------------------------------------
 * Fire the hook when the built output would change
 * ------------------------------------------------------------------------- */

add_action(
	'transition_post_status',
	function ( $new_status, $old_status, $post ) {
		// Nothing to do if no deploy hook is configured.
		$url = nmcom_deploy_hook_url();
		if ( ! $url ) {
			return;
		}

		// Only content that actually appears in the build.
		if ( $post->post_type !== 'post' ) {
			return;
		}

		// Skip autosaves and revisions.
		if ( wp_is_post_revision( $post ) || ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) ) {
			return;
		}

		// Published, updated-while-published, or unpublished/trashed.
		if ( 'publish' !== $new_status && 'publish' !== $old_status ) {
			return;
		}

		// Fire-and-forget so the editor save isn't blocked on the response.
		wp_remote_post(
			$url,
			array(
				'method'   => 'POST',
				'timeout'  => 5,
				'blocking' => false,
				'body'     => '',
			)
		);
	},
	10,
	3
);
