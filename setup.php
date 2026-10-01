<?php
declare(strict_types=1);
require __DIR__.'/hostinger/server/core.php';require __DIR__.'/hostinger/server/form.php';security_headers();$error='';$ready=false;$done=false;
try{
 $c=config();session_open();if(strlen((string)($c['setup_key']??''))<32)throw new HttpError(403,'Hostinger-এ public_html-এর পাশের f06-private/config.php ফাইলে অন্তত ৩২ অক্ষরের random setup_key বসান।');
 try{$done=(bool)query('SELECT id FROM f06_setup WHERE id=1')->fetch();}catch(PDOException $e){if($e->getCode()!=='42S02')throw $e;}
 if($done)throw new HttpError(403,'সেটআপ আগেই সম্পন্ন হয়েছে। setup_key ফাঁকা করুন এবং /login.php থেকে লগইন করুন।');$ready=true;
 if($_SERVER['REQUEST_METHOD']==='POST'){
 check_form();if(!hash_equals($c['setup_key'],(string)($_POST['setup_key']??'')))throw new HttpError(403,'সেটআপ কী সঠিক নয়।');
 $users=[];foreach([1,2] as $i){$email=strtolower(trim((string)($_POST['email'.$i]??'')));$pass=(string)($_POST['password'.$i]??'');if($i===2&&$email===''&&$pass==='')continue;if(!filter_var($email,FILTER_VALIDATE_EMAIL)||strlen($email)>254||strlen($pass)<12||strlen($pass)>72)throw new HttpError(422,'সঠিক ইমেইল ও ১২–৭২ অক্ষরের পাসওয়ার্ড দিন।');$users[]=['email'=>$email,'hash'=>password_hash($pass,PASSWORD_DEFAULT)];}
 if(count(array_unique(array_column($users,'email')))!==count($users))throw new HttpError(422,'দুটি ভিন্ন ইমেইল দিন।');
 if((int)query("SELECT GET_LOCK('f06_initial_setup',10)")->fetchColumn()!==1)throw new HttpError(409,'কিছুক্ষণ পরে চেষ্টা করুন।');
 try{
  foreach(explode(';',file_get_contents(__DIR__.'/hostinger/server/schema.sql')) as $sql)if(trim($sql)!=='')db()->exec($sql);
  db()->beginTransaction();
  if(query('SELECT id FROM f06_setup WHERE id=1 FOR UPDATE')->fetch()||query('SELECT id FROM f06_admins LIMIT 1')->fetch())throw new HttpError(403,'সেটআপ আগেই হয়েছে।');
  foreach($users as $user)query('INSERT INTO f06_admins(email,password_hash,created_at) VALUES(?,?,?)',[$user['email'],$user['hash'],now_iso()]);
  query('INSERT INTO f06_settings(id,content,updated_at) VALUES(1,?,?)',[file_get_contents(__DIR__.'/hostinger/server/defaults.json'),now_iso()]);
  query('INSERT INTO f06_setup(id,completed_at) VALUES(1,?)',[now_iso()]);db()->commit();$done=true;$ready=false;
 }finally{if(db()->inTransaction())db()->rollBack();query("SELECT RELEASE_LOCK('f06_initial_setup')");}
 }
}catch(Throwable $e){$error=$e instanceof HttpError?$e->getMessage():'সেটআপ হয়নি। PHP extension এবং ডেটাবেসের তথ্য যাচাই করুন।';http_response_code($e instanceof HttpError?$e->status:503);if(!($e instanceof HttpError))error_log('F06 setup: '.$e->getMessage());}
form_start('একবারের সাইট সেটআপ',$error);
if($done&&!$error):?><p>সেটআপ সম্পন্ন। config.php-এর setup_key ফাঁকা করে দিন। পরীক্ষার অর্ডার যাচাই করার পর checkout_mode-এ live দিন।</p><a href="/login.php">অ্যাডমিন লগইন</a><?php elseif($ready):?><p class="fine">আগের সাইটের টেবিল বদলাবে না। নতুন f06_ টেবিলে অর্ডার ও সেটিংস থাকবে। দ্বিতীয় অ্যাডমিন ঐচ্ছিক।</p><form method="post"><input type="hidden" name="csrf" value="<?=h(csrf())?>"><label>সেটআপ কী<input type="password" name="setup_key" required autocomplete="off" minlength="32"></label><?php foreach([1,2] as $i):?><h2>অ্যাডমিন <?=$i?></h2><label>ইমেইল<input type="email" name="email<?=$i?>" <?=$i===1?'required':''?> maxlength="254" autocomplete="off"></label><label>পাসওয়ার্ড<input type="password" name="password<?=$i?>" <?=$i===1?'required':''?> minlength="12" maxlength="72" autocomplete="new-password"></label><?php endforeach;?><button>সেটআপ সম্পন্ন করুন</button></form><?php endif;form_end();
