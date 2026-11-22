<?php
/**
 * Plugin Name: WP PDF AcroForm Filler
 * Plugin URI: https://condixia.com
 * Author: Mahim Zaman (Condixia)
 * Author URI: https://mahimzaman.com
 * Description: Upload a PDF and fill AcroForm fields using pdf-lib.
 * Version: 1.0.0
 */

if (!defined('ABSPATH')) {
    exit;
}

class WPPDFAcroFormFiller {

    public function __construct() {
        add_shortcode('pdf_acroform_filler', [$this, 'render_shortcode']);
        add_action('wp_enqueue_scripts', [$this, 'enqueue_assets']);
    }

    public function enqueue_assets() {

        wp_enqueue_script(
            'pdf-lib',
            'https://unpkg.com/pdf-lib/dist/pdf-lib.min.js',
            [],
            null,
            true
        );

        wp_enqueue_script(
            'wp-pdf-filler-app',
            plugin_dir_url(__FILE__) . 'assets/js/app.js',
            ['pdf-lib'],
            time(),
            true
        );

        wp_localize_script('wp-pdf-filler-app', 'pdfFiller', [
            'ajaxurl' => admin_url('admin-ajax.php')
        ]);
    }

    public function render_shortcode() {
        ob_start();
        ?>

        <div id="pdf-filler-app">

            <h2>PDF AcroForm Filler</h2>

            <input type="file" id="pdf-upload" accept="application/pdf">

            <button id="load-pdf">Load PDF</button>

            <hr>

            <div id="fields-container"></div>

            <button id="generate-pdf" style="display:none; margin-top:20px;">
                Generate Filled PDF
            </button>

        </div>

        <?php
        return ob_get_clean();
    }
}

new WPPDFAcroFormFiller();