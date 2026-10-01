<?php
declare(strict_types=1);
function parse_video(mixed $value): ?array {
 if(!is_string($value)||strlen($value)>500)return null;$value=trim($value);
 if(preg_match('~^/api/media/[a-f0-9-]{36}\.(mp4|webm)$~D',$value))return ['kind'=>'file','url'=>$value];
 $u=parse_url($value);if(!$u||($u['scheme']??'')!=='https'||isset($u['user'])||isset($u['pass'])||isset($u['port']))return null;
 $host=strtolower($u['host']??'');$path=$u['path']??'';parse_str($u['query']??'',$q);$id=null;
 if($host==='youtu.be')$id=explode('/',trim($path,'/'))[0];
 elseif(in_array($host,['youtube.com','www.youtube.com','m.youtube.com','www.youtube-nocookie.com'],true)){if($path==='/watch')$id=$q['v']??null;elseif(preg_match('~^/(?:embed|shorts|live)/([^/]+)/?$~D',$path,$m))$id=$m[1];}
 if(is_string($id)&&preg_match('/^[A-Za-z0-9_-]{11}$/D',$id))return ['kind'=>'youtube','id'=>$id,'url'=>'https://www.youtube.com/watch?v='.$id];
 if(in_array($host,['facebook.com','www.facebook.com','m.facebook.com'],true)&&(preg_match('~^/[^/]+/videos/(?:[^/]+/)?\d+/?$~D',$path)||preg_match('~^/reel/\d+/?$~D',$path)||(in_array($path,['/watch','/watch/','/video.php'],true)&&is_string($q['v']??null)&&preg_match('/^\d+$/D',$q['v']))))return ['kind'=>'facebook','url'=>'https://www.facebook.com'.$path.(isset($u['query'])?'?'.$u['query']:'')];
 return null;
}
function valid_image(mixed $v): bool {return is_string($v)&&strlen($v)<=500&&(preg_match('~^/images/[A-Za-z0-9_.-]+\.(webp|png|jpg|jpeg)$~D',$v)||preg_match('~^/api/media/[a-f0-9-]{36}\.(webp|png|jpg)$~D',$v));}
function valid_document(mixed $d): bool {
 if(!is_array($d))return false;$base=default_content()['document'];
 foreach(['product','design','copy','images','sections','seo'] as $k)if(!isset($d[$k])||!is_array($d[$k]))return false;
 foreach(['background','primary','surface'] as $k)if(!is_string($d['design'][$k]??null)||!preg_match('/^#[a-fA-F0-9]{6}$/D',$d['design'][$k]))return false;
 $p=$d['product'];foreach(['price','regular','deliveryFee'] as $k)if(!is_int($p[$k]??null)||$p[$k]<0||$p[$k]>1000000)return false;
 if($p['price']<1||$p['regular']<$p['price']||!is_string($p['phone']??null)||!preg_match('/^\+8801[3-9]\d{8}$/D',$p['phone']))return false;
 foreach(['name','model','brand','version','battery'] as $k)if(!is_string($p[$k]??null)||!trim($p[$k])||mb_strlen($p[$k])>120)return false;
 $fb=is_string($p['facebook']??null)?parse_url($p['facebook']):false;if(!$fb||($fb['scheme']??'')!=='https'||!in_array($fb['host']??'',['facebook.com','www.facebook.com'],true)||isset($fb['user'])||isset($fb['pass']))return false;
 if(array_diff(array_keys($d['images']),array_keys($base['images'])))return false;foreach($base['images'] as $k=>$v)if(!valid_image($d['images'][$k]??null))return false;
 foreach($base['sections'] as $k=>$v)if(!is_bool($d['sections'][$k]??null))return false;
 if(count($d['copy'])>500)return false;foreach($d['copy'] as $key=>$value){if(mb_strlen((string)$key)>1500||!is_array($value))return false;foreach(['bn','en'] as $l)if(!is_string($value[$l]??null)||mb_strlen($value[$l])>3000)return false;}
 if(isset($d['videoUrl'])&&!parse_video($d['videoUrl']))return false;
 return is_string($d['seo']['title']??null)&&mb_strlen($d['seo']['title'])>0&&mb_strlen($d['seo']['title'])<=160&&is_string($d['seo']['description']??null)&&mb_strlen($d['seo']['description'])<=400;
}
function clean_campaign(mixed $value): string {
 $result=[];if(is_array($value))foreach(['utm_source','utm_medium','utm_campaign','utm_content','utm_term'] as $key)if(is_string($value[$key]??null))$result[$key]=mb_substr(preg_replace('/[^\p{L}\p{N} _.,:()\-]/u','',$value[$key]),0,120);
 return json_encode((object)$result,JSON_UNESCAPED_UNICODE|JSON_THROW_ON_ERROR);
}
