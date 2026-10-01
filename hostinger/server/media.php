<?php
declare(strict_types=1);
function upload_media(): never {
 check_origin();$mime=strtolower(explode(';',$_SERVER['CONTENT_TYPE']??'')[0]);$types=['image/jpeg'=>'jpg','image/png'=>'png','image/webp'=>'webp','video/mp4'=>'mp4','video/webm'=>'webm'];if(!isset($types[$mime]))throw new HttpError(415);
 $max=(str_starts_with($mime,'video/')?20:5)*1024*1024;if((int)($_SERVER['CONTENT_LENGTH']??0)>$max)throw new HttpError(413,'ফাইলটি বড়। ভিডিও সর্বোচ্চ ২০ MB, ছবি ৫ MB।');
 $directory=private_dir().'/media';if(!is_dir($directory)&&!mkdir($directory,0700,true))throw new HttpError(503);
 $temp=tempnam($directory,'upload-');$out=fopen($temp,'wb');$in=fopen('php://input','rb');$size=0;$header='';
 try{while(!feof($in)){$chunk=fread($in,65536);if($chunk===false)throw new HttpError(400);$size+=strlen($chunk);if($size>$max)throw new HttpError(413);if(strlen($header)<64)$header.=substr($chunk,0,64-strlen($header));if(fwrite($out,$chunk)!==strlen($chunk))throw new HttpError(503);}
 fclose($out);$out=null;fclose($in);$in=null;
 $valid=match($mime){'image/jpeg'=>str_starts_with($header,"\xff\xd8\xff"),'image/png'=>str_starts_with($header,"\x89PNG\r\n\x1a\n"),'image/webp'=>substr($header,0,4)==='RIFF'&&substr($header,8,4)==='WEBP','video/mp4'=>substr($header,4,4)==='ftyp','video/webm'=>str_starts_with($header,"\x1a\x45\xdf\xa3"),default=>false};
 if(!$valid||$size===0)throw new HttpError(415,'সঠিক ছবি অথবা MP4/WebM ভিডিও দিন।');
 if(str_starts_with($mime,'image/')&&getimagesize($temp)===false)throw new HttpError(415);
 $hex=bin2hex(random_bytes(16));$key=substr($hex,0,8).'-'.substr($hex,8,4).'-'.substr($hex,12,4).'-'.substr($hex,16,4).'-'.substr($hex,20,12).'.'.$types[$mime];
 if(!rename($temp,$directory.'/'.$key))throw new HttpError(503);chmod($directory.'/'.$key,0600);reply(['url'=>'/api/media/'.$key],201);
 }finally{if(is_resource($out))fclose($out);if(is_resource($in))fclose($in);if(is_file($temp))unlink($temp);}
}
function serve_media(string $key): never {
 if(!preg_match('/^[a-f0-9-]{36}\.(jpg|png|webp|mp4|webm)$/D',$key,$m))throw new HttpError(404);
 $file=private_dir().'/media/'.$key;if(!is_file($file))throw new HttpError(404);$size=filesize($file);$start=0;$end=$size-1;$partial=false;
 $types=['jpg'=>'image/jpeg','png'=>'image/png','webp'=>'image/webp','mp4'=>'video/mp4','webm'=>'video/webm'];
 if(isset($_SERVER['HTTP_RANGE'])){if(!preg_match('/^bytes=(\d*)-(\d*)$/D',$_SERVER['HTTP_RANGE'],$r)||($r[1]===''&&$r[2]==='')){header('Content-Range: bytes */'.$size);throw new HttpError(416);}
 if($r[1]!==''){$start=(int)$r[1];$end=$r[2]!==''?min($end,(int)$r[2]):$end;}else{$start=max(0,$size-(int)$r[2]);}
 if($start>$end||$start>=$size){header('Content-Range: bytes */'.$size);throw new HttpError(416);}$partial=true;}
 header('Content-Type: '.$types[$m[1]]);header('Accept-Ranges: bytes');header('Cache-Control: public, max-age=31536000, immutable');header("Content-Security-Policy: default-src 'none'");header('Content-Length: '.($end-$start+1));
 if($partial){http_response_code(206);header("Content-Range: bytes $start-$end/$size");}
 if($_SERVER['REQUEST_METHOD']==='HEAD')exit;
 $handle=fopen($file,'rb');fseek($handle,$start);$remaining=$end-$start+1;while($remaining>0&&!feof($handle)){ $chunk=fread($handle,min(65536,$remaining));if($chunk===false)break;echo $chunk;$remaining-=strlen($chunk);}fclose($handle);exit;
}
