<?php
// Copy to ../f06-private/config.php OUTSIDE public_html using Hostinger File Manager.
// Never commit the completed file to GitHub. Folder/file permissions: 700 / 600 where supported.
return [
 'origin' => 'https://99fay.shop',
 'db_host' => 'localhost',
 'db_port' => 3306,
 'db_name' => 'YOUR_HOSTINGER_DATABASE_NAME',
 'db_user' => 'YOUR_HOSTINGER_DATABASE_USERNAME',
 'db_pass' => 'YOUR_DATABASE_PASSWORD',
 // Generate with a password manager: at least 32 random characters. Clear after setup.
 'setup_key' => '',
 // Live cash-on-delivery orders are enabled by the deployed hostinger/live.flag.
 'checkout_mode' => 'live',
 'meta_pixel_id' => '1094362616793836',
];
