<?php
declare(strict_types=1);
final class HttpError extends RuntimeException { public function __construct(public int $status, string $message='এই অনুরোধ গ্রহণ করা যায়নি।') { parent::__construct($message); } }
function private_dir(): string { return getenv('F06_PRIVATE_DIR') ?: dirname(__DIR__,3).'/f06-private'; }
function config(): array {
 static $value=null;if($value!==null)return $value;
 $file=private_dir().'/config.php';
 if(!is_file($file))throw new HttpError(503,'প্রথমে Hostinger সেটআপ সম্পন্ন করুন।');
 $value=require $file;if(!is_array($value))throw new HttpError(503);
 $origin=rtrim((string)($value['origin']??''),'/');$u=parse_url($origin);
 if(!$u||empty($u['host'])||!in_array($u['scheme']??'',['https','http'],true)||!empty($u['path'])||isset($u['query'])||isset($u['user'])||isset($u['pass'])||isset($u['fragment']))throw new HttpError(503,'কনফিগারেশনে সঠিক origin দিন।');
 if(($u['scheme']??'')!=='https'&&!in_array($u['host'],['127.0.0.1','localhost'],true))throw new HttpError(503,'HTTPS চালু করুন।');
 $value['origin']=$origin;return $value;
}
function db(): PDO {
 static $pdo=null;if($pdo)return $pdo;$c=config();
 $dsn='mysql:host='.$c['db_host'].';port='.(int)($c['db_port']??3306).';dbname='.$c['db_name'].';charset=utf8mb4';
 $pdo=new PDO($dsn,(string)$c['db_user'],(string)$c['db_pass'],[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION,PDO::ATTR_DEFAULT_FETCH_MODE=>PDO::FETCH_ASSOC,PDO::ATTR_EMULATE_PREPARES=>false]);return $pdo;
}
function query(string $sql,array $values=[]): PDOStatement {$s=db()->prepare($sql);$s->execute($values);return $s;}
function now_iso(): string {return (new DateTimeImmutable('now',new DateTimeZone('UTC')))->format('Y-m-d\TH:i:s.v\Z');}
function security_headers(): void {
 header('X-Content-Type-Options: nosniff');header('Referrer-Policy: strict-origin-when-cross-origin');header('Cache-Control: private, no-store');
 header('Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()');
 header("Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://connect.facebook.net; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://www.facebook.com; font-src 'self'; connect-src 'self' https://www.facebook.com https://connect.facebook.net; frame-src https://www.youtube-nocookie.com https://www.facebook.com; media-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'");
}
function reply(array $data,int $status=200): never {http_response_code($status);header('Content-Type: application/json; charset=utf-8');echo json_encode($data,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES|JSON_THROW_ON_ERROR);exit;}
function check_origin(): void {if(($_SERVER['HTTP_ORIGIN']??'')!==config()['origin']||($_SERVER['HTTP_SEC_FETCH_SITE']??'')==='cross-site')throw new HttpError(403);}
function json_body(int $max=8192): array {
 check_origin();if(strtolower(explode(';',$_SERVER['CONTENT_TYPE']??'')[0])!=='application/json')throw new HttpError(415);
 if((int)($_SERVER['CONTENT_LENGTH']??0)>$max)throw new HttpError(413);
 $stream=fopen('php://input','rb');$raw=stream_get_contents($stream,$max+1);fclose($stream);if($raw===false||strlen($raw)>$max)throw new HttpError(413);
 try{$v=json_decode($raw,true,64,JSON_THROW_ON_ERROR);}catch(Throwable){throw new HttpError(400);}if(!is_array($v)||array_is_list($v))throw new HttpError(400);return $v;
}
function session_open(): void {
 if(session_status()===PHP_SESSION_ACTIVE)return;
 session_name('f06_admin_session');ini_set('session.use_strict_mode','1');ini_set('session.use_only_cookies','1');
 session_set_cookie_params(['lifetime'=>0,'path'=>'/','secure'=>str_starts_with(config()['origin'],'https://'),'httponly'=>true,'samesite'=>'Lax']);session_start();
 if(!isset($_SESSION['csrf']))$_SESSION['csrf']=bin2hex(random_bytes(32));
}
function csrf(): string {session_open();return $_SESSION['csrf'];}
function check_form(): void {check_origin();session_open();if(!hash_equals($_SESSION['csrf'],(string)($_POST['csrf']??'')))throw new HttpError(403);}
function admin(): ?array {
 session_open();if(empty($_SESSION['admin_id'])||($_SESSION['last_activity']??0)<time()-3600||($_SESSION['login_at']??0)<time()-43200){unset($_SESSION['admin_id']);return null;}
 $user=query('SELECT id,email FROM f06_admins WHERE id=?',[$_SESSION['admin_id']])->fetch();if(!$user)return null;$_SESSION['last_activity']=time();return $user;
}
function require_admin(): array {$u=admin();if(!$u)throw new HttpError(403,'প্রবেশাধিকার নেই।');return $u;}
function rate(string $scope,string $identity,int $max,int $seconds): void {
 $expires=(intdiv(time(),$seconds)+1)*$seconds;$key=hash('sha256',$scope.'|'.$identity.'|'.$expires);
 query('DELETE FROM f06_rate_limits WHERE expires_at<=? LIMIT 100',[time()]);
 query('INSERT INTO f06_rate_limits(bucket_key,hits,expires_at) VALUES(?,1,?) ON DUPLICATE KEY UPDATE hits=LEAST(hits+1,?)',[$key,$expires,$max+1]);
 $n=(int)query('SELECT hits FROM f06_rate_limits WHERE bucket_key=?',[$key])->fetchColumn();if($n>$max){header('Retry-After: '.max(1,$expires-time()));throw new HttpError(429,'অনেক অনুরোধ এসেছে। কিছুক্ষণ পরে চেষ্টা করুন।');}
}
function request_rate(string $scope): void {rate($scope,$_SERVER['REMOTE_ADDR']??'unknown',60,60);}
function default_content(): array {return json_decode(file_get_contents(__DIR__.'/defaults.json'),true,64,JSON_THROW_ON_ERROR);}
function read_content(): array {
 $base=default_content();$row=query('SELECT content FROM f06_settings WHERE id=1')->fetch();if(!$row)return $base;
 $saved=json_decode($row['content'],true,64,JSON_THROW_ON_ERROR);$result=array_replace_recursive($base,$saved);
 if(($result['document']['product']['phone']??'')==='+8801990090262')$result['document']['product']['phone']='+8801323527412';return $result;
}
function public_config(): array {$c=config();$pixel=(string)($c['meta_pixel_id']??'');return ['mode'=>($c['checkout_mode']??'demo')==='live'?'live':'demo','pixelId'=>preg_match('/^\d{5,25}$/D',$pixel)?$pixel:''];}
function summary(array $r): array {return ['reference'=>$r['reference'],'createdAt'=>$r['created_at'],'updatedAt'=>$r['updated_at'],'status'=>$r['status'],'paymentStatus'=>$r['payment_status'],'area'=>$r['area'],'subtotal'=>(int)$r['subtotal'],'delivery'=>(int)$r['delivery'],'total'=>(int)$r['total'],'quantity'=>1,'demo'=>(bool)$r['is_demo']];}
function authorized_order(mixed $ref): array|false {
 $auth=$_SERVER['HTTP_AUTHORIZATION']??$_SERVER['REDIRECT_HTTP_AUTHORIZATION']??'';
 if(!is_string($ref)||!preg_match('/^F06-[A-F0-9]{16}$/D',$ref)||!preg_match('/^Bearer ([a-f0-9]{64})$/D',$auth,$match))return false;
 return query('SELECT * FROM f06_orders WHERE reference=? AND token_hash=?',[$ref,hash('sha256',$match[1])])->fetch();
}
function h(string $value): string {return htmlspecialchars($value,ENT_QUOTES|ENT_SUBSTITUTE,'UTF-8');}
function failure(Throwable $e): never {if($e instanceof HttpError)reply(['error'=>$e->getMessage()],$e->status);error_log('F06 '.get_class($e).': '.$e->getMessage());reply(['error'=>'সার্ভারের সঙ্গে সংযোগ হয়নি। আবার চেষ্টা করুন।'],503);}
