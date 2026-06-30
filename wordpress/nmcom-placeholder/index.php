<?php
/**
 * The only template. WordPress falls back to index.php for every front-end view,
 * so home, posts, archives, and 404 all render this same placeholder. The real
 * site is served statically by Astro; this backend just shouldn't be browsable.
 */
?><!doctype html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<meta name="robots" content="noindex, nofollow">
	<title>Nothing to see here — <?php bloginfo( 'name' ); ?></title>
	<style>
		:root { color-scheme: dark; }
		html, body { height: 100%; margin: 0; }
		body {
			display: flex;
			align-items: center;
			justify-content: center;
			min-height: 100vh;
			padding: 2rem;
			text-align: center;
			font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
			background: #14131b;
			color: #f3f2f8;
		}
		.icon { font-size: 4rem; line-height: 1; }
		h1 { margin: 1.25rem 0 0.5rem; font-size: 1.75rem; font-weight: 600; }
		p { margin: 0; color: #9a98a9; }
		a { color: #8f87f0; }
	</style>
	<?php wp_head(); ?>
</head>
<body>
	<main>
		<div class="icon">👻</div>
		<h1>Nothing to see here&hellip;</h1>
		<p>Did you mean to visit <a href="https://nicolamustone.com/">nicolamustone.com</a>?</p>
	</main>
	<?php wp_footer(); ?>
</body>
</html>
