<?php
declare(strict_types=1);
require __DIR__.'/hostinger/server/core.php';require __DIR__.'/hostinger/server/form.php';security_headers();$error='';$ready=false;
try{session_open();$ready=true;if(admin()){header('Location: /admin');exit;}
 if($_SERVER['REQUEST_METHOD']==='POST'){check_form();$email=strtolower(trim((string)($_POST['email']??'')));$password=(string)($_POST['password']??'');rate('login-ip',$_SERVER['REMOTE_ADDR']??'unknown',20,900);rate('login-account',$email,10,900);
 $user=query('SELECT * FROM f06_admins WHERE email=?',[$email])->fetch();
 // Perform a password hash check for unknown accounts too.
 $valid=password_verify($password,$user['password_hash']??'$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.');
 if(!$user||!$valid)throw new HttpError(401,'ইমেইল বা পাসওয়ার্ড সঠিক নয়।');
 session_regenerate_id(true);$_SESSION=['admin_id'=>(int)$user['id'],'login_at'=>time(),'last_activity'=>time(),'csrf'=>bin2hex(random_bytes(32))];header('Location: /admin',true,303);exit;
 }
}catch(Throwable $e){$error=$e instanceof HttpError?$e->getMessage():'লগইন হয়নি। সেটআপ ও ডেটাবেস সংযোগ যাচাই করুন।';http_response_code($e instanceof HttpError?$e->status:503);}
form_start('অ্যাডমিন লগইন',$error);if($ready):?><form method="post"><input type="hidden" name="csrf" value="<?=h(csrf())?>"><label>ইমেইল<input type="email" name="email" required autocomplete="username" maxlength="254"></label><label>পাসওয়ার্ড<input type="password" name="password" required autocomplete="current-password" maxlength="128"></label><button>লগইন করুন</button></form><?php endif;form_end();
