<?php
declare(strict_types=1);
require __DIR__.'/hostinger/server/core.php';security_headers();try{if($_SERVER['REQUEST_METHOD']!=='POST')throw new HttpError(405);check_form();$_SESSION=[];session_destroy();setcookie('f06_admin_session','',['expires'=>time()-3600,'path'=>'/','secure'=>str_starts_with(config()['origin'],'https://'),'httponly'=>true,'samesite'=>'Lax']);header('Location: /',true,303);exit;}catch(Throwable $e){failure($e);}
