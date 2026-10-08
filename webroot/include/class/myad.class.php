<?php  if(!defined('HUONIAOINC')) exit('Request Error!');
/**
 * 广告插件
 *
 * @version        $Id: myad.class.php 2014-12-18 下午15:48:25 $
 * @package        HuoNiao.class
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

if(!function_exists('getMyAd')){
    function getMyAd($params, &$smarty = array()){
        extract ($params);
        global $dsql;

        //正常情况
        if(!empty($id)){
            $handels = new handlers("siteConfig", "adv");
            $return = $handels->getHandle($id);

            if($return['state'] == 100){
                $info = $return['info'];
                return getAdHtml($info, $type, $exp, $insert);
            }

        //标题识别广告
        }elseif(!empty($title)){

            $handels = new handlers("siteConfig", "adv");
            $return = $handels->getHandle(array("model" => "siteConfig", "title" => $title));

            if($return['state'] == 100){
                $info = $return['info'];
                return getAdHtml($info, $type, $exp, $insert);
            }

        //分站广告
        }elseif(!empty($model) && !empty($title)){

            $handels = new handlers("siteConfig", "adv");
            $return = $handels->getHandle(array("model" => $model, "title" => $title));

            if($return['state'] == 100){
                $info = $return['info'];
                return getAdHtml($info, $type, $exp, $insert);
            }


        //分类广告
        }elseif(!empty($service) && !empty($typeid)){
            global $tplFloder;
            $tplFloder = str_replace("/", "", $tplFloder);
            $class = 1;
            switch ($type) {
                case 'slide':
                    $class = 2;
                    break;
                case 'stretch':
                    $class = 3;
                    break;
                case 'couplet':
                    $class = 4;
                    break;
                default:
                    $class = 1;
                    break;
            }
            $archives = $dsql->SetQuery("SELECT `id` FROM `#@__advlist` WHERE `state` = 1 AND `model` = '$service' AND `type` = $typeid AND `class` = $class AND `template` = '$tplFloder'");
            $results  = $dsql->dsqlOper($archives, "results");
            if($results){
                $id = $results[0]['id'];
                if(is_numeric($id)){
                    $handels = new handlers("siteConfig", "adv");
                    $return = $handels->getHandle($id);

                    if($return['state'] == 100){
                        $info = $return['info'];
                        return getAdHtml($info, $type, $exp, $insert);
                    }
                }
            }

        }
    }
}

if(!function_exists('getAdHtml')){

    // $exp  【详情】
    function getAdHtml($info, $type, $exp, $insert){

        global $cfg_advMarkState;  //广告标识状态  0关闭  1开启
        global $cfg_advMarkPostion;  //标识位置  0左上  1右上  2左下  3右下

        global $cfg_secureAccess;
        global $cfg_basehost;
        global $userLogin;

        $userLogin->keepUserID = 'admin_auth';
        $uid = $userLogin->getUserID();

        $advMark = '';
        if($cfg_advMarkState && !$info['mark']){
          $advMark = '<div class="advMark pos'.$cfg_advMarkPostion.'">广告</div>';
        }
        if($info['advTitle'] && $uid != -1 && testPurview("huoniaoOfficial")){
          $advMark .= '<div class="advTitleMark">'.$info['advTitle'].'</div>';
        }


        //普通广告
        if($info['class'] == 1){

            //代码
            if($info['type'] == "code"){

                if(strstr($info['body'], 'advPlaceholder')){
                  $body = $info['body'];
                }else{
                  $body = '<div class="siteAdvObj">' . $info['body'] . $advMark .'</div>';
                }

                //json格式
                if($type == 'json'){
                  echo json_encode(array('code' => $body, 'advMarkState' => $cfg_advMarkState, 'advMarkPostion' => $cfg_advMarkPostion, 'markState' => (int)$info['mark']));die;
                }else{
                  return $body;
                }

            //文字
            }elseif($info['type'] == "text"){
                $sty = array();
                if(!empty($info['color'])){
                    $sty[] = "color:".$info['color'];
                }
                if(!empty($info['size'])){
                    $sty[] = "font-size:".$info['size']."px";
                }

				$link = $info['link'];
				if(isApp() && strstr($info['link'], 'miniProgramLive_')){
					$link = $cfg_secureAccess.$cfg_basehost.'/include/json.php?action=getMiniProgramLive&id='.str_replace('miniProgramLive_', '', $info['link']);
                }elseif(isApp() && strstr($info['link'], 'wxMiniprogram://')){
					$link = $cfg_secureAccess.$cfg_basehost.'/include/json.php?action=openWxMiniProgram&param='.$info['link'];
				}elseif(!isWxMiniprogram() && strstr($info['link'], 'openxcx_')){
					$link = $cfg_secureAccess.$cfg_basehost.'/include/json.php?action=getWxMiniProgram';
				}
				$info['link'] = $link;

                if($info['link'] == ""){
                    return '<div class="siteAdvObj"><font style="'.join("; ", $sty).'">'.$info['title'].'</font>' . $advMark .'</div>';
                }else{
                    return '<div class="siteAdvObj"><a href="'.$info['link'].'" target="_blank" style="'.join("; ", $sty).'">'.$info['title'].'</a>' . $advMark .'</div>';
                }

            //图片、flash
            }else{

				$href = $info['href'];
				if(isApp() && strstr($info['href'], 'miniProgramLive_')){
					$href = $cfg_secureAccess.$cfg_basehost.'/include/json.php?action=getMiniProgramLive&id='.str_replace('miniProgramLive_', '', $info['href']);
                }elseif(isApp() && strstr($info['href'], 'wxMiniprogram://')){
					$href = $cfg_secureAccess.$cfg_basehost.'/include/json.php?action=openWxMiniProgram&param='.$info['href'];
				}elseif(!isWxMiniprogram() && strstr($info['link'], 'openxcx_')){
					$href = $cfg_secureAccess.$cfg_basehost.'/include/json.php?action=getWxMiniProgram';
				}
				$info['href'] = $href;

                return getAttachHtml($info['src'], $info['href'], $info['title'], $info['width'], $info['height'], $exp, $insert, $advMark);
            }

        //多图广告
        }elseif($info['class'] == 2){

            $list = array();

            //幻灯片【主要为了显示图片说明】
            if($type == "slide"){
                foreach ($info['list'] as $key => $value) {

                    $advMark_ = $advMark;
                    if($value['mark']){
                      if($info['advTitle'] && $uid != -1 && testPurview("huoniaoOfficial")){
                        $advMark_ = '<div class="advTitleMark">'.$info['advTitle'].'</div>';
                      }else{
                        $advMark_ = '';
                      }
                    }

					$link = $value['link'];
					if(isApp() && strstr($value['link'], 'miniProgramLive_')){
						$link = $cfg_secureAccess.$cfg_basehost.'/include/json.php?action=getMiniProgramLive&id='.str_replace('miniProgramLive_', '', $value['link']);
                    }elseif(isApp() && strstr($value['link'], 'wxMiniprogram://')){
						$link = $cfg_secureAccess.$cfg_basehost.'/include/json.php?action=openWxMiniProgram&param='.$value['link'];
					}elseif(!isWxMiniprogram() && strstr($value['link'], 'openxcx_')){
						$link = $cfg_secureAccess.$cfg_basehost.'/include/json.php?action=getWxMiniProgram';
					}
					$value['link'] = $link;

                    $img = getAttachHtml($value['src'], $value['link'], $value['title'], $info['width'], $info['height'], false, $insert, $advMark_);
                    $href = "href='javascript:;' style='cursor:default;'";
                    if($value['link'] != ""){
                        $href = 'href="'.$value['link'].'" target="_blank"';
                    }
                    $list[] = '<div class="slideshow-item ad'.$key.'">'.$img.'<div class="slideinfo"><h3><a '.$href.'>'.$value['title'].'</a></h3><p>'.$value['desc'].'</p><div class="bg"></div></div></div>';
                }

            //json格式
            }elseif($type == "json"){
              $list = array();
              foreach ($info['list'] as $key => $value) {

				  $link = $value['link'];
				  if(isApp() && strstr($value['link'], 'miniProgramLive_')){
					  $link = $cfg_secureAccess.$cfg_basehost.'/include/json.php?action=getMiniProgramLive&id='.str_replace('miniProgramLive_', '', $value['link']);
                  }elseif(isApp() && strstr($value['link'], 'wxMiniprogram://')){
					  $link = $cfg_secureAccess.$cfg_basehost.'/include/json.php?action=openWxMiniProgram&param='.$value['link'];
				  }elseif(!isWxMiniprogram() && strstr($value['link'], 'openxcx_')){
					  $link = $cfg_secureAccess.$cfg_basehost.'/include/json.php?action=getWxMiniProgram';
				  }
				$value['link'] = $link;

                array_push($list, array(
                  'src' => getFilePath($value['src']),
                  'turl' => getFilePath($value['src']),
                  'link' => $value['link'],
                  'title' => $value['title'],
                  'desc' => $value['desc'],
                  'advMarkState' => $cfg_advMarkState,
                  'advMarkPostion' => $cfg_advMarkPostion,
                  'markState' => (int)$value['mark']
                ));
              }
              echo json_encode($list);die;

            //图片列表
            }else{
                foreach ($info['list'] as $key => $value) {

                    $advMark_ = $advMark;
                    if($value['mark']){
                      if($info['advTitle'] && $uid != -1 && testPurview("huoniaoOfficial")){
                        $advMark_ = '<div class="advTitleMark">'.$info['advTitle'].'</div>';
                      }else{
                        $advMark_ = '';
                      }
                    }

					$link = $value['link'];
					if(isApp() && strstr($value['link'], 'miniProgramLive_')){
						$link = $cfg_secureAccess.$cfg_basehost.'/include/json.php?action=getMiniProgramLive&id='.str_replace('miniProgramLive_', '', $value['link']);
                    }elseif(isApp() && strstr($value['link'], 'wxMiniprogram://')){
						$link = $cfg_secureAccess.$cfg_basehost.'/include/json.php?action=openWxMiniProgram&param='.$value['link'];
					}elseif(!isWxMiniprogram() && strstr($value['link'], 'openxcx_')){
						$link = $cfg_secureAccess.$cfg_basehost.'/include/json.php?action=getWxMiniProgram';
					}
					$value['link'] = $link;

                    $img = getAttachHtml($value['src'], $value['link'], $value['title'], $info['width'], $info['height'], false, $insert, $advMark_);
                    if($value['link'] != ""){
                        $list[] = '<li>'.$img.'<span><a href="'.$value['link'].'" target="_blank">'.$value['title'].'</a></span></li>';
                    }else{
                        $list[] = '<li>'.$img.'<span><a href="javascript:;" style="cursor:default;">'.$value['title'].'</a></span></li>';
                    }
                }
            }
            return join("", $list);

        //伸缩广告
        }elseif($info['class'] == 3){
            $id = create_check_code(6);
            $html = array();
            $imgSmall = getAttachHtml($info['small'], $info['link'], "", $info['width'], $info['smallHeight'], false, $insert, $advMark);
            $imgLarge = getAttachHtml($info['large'], $info['link'], "", $info['width'], $info['largeHeight'], false, $insert, $advMark);
            $html[] = '<div id="stretch_'.$id.'" style="width: 1200px; position: relative; margin: 0 auto;"><div id="stretch_body_'.$id.'">'.$imgSmall.'</div><div class="adClose"><i></i><span class="kai"></span></div></div>';
            $html[] = '<script type="text/javascript" src="'.$cfg_secureAccess.$cfg_basehost.'/static/js/ui/jquery.stretch.js"></script>';
            $html[] = '<script type="text/javascript">$(function(){stretchAd("'.$id.'", \''.$imgSmall.'\', \''.$imgLarge.'\', '.$info['smallHeight'].', '.$info['largeHeight'].', '.$info['time'].');});</script>';
            return join("", $html);

        //对联广告
        }elseif($info['class'] == 4){

            $advMarkLeft = $advMark;
            if($info['left']['mark']){
              if($info['advTitle'] && $uid != -1 && testPurview("huoniaoOfficial")){
                $advMarkLeft = '<div class="advTitleMark">'.$info['advTitle'].'</div>';
              }else{
                $advMarkLeft = '';
              }
            }

            $advMarkRight = $advMark;
            if($info['right']['mark']){
              if($info['advTitle'] && $uid != -1 && testPurview("huoniaoOfficial")){
                $advMarkRight = '<div class="advTitleMark">'.$info['advTitle'].'</div>';
              }else{
                $advMarkRight = '';
              }
            }

            // $advMarkLeft = !$info['left']['mark'] ? $advMark : '';
            // $advMarkRight = !$info['right']['mark'] ? $advMark : '';

            $html = array();
            $left = getAttachHtml($info['left']['src'], $info['left']['link'], $info['left']['title'], $info['adwidth'], $info['adheight'], false, $insert, $advMarkLeft);
            $right = getAttachHtml($info['right']['src'], $info['right']['link'], $info['right']['title'], $info['adwidth'], $info['adheight'], false, $insert, $advMarkRight);

            $html[] = '<script type="text/javascript" src="'.$cfg_secureAccess.$cfg_basehost.'/static/js/ui/jquery.couplet.js"></script>';
            $html[] = '<script type="text/javascript">$(function(){couplet(\''.$left.'\', \''.$right.'\', '.$info['width'].', '.$info['adwidth'].', '.$info['adheight'].', '.$info['topheight'].');});</script>';
            return join("", $html);

        //节日广告
        }elseif($info['class'] == 5){
            global $cfg_staticPath;
            $html = array();

            $body = $info['body'];
            array_push($html, '<script>');
            array_push($html, 'var Background_Url = "'.getFilePath($body[1]).'"; //节日广告图片');
            array_push($html, 'var Background_Href = "'.$body[2].'"; //节日广告链接');
            array_push($html, 'var FestivalAD_hdeight = "'.$body[0].'";//节日广告头部高度');
            array_push($html, 'var Skin_Num = "";//节日广告变量');
            array_push($html, '</script>');
            array_push($html, '<script type="text/javascript" src="'.$cfg_staticPath.'js/festival_ad.js?v=2"></script>');

            return join("\n", $html);

        //弹窗公告
        }elseif($info['class'] == 6){
            global $cfg_staticPath;

            if($type == "json"){
                echo json_encode($info);die;
            }else{
                $html = '';
                $title = $info['advTitle'];
                $body = $info['body'];
                $link = $info['link'];

                if(isMobile()){
                    $html = <<<eot
<!-- 公告弹出层s touch-->
<style>
.announcePopmask{position: fixed; left: 0; right: 0; bottom: 0; top: 0; background: rgba(0,0,0,.5); z-index: 999999; display: none}
.announcePopBox{width: 5.6rem; height: 6.94rem; border-radius: .4rem; background:url(/static/images/announce_bg_touch.png) no-repeat center top/100% auto #fff; position: absolute; left: 0; right:0; bottom: 0; top: -20%; margin: auto; z-index: 999999;  padding-top:.6rem; box-sizing: border-box; padding-bottom: 1.6rem; display: none; animation:popup .3s ease-in-out;}
.close_announcePop{position: absolute; display: block; width: .7rem; height: .7rem; background: url(/static/images/close_btn.png) no-repeat center/cover; left: 0; right: 0; margin: auto; bottom: -1.05rem}
.announceCon{margin: 0 .35rem; height: 100%}
.announceCon h1{font-size: .36rem; font-weight: bold; color: #333; line-height: .44rem; text-align: center;}
.announceDetail img{max-width: 100%; object-fit: cover; display: inline-block;}
.announceDetail{font-size: .24rem; color: #636466; line-height: .38rem; margin-top: .4rem; padding-top: .1rem; height: 80%; overflow-y: auto;}
.announce_link{display: block; width: 2.72rem; height: .8rem; text-align: center; display: flex; align-items: center; justify-content: center; color: #fff; font-size: .32rem; font-weight: bold; line-height: .8rem; border-radius: .4rem; background: linear-gradient(-90deg, #F6252F 0%, #FF4621 100%); position:absolute; left:0; right:0; margin:auto; bottom:.44rem;}
</style>
<script>
$(function(){
	if(!$.cookie('HN_announcePopBoxShow') && !isbaidu){
		$('.announcePopmask,.announcePopBox').show();
	}
	$(".close_announcePop,.announce_link").click(function(){
		$.cookie('HN_announcePopBoxShow', true, { expires: 1 }); //生成cookie 有效期1天
		$('.announcePopmask,.announcePopBox').hide();
	})
})
</script>
<div class="announcePopmask">
	<div class="announcePopBox">
		<div class="announceCon">
			<h1>{$title}</h1>
			<div class="announceDetail">{$body}</div>
		</div>
		<a href="{$link}" target="_blank" class="announce_link">去看看</a>
		<a href="javascript:;"  class="close_announcePop"></a>
	</div>
</div>
<!-- 公告弹出层e  -->
eot;
                }else{
                    $html = <<<eot
<!-- 公告弹出层 s pc-->
<style>
  .announcePopmask{position: fixed; left: 0; right: 0; bottom: 0; top: 0; background: rgba(0,0,0,.5); z-index: 999999; display: none }
  .announcePopBox{width: 600px; height: 495px; border-radius: 12px; background: url(/static/images/announce_bg_pc.png) no-repeat center top /100% auto #fff; position: fixed; left: 0; top: 0; right: 0; bottom: 0; margin: auto; padding-top: 30px; padding-bottom: 80px; box-sizing: border-box; display: none; animation:popup .3s ease-in-out;}
  .announceCon h1{font-size: 22px; color: #333; font-weight: bold; padding: 0 40px;}
  .announceCon h1 s{display: inline-block; width: 30px; height: 30px; background: url(/static/images/ring.png) no-repeat center/cover; vertical-align: middle; margin-bottom: 4px; margin-right: 5px;}
  .announceCon .announceDetail{margin-top: 24px; color: #636366; font-size: 15px; line-height: 1.8em; height: 310px; overflow: auto; padding: 0 40px; box-sizing: border-box;}
  .announceCon .announceDetail img{display: inline-block; max-width: 100%; object-fit: cover}
  .announce_link{display: block; width: 160px;height: 46px;background: linear-gradient(-90deg, #F6252F 0%, #FF4621 100%);border-radius: 6px; color:#fff !important; font-size: 18px; line-height: 46px; text-align: center; position: absolute; left: 0; right:0; bottom: 37px; margin:auto;}
  .close_announcePop{display: block; width: 20px; height: 20px; background: url(/static/images/close_pc.png) no-repeat center/18px; position: absolute; top: 18px; right: 12px;}
  .announceDetail::-webkit-scrollbar{width: 4px;height: 0;border-radius: 2px;background: none;}
  .announceDetail::-webkit-scrollbar-thumb{border-radius: 5px; -webkit-box-shadow: inset 0 0 5px #bec0c4; background: #bec0c4;}
</style>
<script>
$(function(){
  if(!$.cookie('HN_announcePopBoxShow')){
    $('.announcePopmask,.announcePopBox').show();
  }
  $(".close_announcePop,.announce_link").click(function(){
      $.cookie('HN_announcePopBoxShow', true, {expires: 1}); //生成cookie 有效期1天
      $('.announcePopmask,.announcePopBox').hide();
  })
})
</script>
<div class="announcePopmask">
  <div class="announcePopBox">
    <div class="announceCon">
      <h1><s></s>{$title}</h1>
      <div class="announceDetail">{$body}</div>
    </div>
    <a href="{$link}" target="_blank" class="announce_link">去看看</a>
    <a href="javascript:;"  class="close_announcePop"></a>
  </div>
</div>
<!-- 公告弹出层 e -->
eot;
                }

                return $html;
            }
        }
    }
}
