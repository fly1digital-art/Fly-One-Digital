<?php
declare(strict_types=1);
require_once __DIR__.'/validation.php';
function api(string $path): never {
 $method=$_SERVER['REQUEST_METHOD'];
 if($path==='/api/orders'&&$method==='POST'){
  $d=json_body();request_rate('order');$input=[];
  foreach(['name','phone','address','area'] as $k)$input[$k]=is_string($d[$k]??null)?trim($d[$k]):'';
  $input['phone']=preg_replace('/[\s-]/u','',strtr($input['phone'],array_combine(preg_split('//u','০১২৩৪৫৬৭৮৯',-1,PREG_SPLIT_NO_EMPTY),range(0,9))));
  $errors=[];if(mb_strlen($input['name'])<2||mb_strlen($input['name'])>100)$errors['name']='সম্পূর্ণ নাম লিখুন (২–১০০ অক্ষর)।';
  if(!preg_match('/^01[3-9]\d{8}$/D',$input['phone']))$errors['phone']='সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন।';
  if(mb_strlen($input['address'])<15||mb_strlen($input['address'])>600)$errors['address']='বিস্তারিত ঠিকানা দিন (১৫–৬০০ অক্ষর)।';
  if(!in_array($input['area'],['bangladesh','dhaka','outside'],true))$errors['area']='সঠিক এলাকা নির্বাচন করুন।';
  if($errors)reply(['error'=>'আপনার তথ্যগুলো ঠিক করুন।','errors'=>$errors],422);
  if(!is_string($d['idempotencyKey']??null)||!preg_match('/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/D',$d['idempotencyKey'])||!is_string($d['token']??null)||!preg_match('/^[a-f0-9]{64}$/D',$d['token']))throw new HttpError(422);
  $hash=hash('sha256',$d['token']);$ih=hash('sha256',json_encode($input,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES|JSON_THROW_ON_ERROR));
  $previous=query('SELECT * FROM f06_orders WHERE idempotency_key=?',[$d['idempotencyKey']])->fetch();
  if($previous){if(!hash_equals($previous['token_hash'],$hash)||!hash_equals($previous['input_hash'],$ih))throw new HttpError(409);reply(['order'=>summary($previous),'replayed'=>true]);}
  rate('phone-order',$input['phone'],5,3600);$reference='F06-'.strtoupper(bin2hex(random_bytes(8)));$now=now_iso();$product=read_content()['document']['product'];$price=$product['price'];$fee=$product['deliveryFee'];
  query('INSERT INTO f06_orders(reference,idempotency_key,token_hash,input_hash,name,phone,address,area,subtotal,delivery,total,status,payment_status,created_at,updated_at,campaign,is_demo,purchase_claimed) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,0) ON DUPLICATE KEY UPDATE idempotency_key=idempotency_key',[$reference,$d['idempotencyKey'],$hash,$ih,$input['name'],$input['phone'],$input['address'],$input['area'],$price,$fee,$price+$fee,'received','unpaid',$now,$now,clean_campaign($d['campaign']??null),public_config()['mode']==='demo'?1:0]);
  $saved=query('SELECT * FROM f06_orders WHERE idempotency_key=?',[$d['idempotencyKey']])->fetch();if(!$saved||!hash_equals($saved['token_hash'],$hash)||!hash_equals($saved['input_hash'],$ih))throw new HttpError(409);
  reply(['order'=>summary($saved),'replayed'=>$saved['reference']!==$reference],$saved['reference']===$reference?201:200);
 }
 if(in_array($path,['/api/orders/track','/api/orders/event'],true)&&$method==='POST'){
  $d=json_body();request_rate('lookup');$order=authorized_order($d['reference']??null);if(!$order)throw new HttpError(404,'অর্ডার পাওয়া যায়নি।');
  if($path==='/api/orders/track')reply(['order'=>summary($order)]);
  if($order['is_demo']||!public_config()['pixelId'])reply(['granted'=>false]);
  $s=query('UPDATE f06_orders SET purchase_claimed=1 WHERE reference=? AND purchase_claimed=0',[$order['reference']]);reply(['granted'=>$s->rowCount()===1,'eventId'=>'purchase_'.$order['reference'],'value'=>(int)$order['total'],'currency'=>'BDT']);
 }
 if(str_starts_with($path,'/api/admin/')){
  $user=require_admin();rate('admin',$user['email'],120,60);
  if($path==='/api/admin/settings'){
   if($method==='GET')reply(['settings'=>read_content()]);
   if($method==='PATCH'){$d=json_body(262144);$video=parse_video($d['videoUrl']??null);
    if(!in_array($d['palette']??null,['mono','red','noir','ocean','clay','lavender','sage','gold','teal','pink','custom'],true)||!$video||!is_bool($d['sample']??null)||!valid_document($d['document']??null))throw new HttpError(422,'সঠিক সেটিংস ও ভিডিও লিংক দিন।');
    $settings=['palette'=>$d['palette'],'videoId'=>$video['id']??'M7lc1UVf-VE','sample'=>$d['sample']||($video['id']??'')==='M7lc1UVf-VE','document'=>$d['document']];$settings['document']['videoUrl']=$video['url'];
    // Keep map-shaped JSON objects intact even when PHP decodes an empty object to [].
    $settings['document']['copy']=(object)$settings['document']['copy'];
    query('INSERT INTO f06_settings(id,content,updated_at) VALUES(1,?,?) ON DUPLICATE KEY UPDATE content=VALUES(content),updated_at=VALUES(updated_at)',[json_encode($settings,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES|JSON_THROW_ON_ERROR),now_iso()]);reply(['ok'=>true,'settings'=>read_content()]);
   }
  }
  if($path==='/api/admin/orders'){
   if($method==='GET'){$cursor=$_GET['before']??'9999';if(!is_string($cursor)||($cursor!=='9999'&&!preg_match('/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/D',$cursor)))throw new HttpError(400);$rows=query('SELECT reference,name,phone,address,area,total,status,payment_status,created_at,updated_at,campaign,is_demo FROM f06_orders WHERE created_at<? ORDER BY created_at DESC LIMIT 100',[$cursor])->fetchAll();foreach($rows as &$r){$r['total']=(int)$r['total'];$r['is_demo']=(bool)$r['is_demo'];}unset($r);reply(['orders'=>$rows,'nextCursor'=>count($rows)===100?$rows[99]['created_at']:null]);}
   if($method==='PATCH'){$d=json_body();if(!is_string($d['reference']??null)||!preg_match('/^F06-[A-F0-9]{16}$/D',$d['reference'])||!in_array($d['status']??null,['received','confirmed','shipped','delivered','cancelled'],true)||!in_array($d['paymentStatus']??null,['paid','unpaid'],true))throw new HttpError(422);$s=query('UPDATE f06_orders SET status=?,payment_status=?,updated_at=? WHERE reference=?',[$d['status'],$d['paymentStatus'],now_iso(),$d['reference']]);if(!$s->rowCount()&&!query('SELECT reference FROM f06_orders WHERE reference=?',[$d['reference']])->fetch())throw new HttpError(404);reply(['ok'=>true]);}
  }
  if($path==='/api/admin/media'&&$method==='POST'){require __DIR__.'/media.php';upload_media();}
 }
 throw new HttpError(404,'এই ঠিকানা পাওয়া যায়নি।');
}
