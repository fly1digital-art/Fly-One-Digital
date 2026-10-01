<?php
declare(strict_types=1);
require __DIR__.'/hostinger/server/core.php';
security_headers();
$path=parse_url($_SERVER['REQUEST_URI']??'/',PHP_URL_PATH)?:'/';
try{
 if(str_starts_with($path,'/api/media/')&&in_array($_SERVER['REQUEST_METHOD'],['GET','HEAD'],true)){require __DIR__.'/hostinger/server/media.php';serve_media(substr($path,11));}
 if(str_starts_with($path,'/api/')){require __DIR__.'/hostinger/server/api.php';api($path);}
 if(!in_array($path,['/','/index.php','/admin','/admin/'],true))throw new HttpError(404);
 $page=str_starts_with($path,'/admin')?'admin':'storefront';
 if($page==='admin'&&!admin()){header('Location: /login.php',true,302);exit;}
 $content=read_content();$config=public_config();$manifest=json_decode(file_get_contents(__DIR__.'/webassets/.vite/manifest.json'),true,64,JSON_THROW_ON_ERROR);$entry=$manifest['hostinger/main.tsx'];
 $bootstrap=['content'=>$content,'config'=>$config,'page'=>$page,'csrf'=>$page==='admin'?csrf():''];
 $seo=$content['document']['seo'];$origin=config()['origin'];$hero=$origin.$content['document']['images']['hero'];
}catch(Throwable $e){if(str_starts_with($path,'/api/'))failure($e);http_response_code($e instanceof HttpError?$e->status:503);error_log('F06 page: '.$e->getMessage());?><!doctype html><html lang="bn"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>সাইট সেটআপ</title><body style="max-width:650px;margin:60px auto;padding:20px;font:18px sans-serif"><h1>সাইটটি প্রস্তুত করা হচ্ছে</h1><p>মালিক হলে Hostinger-এর কনফিগারেশন যাচাই করে <a href="/setup.php">সেটআপ সম্পন্ন করুন</a>। আগে চালু হয়ে থাকলে ডেটাবেস সংযোগ যাচাই করুন।</p></body></html><?php exit;}
?><!doctype html>
<html lang="bn" data-palette="<?=h($content['palette'])?>"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title><?=h($page==='admin'?'অর্ডার ব্যবস্থাপনা | F-06':$seo['title'])?></title><meta name="description" content="<?=h($seo['description'])?>"><link rel="icon" href="/favicon.svg"><link rel="stylesheet" href="/fonts/fonts.css">
<?php if($page==='admin'): ?><meta name="robots" content="noindex,nofollow"><?php else: ?><link rel="canonical" href="<?=h($origin)?>/"><meta property="og:type" content="website"><meta property="og:title" content="<?=h($seo['title'])?>"><meta property="og:description" content="<?=h($seo['description'])?>"><meta property="og:image" content="<?=h($hero)?>"><meta property="og:url" content="<?=h($origin)?>/"><meta property="og:locale" content="bn_BD"><?php endif;?>
<?php foreach($entry['css']??[] as $css):?><link rel="stylesheet" href="/webassets/<?=h($css)?>"><?php endforeach;?>
</head><body><div id="root"><p style="padding:24px">লোড হচ্ছে…</p></div><noscript>এই সাইটের অর্ডার ফর্ম ব্যবহার করতে JavaScript চালু করুন। কল করুন: <?=h($content['document']['product']['phone'])?></noscript><script type="application/json" id="f06-bootstrap"><?=json_encode($bootstrap,JSON_UNESCAPED_UNICODE|JSON_HEX_TAG|JSON_HEX_AMP|JSON_HEX_APOS|JSON_HEX_QUOT|JSON_THROW_ON_ERROR)?></script><script type="module" src="/webassets/<?=h($entry['file'])?>"></script></body></html>
