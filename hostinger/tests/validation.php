<?php
declare(strict_types=1);
require __DIR__.'/../server/core.php';require __DIR__.'/../server/validation.php';
function expect(bool $ok,string $message): void {if(!$ok)throw new RuntimeException($message);}
foreach(['https://www.facebook.com/demo/videos/123456/','https://facebook.com/watch/?v=123456','https://facebook.com/reel/123456/'] as $url)expect(parse_video($url)['kind']==='facebook','Facebook URL');
foreach(['javascript:alert(1)','https://facebook.com.attacker.test/demo/videos/123/','https://facebook.com/share/v/abc/','https://evil.test/1.mp4','https://user:password@facebook.com/watch/?v=123'] as $url)expect(parse_video($url)===null,'Unsafe URL accepted');
expect(parse_video('https://youtu.be/M7lc1UVf-VE')['id']==='M7lc1UVf-VE','YouTube');
$defaults=default_content();expect(valid_document($defaults['document']),'Default document invalid');
$bad=$defaults['document'];$bad['product']['price']=-1;expect(!valid_document($bad),'Negative price accepted');
$bad=$defaults['document'];$bad['images']['hero']='javascript:alert(1)';expect(!valid_document($bad),'Unsafe image accepted');
$bad=$defaults['document'];$bad['product']['phone']='01323527412';expect(!valid_document($bad),'Invalid contact format accepted');
$bad=$defaults['document'];$bad['videoUrl']='https://evil.test/test.mp4';expect(!valid_document($bad),'Invalid video accepted');
$campaign=json_decode(clean_campaign(['utm_source'=>'Facebook','utm_medium'=>'<script>x</script>','phone'=>'01712345678']),true);expect(!isset($campaign['phone'])&&!str_contains($campaign['utm_medium'],'<'),'Campaign sanitization');
expect(str_contains(h('<script>'),'&lt;'),'HTML escaping');
echo "PASS: PHP video validation, document validation, campaign sanitization and escaping\n";
