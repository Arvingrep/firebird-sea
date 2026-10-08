<?php
/**
 * 自助建站展示页面
 *
 * @version        $Id: website.php 2014-6-21 下午13:34:18 $
 * @package        HuoNiao.Website
 * @copyright      Copyright (c) 2013 - 2015, HuoNiao, Inc.
 * @link           http://www.huoniao.co/
 */
require_once('./include/common.inc.php');
global $cfg_softname;
global $cfg_basehost;
global $cfg_secureAccess;

$dsql  = new dsql($dbo);
$cycle = "aaab";
global $pagetype;
$pagetype = $type;
$tab = $type == "template" ? "website_temp_pages" : "website_design";
$alias = !empty($alias) ? $alias : "index";

if(strstr($alias, '?')){
  $aliasArr = explode('?', $alias);
  $alias = $aliasArr[0];
}

//如果是移动端访问，直接跳转至商家详情页
// if(isMobile()){
// 	$sql = $dsql->SetQuery("SELECT b.`id` FROM `#@__website` w LEFT JOIN `#@__business_list` b ON b.`uid` = w.`userid` WHERE w.`id` = $id LIMIT 1");
// 	$ret = $dsql->dsqlOper($sql, "results");
// 	if($ret){
// 		$url = getUrlPath(array(
// 			'service' => 'business',
// 			'template' => 'detail',
// 			'id' => $ret[0]['id']
// 		));
// 		header("location:".$url);
// 		die;
// 	}
// }

//专题ID解密
// $RenrenCrypt = new RenrenCrypt();
// $projectid = (int)$RenrenCrypt->php_decrypt(base64_decode($id));
// if(empty($projectid)) die("参数传递错误，访问失败！");
global $projectid;
$projectid = $id;

$domaintype = "";

//模板预览
if($type == "template"){
	$archives = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__website_temp` WHERE `id` = $projectid");
	$results = $dsql->dsqlOper($archives, "results");
	if(!$results){
		header("location:".$cfg_secureAccess.$cfg_basehost."/404.html?1");
		die;
	}
	$wTitle = $results[0]['title'];
	$head = "";
	$footer = "";

//网站浏览
}else{
	$archives = $dsql->SetQuery("SELECT `id`, `title`, `head`, `footer`, `domaintype` FROM `#@__website` WHERE `id` = $projectid AND `state` = 1");
	$results = $dsql->dsqlOper($archives, "results");
	if(!$results){
		header("location:".$cfg_secureAccess.$cfg_basehost."/404.html?2");
		die;
	}
	$wTitle     = $results[0]['title'];
	$head       = $results[0]['head'];
	$footer     = $results[0]['footer'];
	$domaintype = $results[0]['domaintype'];

}

//验证页面
if($type == "template"){
	$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."` WHERE `tempid` = $projectid AND `alias` = '$alias'");
}else{
	$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."` WHERE `projectid` = $projectid AND `alias` = '$alias'");
}
$results = $dsql->dsqlOper($archives, "results");
if(!$results || ($alias == 'productd' && $results[0]['pagedata'] == '')){
    if($alias == 'productd'){
        if($type == "template"){
        	$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."` WHERE `tempid` = $projectid AND `alias` = '$alias'");
        }else{
        	$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."` WHERE `projectid` = $projectid AND `alias` = '$alias'");
        }
        $results = $dsql->dsqlOper($archives, "results");
    }
    if(!$results){
    	header("location:".$cfg_secureAccess.$cfg_basehost."/404.html?3");
    	die;
    }
}

$name        = $results[0]['name'];
$alias       = $results[0]['alias'];
$title       = $results[0]['title'];
$keywords    = $results[0]['keywords'];
$description = $results[0]['description'];
$pagedata    = preg_replace('/\r\n|\r|\n+/', '', $results[0]['pagedata']);
$appname     = $results[0]['appname'];


//当前页面验证
$pageurl = $cfg_secureAccess.$_SERVER['SERVER_NAME'].$_SERVER["REQUEST_URI"];
if(!strstr($pageurl, ".html")){
	$pageurl = $cfg_secureAccess.$_SERVER['SERVER_NAME'].$_SERVER["REQUEST_URI"];
	if(substr($pageurl, -1) != "/"){
		$pageurl .= "/";
	}
	$pageurl .= "index.html";
}
$pageurl = dirname($pageurl);

//自定义域名
$customDomain = "";
$getDomain = getDomain("website", "website", $projectid);
if($getDomain && $domaintype){
	$pageurl = $getDomain['domain'];
}

if($pagetype != 'template'){
    $param = array(
        "service"      => "website",
        "template"     => "site".$projectid
    );
    $pageurl = getUrlPath($param);
}

// $pagedata    = preg_replace('/%7BPROJECT_PAGES_BASE%7D/', $pageurl."/", $pagedata);
// $pagedata    = preg_replace('/{PROJECT_PAGES_BASE}/', $pageurl."/", $pagedata);

$pagedata    = !empty($pagedata) ? objtoarr(json_decode($pagedata)) : array();

$css = $javascript = $html = $isList = $isGuest = $isGuestList = "";

$tab = "";
//新闻
if(strstr($alias, "article") || strstr($alias, "news")){
	$tab = "article";

//产品
}elseif(strstr($alias, "product")){
	$tab = "product";

//活动
}elseif(strstr($alias, "events")){
	$tab = "events";

//案例
}elseif(strstr($alias, "case")){
	$tab = "case";

//视频
}elseif(strstr($alias, "video")){
	$tab = "video";

//全景
}elseif(strstr($alias, "360qj")){
	$tab = "360qj";
}

//信息列表页
if(!empty($appname) && ((strstr($alias, "article") || (strstr($alias, "news") && !strstr($alias, "newsd"))) || (strstr($alias, "product") && !strstr($alias, "productd")))){
	$catid = (int)htmlspecialchars(RemoveXSS($_GET['catid']));
	if($tab == "article"){
		if(!empty($catid)){
			$archives = $dsql->SetQuery("SELECT * FROM `#@__website_".$tab."type` WHERE `website` = $projectid AND `id` = ".$catid);
			$results = $dsql->dsqlOper($archives, "results");
			if($results){
				$title = $results[0]['name'];
			}else{
				$title = "新闻中心";
			}
		}else{
			$title = "新闻中心";
		}

	}elseif($tab == "product"){
		if(!empty($catid)){
			$archives = $dsql->SetQuery("SELECT * FROM `#@__website_".$tab."type` WHERE `website` = $projectid AND `id` = ".$catid);
			$results = $dsql->dsqlOper($archives, "results");
			if($results){
				$title = $results[0]['name'];
			}else{
				$title = "产品展示";
			}
		}else{
			$title = "产品展示";
		}

	}elseif($tab == "events"){
		$title = "活动中心";

	}elseif($tab == "case"){
		$title = "成功案例";

	}elseif($tab == "video"){
		$title = "视频中心";

	}elseif($tab == "360qj"){
		$title = "全景展示";

	}

}
//信息阅读页
elseif(!empty($appname) && (strstr($alias, "newsd") || strstr($alias, "productd"))){
	$sid = (int)htmlspecialchars(RemoveXSS($_GET['sid']));
	if(!empty($sid) || $type == "template"){

		//模板预览
		if($type == "template"){

			$resultsView = array();

			//新闻
			if($tab == "article"){
				$title = "李泽楷30亿卖掉亏损公司 李嘉诚为子接盘";
				$keywords = "李嘉诚,李泽楷,电讯盈科";
				$description = "凭借着自身的条件优势，加入网络电影浪潮的毒舌电影必将成为弄潮儿！至于能否成为中国的特吕弗，当然要看毒舌电影的影评人能否达到特吕弗的水平！";

				$resultsView[0]['title'] = $title;
				$resultsView[0]['pubdate'] = 1486634556;
				$resultsView[0]['click'] = rand(10, 1000);
				$resultsView[0]['description'] = $description;
				$resultsView[0]['body'] = '<p><img src="http://ihuoniao.cn/uploads/website/temp/newsd_1.jpg" style="display:block;margin:10px auto;"></p><p>李嘉诚30亿港元接手一家资产净值不足8亿港元的亏损公司，精明的李嘉诚为何会如此做呢？这一切都与其次子李泽楷掌控的电讯盈科有关，这是一笔父子间的买卖。</p><p>在互联网泡沫的顶峰，电讯盈科总市值曾一度比肩长江实业，但最近几年正遭受利润持续下滑的压力。不过，一切都有超人爸爸托底，巨资卖掉亏损公司，李泽楷收到了开年大红包。</p><p><strong>&nbsp;电讯盈科卖亏损公司，李嘉诚30亿接盘&nbsp;</strong></p><p>近日，电讯盈科与长和旗下Three UK订立股份购买协议，将向Three UK出售旗下英国宽频业务。</p><p>Three U.K将向电讯盈科支付3亿英镑（相当于约29.18亿港元），用于收购其持有的英国频谱和无线网络资产公司——Transvision的全部股权；不过，交易的完成还需要通过英国反垄断监管的审查。</p><p>电讯盈科旗下的Transvision至少已连续两年出现亏损：2015年和2016年除税后净亏损分别高达2.97亿和2.24亿港元。截至2016年底，Transvision的资产净值约为7.71亿港元；也就是说，李嘉诚的收购价是该公司资产净值的近四倍。</p><p>从电讯盈科一方来看，李嘉诚的这次收购甚至可以说是雪中送炭。不久前，电讯盈科发布业绩公告称，在经济放缓和市场竞争加剧的情况下，旗下香港电讯和盈大地产出现下滑；使得电讯盈科业绩下跌。2016年总营收为383.84亿港元，同比减少2.37%；净利润为20.51亿港元，同比减少10.63%。下图为面包财经根据电讯盈科财报绘制的其总营收与净利润：</p><p><img src="http://ihuoniao.cn/uploads/website/temp/newsd_2.jpg" style="display:block;margin:10px auto;"></p><p>在电讯盈科业绩低迷的背景下，李嘉诚的收购让其获得近13亿港元的收益，超过了去年公司净利润的一半。摩根史丹利发表的研究报告也称，电讯盈科出售英国宽频业务，对股价有刺激作用；该行认为，交易可带动电讯盈科股价估值升0.5港元至4.5港元。电讯盈科也不无得意地称，这次出售是变现和实现公司价值的良机。</p><p><strong>&nbsp;空手套白狼：小超人3000亿鲸吞香港电讯&nbsp;</strong></p><p>精明的李嘉诚为何会以30亿港元收购一家亏损公司呢？</p><p>肥水不落外人田。电讯盈科的实际控制人是其次子李泽楷，据香港交易所披露的权益显示，截至2016年10月底，李泽楷持有电讯盈科28.97%的股份，是第一大股东。</p><p>这一次出售也使得李泽楷错过了超越李嘉诚的机会，腾讯自2004年在港上市以来，其市值不断攀升。2005年腾讯市值不足90亿港元，如今，腾讯是市值近20000亿港元的庞然大物。通过简单计算，即便摊薄之后，电讯盈科当年卖出的腾讯股票，如今市值也超过2000亿港元。而电讯盈科自身目前的总市值只有380多亿港元。</p><p>长袖善舞最终却得而复失。时也？运也？不过，有一个能出手30亿接盘的爸爸，怎么任性都行。</p><p>本文作者：面包财经（ID：mbcaijing）</p><p>免责声明：本文仅供信息分享，不构成对任何人的任何投资建议。</p>';
			}

		}

		if($type != "template"){
			$archives = $dsql->SetQuery("SELECT * FROM `#@__website_".$tab."` WHERE `website` = $projectid AND `id` = ".$sid);
			$resultsView = $dsql->dsqlOper($archives, "results");
			if($resultsView){
				$click = $resultsView[0]['click'] + 1;
				$archives = $dsql->SetQuery("UPDATE `#@__website_".$tab."` SET `click` = ".$click." WHERE `website` = $projectid AND `id` = ".$sid);
				$dsql->dsqlOper($archives, "update");

				$title        = $resultsView[0]['title'];
				$keywords     = $resultsView[0]['keywords'];
				$description  = $resultsView[0]['description'];
			}else{
				die('信息不存在，请确认！');
			}
		}
	}else{
		die('信息不存在，请确认！');
	}

}

/*
 * 对value格式化
 * 1.为空取0
 * 2.不等于"auto"并且不包含"px"的追加"px"
 * 3.其余为默认
 * @param $val string 要格式化的字符串
 * @return $string
 */
function value_change($val){
	$r = 0;
	if(!empty($val)){
		if($val != "auto" && !strstr($val, "px")){
			$r = $val."px";
		}else{
			$r = $val;
		}
	}
	return $r;
}

/*
 * 尺寸计算
 * 1.提取计量单位
 * 2.数学计算
 * @param $str  string 要计算的字符串或数字
 * @param $oper string 要进行的操作（+、-、*、/）
 * @param $num  num    参数
 * @return string
 */
function compute_dim($str, $oper, $num){
	$digital = (int)preg_replace('/[^0-9]/', '', $str);   //数值
	$unit    = str_replace($digital, "", $str); //单位
	if($oper == "+") $ret = $digital+$num;
	if($oper == "-") $ret = $digital-$num;
	if($oper == "*") $ret = $digital*$num;
	if($oper == "/") $ret = $digital/$num;
	return $ret.$unit;
}

//输出脚本
function defineJS($file){
	$m_file = HUONIAOROOT."/".$file;
	$view = readFileContent($m_file);
	$view = preg_replace("/ui\/(.*?)\.js/", "/design/ui/$1.js", $view);
	$view = str_replace("define(", "define('".$file."',", $view);
	return $view."\r\n";
}

//读取文件内容
function readFileContent($file){
	if(file_exists($file)){
		$fp = @fopen($file,'r');
		$content = @fread($fp,filesize($file));
		@fclose($fp);
		return $content;
	}
}

global $table;
$table = $tab;

//编译页面JSON数据
function data_foreach($arr, $type = NULL){
	static $data;
    global $table;
	global $dsql;
	global $projectid;
	global $cfg_secureAccess;
	global $cfg_basehost;
	global $cfg_clihost;
	global $id;
	global $alias;
	global $cycle;
	global $isList;
	global $isGuest;
	global $isGuestList;
	global $projectid;
	global $pagetype;
	global $getDomain;
	global $domaintype;
	global $sid;
    global $resultsView;

  $less = new lessc;

    //当前页面验证
    $pageurl = $cfg_secureAccess.$_SERVER['SERVER_NAME'].$_SERVER["REQUEST_URI"];
    if(!strstr($pageurl, ".html")){
        $pageurl = $cfg_secureAccess.$_SERVER['SERVER_NAME'].$_SERVER["REQUEST_URI"];
        if(substr($pageurl, -1) != "/"){
            $pageurl .= "/";
        }
        $pageurl .= "index.html";
    }
    $pageurl = dirname($pageurl);

    //自定义域名
    $customDomain = "";
    $getDomain = getDomain("website", "website", $projectid);
    if($getDomain && $domaintype){
        $pageurl = $cfg_secureAccess . $getDomain['domain'];
    }

    if($pagetype != 'template'){
        $param = array(
            "service"      => "website",
            "template"     => "site".$projectid
        );
        $pageurl = getUrlPath($param);
    }

	if (!is_array($arr) && $arr != NULL) {
		return $data;
	}

	if($arr['type'] == "body"){
		$theme = $arr['theme'];

		//页面链接样式配置
		$value = $theme['value'];
		if(!empty($value)){
			//默认
			$data['css'][] = ".t-body-default-aaaa a{";
			$linkColor = $value['link-color'];
			if(!empty($linkColor)) {
				$data['css'][] = "color:".$linkColor.";";
			}
			$linkTextDecoration = $value['link-text-decoration'];
			if(!empty($linkColor)) {
				$data['css'][] = "text-decoration:".$linkTextDecoration.";";
			}
			$data['css'][] = "}";
			//hover
			$data['css'][] = ".t-body-default-aaaa a:hover{";
			$linkHoverColor = $value['link-hover-color'];
			if(!empty($linkColor)) {
				$data['css'][] = "color:".$linkHoverColor.";";
			}
			$linkHoverTextDecoration = $value['link-hover-text-decoration'];
			if(!empty($linkColor)) {
				$data['css'][] = "text-decoration:".$linkHoverTextDecoration.";";
			}
			$data['css'][] = "}";
		}

		//页面基本配置
		$style = $theme['style'];
		if(!empty($style)){
			$data['css'][] = "#w-body-aaaa{";
			foreach($style as $key => $val){
				//间距
				if($key == "margin"){
					$data['css'][] = "margin:".value_change($val['top'])." ".value_change($val['right'])." ".value_change($val['bottom'])." ".value_change($val['left']).";";

				//填充
				}elseif($key == "padding"){
					$data['css'][] = "padding:".value_change($val['top'])." ".value_change($val['right'])." ".value_change($val['bottom'])." ".value_change($val['left']).";";

				//背景
				}elseif($key == "background"){
					if(!empty($val['attachment'])){
						$data['css'][] = "background-attachment:".$val['attachment'].";";
					}
					if(!empty($val['color'])){
						$data['css'][] = "background-color:".$val['color'].";";
					}
					if(!empty($val['image'])){
						$data['css'][] = "background-image:".$val['image'].";";
					}
					if(!empty($val['position'])){
						$data['css'][] = "background-position:".$val['position'].";";
					}
					if(!empty($val['repeat'])){
						$data['css'][] = "background-repeat:".$val['repeat'].";";
					}

				//边框
				}elseif($key == "border"){

					$style = $val['style'];
					$data['css'][] = "border-style:".($style['top'] ? $style['top'] : "none")." ".($style['right'] ? $style['right'] : "none")." ".($style['bottom'] ? $style['bottom'] : "none")." ".($style['left'] ? $style['left'] : "none").";";
					$width = $val['width'];
					if(!empty($width['top'])){
						$data['css'][] = "border-top-width:".$width['top'].";";
					}
					if(!empty($width['right'])){
						$data['css'][] = "border-right-width:".$width['right'].";";
					}
					if(!empty($width['bottom'])){
						$data['css'][] = "border-bottom-width:".$width['bottom'].";";
					}
					if(!empty($width['left'])){
						$data['css'][] = "border-left-width:".$width['left'].";";
					}
					$color = $val['color'];
					if(!empty($color['top'])){
						$data['css'][] = "border-top-color:".$color['top'].";";
					}
					if(!empty($color['right'])){
						$data['css'][] = "border-right-color:".$color['right'].";";
					}
					if(!empty($color['bottom'])){
						$data['css'][] = "border-bottom-color:".$color['bottom'].";";
					}
					if(!empty($color['left'])){
						$data['css'][] = "border-left-color:".$color['left'].";";
					}

				}else{
					$data['css'][] = "".$key.":".$val.";";
				}
			}
			$data['css'][] = "}";
		}

	}

	foreach($arr['items'] as $key => $val) {

		if(!empty($val['type'])){
			//组件样式
			$m_file = HUONIAOROOT."/design/widgets/".$val['type']."/view.css";
			$view = readFileContent($m_file);
			$view = preg_replace("/[\r\n	]/",'',$view);
			$view = preg_replace("/\s?\{\s?/",'{',$view);
			$view = preg_replace("/:\s+/",':',$view);
			$view = preg_replace("/;\s+/",'',$view);
			$view = preg_replace("/\((.*?).jpg\)/",'(/design/widgets/'.$val['type'].'/$1.jpg)',$view);
			$view = preg_replace("/\((.*?).png\)/",'(/design/widgets/'.$val['type'].'/$1.png)',$view);
			$view = preg_replace("/\((.*?).gif\)/",'(/design/widgets/'.$val['type'].'/$1.gif)',$view);
			if(!in_array($view, $data['css'])){
				$data['css'][] = $view;
			}

			//组件风格
			$themeBase = $val['theme']['base'];
			if(!empty($themeBase)){
				$m_file = HUONIAOROOT."/design/widgets/".$val['type']."/info.json";
				$json = json_decode(readFileContent($m_file));
				if(!empty($json)){
					$json = objtoarr($json);
					$theme = $json['theme'];

					$source = "";
					foreach($theme as $k => $v){
						if($v['name'] == $themeBase){
							$source = $v['source'];
						}
					}

					//less代码解析
					$source = $less->compile($source);
					$source = preg_replace("/\s?\{\s?/",'{',$source);
					$source = preg_replace("/:\s+/",':',$source);
					$source = preg_replace("/;\s+/",';',$source);
					$source = preg_replace("/\((.*?).jpg\)/",'(/design/widgets/'.$val['type'].'/theme/'.$themeBase.'/$1.jpg)',$source);
					$source = preg_replace("/\((.*?).png\)/",'(/design/widgets/'.$val['type'].'/theme/'.$themeBase.'/$1.png)',$source);
					$source = preg_replace("/\((.*?).gif\)/",'(/design/widgets/'.$val['type'].'/theme/'.$themeBase.'/$1.gif)',$source);
					$source = preg_replace("/\(\"?(.*?)images\/loading.gif\"?\)/",'(/design/widgets/'.$val['type'].'/theme/'.$themeBase.'/images/loading.gif)',$source);
					$source = preg_replace("/[\r\n	]/",'',$source);

					if(!in_array($source, $data['css'])){
						$data['css'][] = $source;
					}
				}
			}

			//自定义样式
			$style = $val['theme']['style'];
			if(!empty($style)){
				$data['css'][] = "#w-".$val['type']."-$cycle{";
				foreach($style as $k => $v){
					//间距
					if($k == "margin"){
						$data['css'][] = "margin:".value_change($v['top'])." ".value_change($v['right'])." ".value_change($v['bottom'])." ".value_change($v['left']).";";

					//填充
					}elseif($k == "padding"){
						$data['css'][] = "padding:".value_change($v['top'])." ".value_change($v['right'])." ".value_change($v['bottom'])." ".value_change($v['left']).";";

					//背景
					}elseif($k == "background"){
						if(!empty($v['attachment'])){
							$data['css'][] = "background-attachment:".$v['attachment'].";";
						}
						if(!empty($v['color'])){
							$data['css'][] = "background-color:".$v['color'].";";
						}
						if(!empty($v['image'])){
							$data['css'][] = "background-image:".$v['image'].";";
						}
						if(!empty($v['position'])){
							$data['css'][] = "background-position:".$v['position'].";";
						}
						if(!empty($v['repeat'])){
							$data['css'][] = "background-repeat:".$v['repeat'].";";
						}

					//边框
					}elseif($k == "border"){

						$style = $v['style'];
						$data['css'][] = "border-style:".($style['top'] ? $style['top'] : "none")." ".($style['right'] ? $style['right'] : "none")." ".($style['bottom'] ? $style['bottom'] : "none")." ".($style['left'] ? $style['left'] : "none").";";
						$width = $v['width'];
						if(!empty($width['top'])){
							$data['css'][] = "border-top-width:".$width['top'].";";
						}
						if(!empty($width['right'])){
							$data['css'][] = "border-right-width:".$width['right'].";";
						}
						if(!empty($width['bottom'])){
							$data['css'][] = "border-bottom-width:".$width['bottom'].";";
						}
						if(!empty($width['left'])){
							$data['css'][] = "border-left-width:".$width['left'].";";
						}
						$color = $v['color'];
						if(!empty($color['top'])){
							$data['css'][] = "border-top-color:".$color['top'].";";
						}
						if(!empty($color['right'])){
							$data['css'][] = "border-right-color:".$color['right'].";";
						}
						if(!empty($color['bottom'])){
							$data['css'][] = "border-bottom-color:".$color['bottom'].";";
						}
						if(!empty($color['left'])){
							$data['css'][] = "border-left-color:".$color['left'].";";
						}

					}else{
						$data['css'][] = $k.":".$v.";";
					}
				}
				$data['css'][] = "}";
			}

			//拼接组件内容
			//分栏较特殊，页面结构需要单独设置，此处需要计算出每栏的宽度和间距（$type值由上次循环所传）
			if($type == "columnbox"){
				$w = (100*$val['aliquot'])/12;
				$columnSpacing = compute_dim($arr['params']['columnSpacing'], "/", 2);
				if($key == 0){
					$data['css'][] = "#w-area-$cycle{margin-right:".$columnSpacing."}";
				}elseif($key == count($arr['items'])-1){
					$data['css'][] = "#w-area-$cycle{margin-left:".$columnSpacing."}";
				}else{
					$data['css'][] = "#w-area-$cycle{margin:0 ".$columnSpacing."}";
				}

				$data['html'][] = "<div class=\"w-col\" style=\"width:$w%\">";
				$data['html'][] = "<div id=\"w-area-$cycle\" data-type=\"area\" class=\"n-widget w-area\">";

			//其它正常情况
			}else{
				$themeClass = $dataParam = "";
				if(!empty($themeBase) && $val['type'] != "body"){
					$themeClass = " t-".$val['type']."-".$themeBase;
				}

				$data['css'][] = "#w-".$val['type']."-$cycle{text-align:".$val['params']['align'].";}";

				//如果是音频需要要外层增加地址参数
				if($val['type'] == "audio"){
					if(!empty($val['params']['audio'])){
						$dataParam = " data-audio=\"".$val['params']['audio']."\"";
					}
					if(!empty($val['params']['autoplay'])){
						$dataParam .= " data-autoplay=\"1\"";
					}
				}

				//如果是图片需要判断是否增加点击放大参数
				if($val['type'] == "image"){
					if(!empty($val['params']['lightbox']) && empty($val['params']['link'])){
						$dataParam = " data-lightbox=\"1\"";
					}
				}

				//如果标签需要配置切换方式
				if($val['type'] == "tabbox"){
					$dataParam = " data-method=\"".$val['params']['method']."\"";
				}

				//如果是幻灯片需要配置宽高
				if($val['type'] == "slider"){
					$dataParam = ' data-width="'.$val['params']['width'].'" data-height="'.$val['params']['height'].'"';
				}

				$data['html'][] = "<div id=\"w-".$val['type']."-$cycle\" data-type=\"".$val['type']."\" class=\"n-widget w-".$val['type'].$themeClass."\"$dataParam>";

				//导航条
				if($val['type'] == "menu"){
					$data['html'][] = "<div class=\"w-menu-container\"><ul class=\"w-menu-list\">";
					$menus = $val['params']['menus'];
					$m_count = 1;
                    if($menus){
                        foreach($menus as $m_key => $m_val){
                            $m_class = $active = $target = "";
                            if($m_count == 1){
                                $m_class = " w-menu-item-first";
                            }elseif($m_count == count($menus)){
                                $m_class = " w-menu-item-last";
                            }

                            //链接地址
                            $href = $m_val['href'];
                            $pagename = str_replace(".html", "", str_replace("{PROJECT_PAGES_BASE}", "", $href));
                            if($alias == $pagename && !empty($m_val['pageid'])){
                                $active = " active";
                            }

                            //站内链接
                            if(!empty($m_val['pageid'])){
                                $param = array(
                                    "service"  => "website",
                                    "template" => ($pagetype == "template" ? "preview" : "site").$projectid,
                                    "alias"    => $pagename
                                );
                                $href = getUrlPath($param);
                                // $href = str_replace("{PROJECT_PAGES_BASE}", "./", $href);
                            }

                            //打开方式
                            if(!empty($m_val['target'])){
                                $target = " target=\"_blank\"";
                            }


                            $data['html'][] = "<li class=\"w-menu-item".$m_class.$active."\"><a href=\"$href\"$target>".$m_val['title']."</a>";

                            //二级菜单
                            if($m_val['subnav']){
                                $data['html'][] = "<ul class=\"w-submenu-list\">";
                                foreach($m_val['subnav'] as $m_key_ => $m_val_){
                                    //链接地址
                                    $href = $m_val_['href'];
                                    $pagename = str_replace(".html", "", str_replace("{PROJECT_PAGES_BASE}", "", $href));
                                    if($alias == $pagename && !empty($m_val_['pageid'])){
                                        $active = " active";
                                    }

                                    //站内链接
                                    if(!empty($m_val_['pageid'])){
                                        $param = array(
                                            "service"  => "website",
                                            "template" => "preview".$projectid,
                                            "alias"    => $pagename
                                        );
                                        $href = getUrlPath($param);
                                        // $href = str_replace("{PROJECT_PAGES_BASE}", "./", $href);
                                    }

                                    //打开方式
                                    if(!empty($m_val_['target'])){
                                        $target = " target=\"_blank\"";
                                    }
                                    $data['html'][] = "<li><a href=\"$href\"$target>".$m_val_['title']."</a></li>";
                                }
                                $data['html'][] = "</ul>";
                            }

                            $data['html'][] = "</li>";

                            if($m_count != count($menus)){
                                $data['html'][] = "<li class=\"w-menu-divider\"><span class=\"w-menu-divider-item\"></span></li>";
                            }

                            $m_count++;
                        }
                    }
					$data['html'][] = "</ul></div>";

				//文字
				}elseif($val['type'] == "text"){
					$data['html'][] = str_replace("{PROJECT_PAGES_BASE}", $pageurl . '/', htmlspecialchars_decode($val['params']['text']));

				//分割线
				}elseif($val['type'] == "divider"){

					$data['css'][] = "#w-divider-$cycle hr{border-width:".$val['params']['height']." 0 0 0; border-style:".$val['params']['style']."; border-color:".$val['params']['color']."}";
					$data['html'][] = "<hr />";

				//音频
				}elseif($val['type'] == "audio"){

					//脚本
					$data['javascript'][] = defineJS('/design/widgets/audio/jplayer/jplayer.js');
					$data['javascript'][] = defineJS('/design/widgets/audio/view.js');
					$data['javascript'][] = "define(function(require){var $=require('jquery'), V = {\"w-audio-$cycle\":require(\"/design/widgets/audio/view.js\")};$(function(){\$('.n-widget').each(function(){var t=$(this),v=V[t.attr('id')];v&&v(t)})})}).exec();\r\n";

					$cycle++;
					$align = $val['params']['align'];
					$margin = "margin-left:auto;margin-right:auto;";
					if($align == "left"){
						$margin = "margin-left:0;margin-right:auto;";
					}elseif($align == "right"){
						$margin = "margin-left:auto;margin-right:0;";
					}
					$data['css'][] = "#w-audio-$cycle-c{".$margin."}";

					$data['html'][] = '<div id="w-audio-'.$cycle.'-c"class="w-audio-container"><div class="w-audio-shadow-left"></div><div class="w-audio-player"></div><div class="w-audio-control-container"><div class="w-audio-control"><a class="w-audio-icon w-audio-play jp-play"title="播放"></a><a class="w-audio-icon w-audio-pause jp-pause"title="暂停"></a></div><div class="w-audio-track jp-progress"><div class="w-audio-bar w-audio-track-bar jp-seek-bar"><div class="w-audio-percent w-audio-track-percent jp-play-bar"></div></div><span class="w-audio-track-playtime jp-current-time">00:00</span><span class="w-audio-track-totaltime jp-duration">--:--</span></div><div class="w-audio-volume"><a class="w-audio-icon w-audio-volume-normal jp-unmute"title="恢复音量"></a><a class="w-audio-icon w-audio-volume-mute jp-mute"title="静音"></a><div class="w-audio-bar w-audio-volume-bar jp-volume-bar"><div class="w-audio-percent w-audio-volume-percent jp-volume-bar-value"></div></div></div></div><div class="w-audio-shadow-right"></div></div>';

				//图片
				}elseif($val['type'] == "image"){

					//脚本
					$data['javascript'][] = defineJS('/design/ui/imgmax.js');
					$data['javascript'][] = defineJS('/design/ui/fancybox.js');
					$data['javascript'][] = defineJS('/design/widgets/image/view.js');
					$data['javascript'][] = "define(function(require){var $ = require('jquery'), V = {\"w-image-$cycle\":require(\"/design/widgets/image/view.js\")};$(function(){\$('.n-widget').each(function(){var t=$(this),v=V[t.attr('id')];v&&v(t)})})}).exec();";

					$fancyboxCss = readFileContent(HUONIAOROOT."/design/ui/fancybox/style.css");
					$fancyboxCss = preg_replace("/\(\'(.*?).jpg\'\)/",'(/design/ui/fancybox/$1.jpg)',$fancyboxCss);
					$fancyboxCss = preg_replace("/\(\'(.*?).png\'\)/",'(/design/ui/fancybox/$1.png)',$fancyboxCss);
					$fancyboxCss = preg_replace("/\(\'(.*?).gif\'\)/",'(/design/ui/fancybox/$1.gif)',$fancyboxCss);
					$fancyboxCss = preg_replace("/\s?\{\s?/",'{',$fancyboxCss);
					$fancyboxCss = preg_replace("/:\s+/",':',$fancyboxCss);
					$fancyboxCss = preg_replace("/;\s+/",';',$fancyboxCss);
					$fancyboxCss = preg_replace("/[\r\n	]/",'',$fancyboxCss);
					$data['css'][] = $fancyboxCss;

					$data['css'][] = "#w-image-$cycle{text-align:".$val['params']['align']."}";
					$data['css'][] = "#w-image-$cycle img{";
					if(!empty($val['params']['width'])){
						$data['css'][] = "width:".$val['params']['width'].";";
					}
					if(!empty($val['params']['height'])){
						$data['css'][] = "height:".$val['params']['height'].";";
					}
					if(!empty($val['params']['padding'])){
						$data['css'][] = "padding:".$val['params']['padding'].";";
					}
					if(!empty($val['params']['borderColor'])){
						$data['css'][] = "border:1px solid ".$val['params']['borderColor'].";";
					}
					$data['css'][] = "}";

					$sty = "";
					if(!empty($val['params']['lightbox']) && empty($val['params']['link'])){
						$sty = " style=\"cursor:pointer;\"";
					}

					if(!empty($val['params']['link'])){
						$href = $target = "";
						$href = str_replace("{PROJECT_PAGES_BASE}", $pageurl . '/', $val['params']['link']['href']);
						if(!empty($val['params']['link']['target'])){
							$target = " target=\"".$val['params']['link']['target']."\"";
						}
						$data['html'][] = "<a href=\"$href\"$target>";
					}

					$data['html'][] = "<img src=\"".$val['params']['image']."\"$sty>";

					if(!empty($val['params']['link'])){
						$data['html'][] = "</a>";
					}

					if(!empty($val['params']['title'])){
						$data['html'][] = "<p class=\"caption\">".$val['params']['title']."</p>";
					}

				//视频
				}elseif($val['type'] == "video"){

					$video = $val['params']['video'];

					//手机端
					if(isMobile()){

						//优酷
						if(preg_match("/player.youku.com/", $video)){
							$exp = explode("/", $video);
							$vid = $exp[count($exp)-2];

							$video = 'http://player.youku.com/embed/'.$vid;

						//腾讯
						}elseif(preg_match("/video.qq.com/", $video)){
							$vid = getUrlQuery($video, "vid");
							$auto = getUrlQuery($video, "auto");

							$video = 'http://v.qq.com/iframe/player.html?vid='.$vid.'&tiny=0&auto='.$auto;
						}

						$data['html'][] = '<div style="text-align:center; margin-bottom:10px;"><iframe frameborder="0" width="'.$val['params']['width'].'" height="'.$val['params']['height'].'" allowtransparency="true" src="'.$video.'"></iframe></div>';


					//PC端
					}else{

						$data['html'][] = '<video class="video-js" controls autoplay preload="auto" data-setup="{}" style="width: '.$val['params']['width'].'; height: '.$val['params']['height'].';"><source src="'.$video.'"></video>';

					}

				//图组
				}elseif($val['type'] == "gallery"){

					//脚本
					$data['javascript'][] = defineJS('/design/ui/imgmax.js');
					$data['javascript'][] = defineJS('/design/ui/fancybox.js');
					$data['javascript'][] = defineJS('/design/widgets/gallery/view.js');
					$data['javascript'][] = "define(function(require){var $ = require('jquery'), V = {\"w-gallery-$cycle\":require(\"/design/widgets/gallery/view.js\")};$(function(){\$('.n-widget').each(function(){var t=$(this),v=V[t.attr('id')];v&&v(t)})})}).exec();";

					$fancyboxCss = readFileContent(HUONIAOROOT."/design/ui/fancybox/style.css");
					$fancyboxCss = preg_replace("/\(\'(.*?).jpg\'\)/",'(/design/ui/fancybox/$1.jpg)',$fancyboxCss);
					$fancyboxCss = preg_replace("/\(\'(.*?).png\'\)/",'(/design/ui/fancybox/$1.png)',$fancyboxCss);
					$fancyboxCss = preg_replace("/\(\'(.*?).gif\'\)/",'(/design/ui/fancybox/$1.gif)',$fancyboxCss);
					$fancyboxCss = preg_replace("/\s?\{\s?/",'{',$fancyboxCss);
					$fancyboxCss = preg_replace("/:\s+/",':',$fancyboxCss);
					$fancyboxCss = preg_replace("/;\s+/",';',$fancyboxCss);
					$fancyboxCss = preg_replace("/[\r\n	]/",'',$fancyboxCss);
					$data['css'][] = $fancyboxCss;

					$lightbox = " data-lightbox=\"0\"";
					if($val['params']['lightbox'] == 1){
						$lightbox = " data-lightbox=\"1\"";
					}

					$data['html'][] = '<div class="imageGalleryContainer imageGalleryexport"'.$lightbox.'>';
					$data['html'][] = '<ul class="imageGallery" data-istitle="false" style="overflow:hidden;zoom:1;">';

					$column = 100/$val['params']['column'];
					$gallery = $val['params']['gallery'];
					$fancyboxGroup = "fancyboxGroup".GetMkTime(time());
					if(!empty($gallery)){
						foreach($gallery as $g_key => $g_val){
							$href = str_replace("{PROJECT_PAGES_BASE}", $pageurl . '/', $g_val['url']);
							$dataParam = "";
							$thumb_css = str_replace("move", "pointer", $g_val['thumb_css']);
							$paddbottom = "75%";
							if($val['params']['clip'] == "square"){
								$paddbottom = "100%";
							}
							if($val['params']['lightbox'] == 1){
								$href = $g_val['image'];
								$dataParam = "rel='".$fancyboxGroup."'";
							}


							$data['html'][] = '<li class="item" style="vertical-align:top; cursor:pointer; width:'.$column.'%">';
							$data['html'][] = '<div class="marginItem" style="padding:'.$val['params']['margin'].'px;">';
							$data['html'][] = '<div class="borderItem" style="border:'.($val['params']['border'] == 0 ? "none" : "1px solid rgb(204, 204, 204)").';min-height:0;padding:'.$val['params']['border'].'px">';
							$data['html'][] = '<a target="'.$g_val['target'].'" class="gallerylink fancybox" href="'.$href.'" style="position:relative;display:block;overflow:hidden;zoom:1;padding-bottom:'.$paddbottom.';"'.$dataParam.'>';

							if($val['params']['titlepos'] == "over"){
								$data['html'][] = '<p style="display:block" class="over-title">'.$g_val['title'].'</p>';
							}

							$data['html'][] = '<img src="'.$g_val['image'].'" style="'.$thumb_css.'">';
							$data['html'][] = '</a>';
							$data['html'][] = '</div>';
							$data['html'][] = '</div>';

							if($val['params']['titlepos'] == "bottom"){
								$data['html'][] = '<p class="bottom-title"><a target="'.$g_val['target'].'" href="'.$href.'">'.$g_val['title'].'</a></p>';
							}

							$data['html'][] = '</li>';
						}
					}

					$data['html'][] = '</ul>';
					$data['html'][] = '</div>';

				//关注
				}elseif($val['type'] == "follow"){

					//脚本
					$data['javascript'][] = defineJS('/design/widgets/follow/tiptip.js');
					$data['javascript'][] = defineJS('/design/widgets/follow/view.js');
					$data['javascript'][] = "define(function(require){var $ = require('jquery'), V = {\"w-follow-$cycle\":require(\"/design/widgets/follow/view.js\")};$(function(){\$('.n-widget').each(function(){var t=$(this),v=V[t.attr('id')];v&&v(t)})})}).exec();";

					$tiptipCss = readFileContent(HUONIAOROOT."/design/widgets/follow/tiptip.css");
					$tiptipCss = preg_replace("/\s?\{\s?/",'{',$tiptipCss);
					$tiptipCss = preg_replace("/:\s+/",':',$tiptipCss);
					$tiptipCss = preg_replace("/;\s+/",';',$tiptipCss);
					$tiptipCss = preg_replace("/[\r\n	]/",'',$tiptipCss);
					$data['css'][] = $tiptipCss;

					$data['html'][] = '<div class="w-follow-container w-follow-align-'.$val['params']['align'].' w-follow-size-'.$val['params']['size'].'">';
					$data['html'][] = '<span class="w-follow-text">'.$val['params']['text'].'</span>';
					$data['html'][] = '<span class="w-follow-items">';
					$items = $val['params']['items'];
					if(!empty($items)){
						foreach($items as $i_key => $i_val){
							$t = $href = "";
							if($i_val['type'] == "tencent-weibo"){
								$t = "腾迅微博";
								$href = ' href="'.$i_val['href'].'" target="_blank"';
							}elseif($i_val['type'] == "sina-weibo"){
								$t = "新浪微博";
								$href = ' href="'.$i_val['href'].'" target="_blank"';
							}elseif($i_val['type'] == "weixin"){
								$t = "微信";
								$href = ' data-weixin="'.$i_val['src'].'"';
							}
							$data['html'][] = '<a class="w-follow-item '.$i_val['type'].'"'.$href.' title="关注我们的'.$t.'">关注我们的'.$t.'</a>';
						}
					}
					$data['html'][] = '</span>';
					$data['html'][] = '</div>';

				//QQ客服
				}elseif($val['type'] == "wpqq"){

					$wright = "";
					if($val['params']['align'] == "center"){
						$data['css'][] = '#w-wpqq-'.$cycle.' .wpqq-wrap{width:'.$val['params']['width'].'px;margin:0 auto;}';
					}
					if($val['params']['align'] == "right"){
						$wright = " wpqq-wrap-right";
					}
					if($val['params']['layout'] == "fixed"){
						$wright = " wpqq-wrap-fixed";
					}

					$data['html'][] = '<div class="wpqq-wrap'.$wright.'">';

					if($val['params']['layout'] == "fixed"){
						$data['html'][] = '<div class="wpqq-wrap-head"></div>';
						$data['html'][] = '<div class="wpqq-wrap-fixed-content">';
					}

					$qqs = $val['params']['qq'];
					if(!empty($qqs)){
						foreach($qqs as $q_key => $q_val){
							$itemClass = "";
							if($val['params']['layout'] == "horizontal"){
								$itemClass = " wpqq-item-float";
							}
							$data['html'][] = '<div class="wpqq-item'.$itemClass.'"><a target="_blank" href="http://wpa.qq.com/msgrd?v=3&uin='.$q_val['qq'].'&site=qq&menu=yes"><div class="img"><img border="0" src="http://wpa.qq.com/pa?p=2:'.$q_val['qq'].':52" alt="点击这里给我发消息" title="点击这里给我发消息"></div><span class="alias">'.$q_val['alias'].'</span></a></div>';
						}
					}

					if($val['params']['layout'] == "fixed"){
						$data['html'][] = '</div>';
					}
					$data['html'][] = '</div>';

				//分享
				}elseif($val['type'] == "share"){

					$data['css'][] = '.w-share #bdshare, .w-share #bdshare *{-webkit-box-sizing:content-box;-moz-box-sizing:content-box;box-sizing:content-box;}';
					$data['css'][] = '#w-share-'.$cycle.'{text-align:'.$val['params']['align'].'}';

					$share = $val['params']['share'];
					$number = $val['params']['number'] == 1 ? '<a class="shareCount" href="#" title="累计分享0次">0</a>' : "";
					//图标
					if($share['type'] == "icon"){
						if($share['name'] == 1){
							$data['html'][] = '<div id="bdshare" class="bdshare_t bds_tools get-codes-bdshare"><span class="bds_more">分享到：</span><a class="bds_qzone" title="分享到QQ空间" href="#"></a><a class="bds_tsina" title="分享到新浪微博" href="#"></a><a class="bds_tqq" title="分享到腾讯微博" href="#"></a><a class="bds_renren" title="分享到人人网" href="#"></a><a class="bds_t163" title="分享到网易微博" href="#"></a>'.$number.'</div>';
						}elseif($share['name'] == 2){
							$data['html'][] = '<div id="bdshare" class="bdshare_t bds_tools get-codes-bdshare"><a class="bds_qzone" title="分享到QQ空间" href="#"></a><a class="bds_tsina" title="分享到新浪微博" href="#"></a><a class="bds_tqq" title="分享到腾讯微博" href="#"></a><a class="bds_renren" title="分享到人人网" href="#"></a><a class="bds_t163" title="分享到网易微博" href="#"></a><span class="bds_more">更多</span>'.$number.'</div>';
						}elseif($share['name'] == 3){
							$data['html'][] = '<div id="bdshare" class="bdshare_t bds_tools_32 get-codes-bdshare"><a class="bds_qzone" title="分享到QQ空间" href="#"></a><a class="bds_tsina" title="分享到新浪微博" href="#"></a><a class="bds_tqq" title="分享到腾讯微博" href="#"></a><a class="bds_renren" title="分享到人人网" href="#"></a><a class="bds_t163" title="分享到网易微博" href="#"></a><span class="bds_more"></span>'.$number.'</div>';
						}
					//按钮
					}elseif($share['type'] == "button"){
						$data['html'][] = '<div id="bdshare" class="bdshare_b" style="line-height: 12px;"><img src="http://bdimg.share.baidu.com/static/images/type-button-'.$share['name'].'.jpg?cdnversion=20120831">'.$number.'</div>';
					//文字
					}elseif($share['type'] == "text"){
						if($share['name'] == 1){
							$data['html'][] = '<div id="bdshare" class="bdshare_t bds_tools get-codes-bdshare"><span class="bds_more">分享到：</span><a class="bds_qzone" title="分享到QQ空间" href="#">QQ空间</a><a class="bds_tsina" title="分享到新浪微博" href="#">新浪微博</a><a class="bds_tqq" title="分享到腾讯微博" href="#">腾讯微博</a><a class="bds_renren" title="分享到人人网" href="#">人人网</a><a class="bds_t163" title="分享到网易微博" href="#">网易微博</a>'.$number.'</div>';
						}elseif($share['name'] == 2){
							$data['html'][] = '<div id="bdshare" class="bdshare_t bds_tools get-codes-bdshare"><a class="bds_qzone" title="分享到QQ空间" href="#">QQ空间</a><a class="bds_tsina" title="分享到新浪微博" href="#">新浪微博</a><a class="bds_tqq" title="分享到腾讯微博" href="#">腾讯微博</a><a class="bds_renren" title="分享到人人网" href="#">人人网</a><a class="bds_t163" title="分享到网易微博" href="#">网易微博</a><span class="bds_more">更多</span>'.$number.'</div>';
						}
					}

					$mini = $share['type'] == "slide" ? ($val['params']['slideMini'] == 1 ? '&mini=1' : "") : ($val['params']['mini'] == 1 ? '&mini=1' : "");
					$shareType = "type=tools";
					if($share['type'] == "slide"){
						$shareType = "type=slide&img=".$share['name']."&pos=".$val['params']['slidePosition']."";
					}
					$data['html'][] = '<script type="text/javascript" id="bdshare_js" data="'.$shareType.$mini.'" src="http://bdimg.share.baidu.com/static/js/bds_s_v2.js?cdnversion=389414"></script>';

				//按钮
				}elseif($val['type'] == "button"){

					$data['css'][] = '#w-button-'.$cycle.'{text-align:'.$val['params']['align'].'}';
					$data['css'][] = '#w-button-'.$cycle.' .w-button-container{width:'.$val['params']['width'].'}';

					$href = "javascript:;";
					$target = "";
					$link = $val['params']['link'];
					if(!empty($link)){
						if(!empty($link['href'])){
							$href = str_replace("{PROJECT_PAGES_BASE}", $pageurl . '/', $link['href']);
						}
						if(!empty($link['target'])){
							$target = " target=\"".$link['target']."\"";
						}
					}
					$data['html'][] = '<a href="'.$href.'"'.$target.' class="w-button-container"><span class="w-button-text"><i class="middle"></i><b class="text">'.$val['params']['text'].'</b></span><i class="w-button-right"></i></a>';

				//标题
				}elseif($val['type'] == "titlebox"){

					$cycle++;
					$heading = $val['heading'];
					//自定义样式
					$style = $heading['theme']['style'];
					if(!empty($style)){
						$data['css'][] = "#w-".$heading['type']."-$cycle{";
						foreach($style as $k => $v){
							//间距
							if($k == "margin"){
								$data['css'][] = "margin:".value_change($v['top'])." ".value_change($v['right'])." ".value_change($v['bottom'])." ".value_change($v['left']).";";

							//填充
							}elseif($k == "padding"){
								$data['css'][] = "padding:".value_change($v['top'])." ".value_change($v['right'])." ".value_change($v['bottom'])." ".value_change($v['left']).";";

							//背景
							}elseif($k == "background"){
								if(!empty($v['attachment'])){
									$data['css'][] = "background-attachment:".$v['attachment'].";";
								}
								if(!empty($v['color'])){
									$data['css'][] = "background-color:".$v['color'].";";
								}
								if(!empty($v['image'])){
									$data['css'][] = "background-image:".$v['image'].";";
								}
								if(!empty($v['position'])){
									$data['css'][] = "background-position:".$v['position'].";";
								}
								if(!empty($v['repeat'])){
									$data['css'][] = "background-repeat:".$v['repeat'].";";
								}

							//边框
							}elseif($k == "border"){

								$style = $v['style'];
								$data['css'][] = "border-style:".($style['top'] ? $style['top'] : "none")." ".($style['right'] ? $style['right'] : "none")." ".($style['bottom'] ? $style['bottom'] : "none")." ".($style['left'] ? $style['left'] : "none").";";
								$width = $v['width'];
								if(!empty($width['top'])){
									$data['css'][] = "border-top-width:".$width['top'].";";
								}
								if(!empty($width['right'])){
									$data['css'][] = "border-right-width:".$width['right'].";";
								}
								if(!empty($width['bottom'])){
									$data['css'][] = "border-bottom-width:".$width['bottom'].";";
								}
								if(!empty($width['left'])){
									$data['css'][] = "border-left-width:".$width['left'].";";
								}
								$color = $v['color'];
								if(!empty($color['top'])){
									$data['css'][] = "border-top-color:".$color['top'].";";
								}
								if(!empty($color['right'])){
									$data['css'][] = "border-right-color:".$color['right'].";";
								}
								if(!empty($color['bottom'])){
									$data['css'][] = "border-bottom-color:".$color['bottom'].";";
								}
								if(!empty($color['left'])){
									$data['css'][] = "border-left-color:".$color['left'].";";
								}

							}else{
								$data['css'][] = $k.":".$v.";";
							}
						}
						$data['css'][] = "}";
					}

					//组件风格
					$themeBase = $heading['theme']['base'];
					if(!empty($themeBase)){
						$m_file = HUONIAOROOT."/design/widgets/".$heading['type']."/info.json";
						$json = json_decode(readFileContent($m_file));
						if(!empty($json)){
							$json = objtoarr($json);
							$theme = $json['theme'];

							$source = "";
							foreach($theme as $k => $v){
								if($v['name'] == $themeBase){
									$source = $v['source'];
								}
							}

							//less代码解析
							$source = $less->compile($source);
							$source = preg_replace("/\s?\{\s?/",'{',$source);
							$source = preg_replace("/:\s+/",':',$source);
							$source = preg_replace("/;\s+/",';',$source);
							$source = preg_replace("/\((.*?).jpg\)/",'(/design/widgets/'.$val['type'].'/theme/'.$themeBase.'/$1.jpg)',$source);
							$source = preg_replace("/\((.*?).png\)/",'(/design/widgets/'.$val['type'].'/theme/'.$themeBase.'/$1.png)',$source);
							$source = preg_replace("/\((.*?).gif\)/",'(/design/widgets/'.$val['type'].'/theme/'.$themeBase.'/$1.gif)',$source);
							$source = preg_replace("/\(\"?(.*?)images\/loading.gif\"?\)/",'(/design/widgets/'.$val['type'].'/theme/'.$themeBase.'/images/loading.gif)',$source);
							$source = preg_replace("/[\r\n	]/",'',$source);

							if(!in_array($source, $data['css'])){
								$data['css'][] = $source;
							}
						}
					}

					$fontSize   = $heading['params']['font-size'];
					$color      = $heading['params']['color'];
					$hoverColor = $heading['params']['hover-color'];

					$style = "";
					if(!empty($fontSize)){
						$style .= "font-size:".$fontSize.";";
					}
					if(!empty($color)){
						$style .= "color:".$color.";";
					}

					if(!empty($style)){
						$data['css'][] = "#w-heading-$cycle h2, #w-heading-$cycle h2 a{".$style."}";
					}
					if(!empty($hoverColor)){
						$data['css'][] = "#w-heading-$cycle h2 a:hover{color:$hoverColor;}";
					}

					$t = $heading['params']['title'];
					$link  = $heading['params']['link'];
					$href = str_replace("{PROJECT_PAGES_BASE}", $pageurl . '/', $link['href']);
					if(!empty($link)){
						$t = '<a href="'.$href.'" target="'.$link['target'].'">'.$t.'</a>';
					}


					$data['html'][] = "<div id=\"w-".$heading['type']."-$cycle\" data-type=\"heading\" class=\"n-widget w-heading t-heading-".$heading['theme']['base']."\"><i class=\"middle\"></i><h2><i></i>".$t."</h2></div>";


				//标签
				}elseif($val['type'] == "tabbox"){

					//脚本
					$data['javascript'][] = defineJS('/design/widgets/tabbox/view.js');
					$data['javascript'][] = "define(function(require){var $ = require('jquery'), V = {\"w-tabbox-$cycle\":require(\"/design/widgets/tabbox/view.js\")};$(function(){\$('.n-widget').each(function(){var t=$(this),v=V[t.attr('id')];v&&v(t)})})}).exec();";

					$item = $val['items'];
					if(!empty($item)){
						//Tab标签
						$data['html'][] = '<div class="w-tabbox-tabs t-tabbox-'.$val['theme']['base'].'-tabs"><ul class="w-tabbox-list">';
						foreach($item as $i_key => $i_val){
							$class = "";
							if($i_key == 0){
								$class = " first active";
							}elseif($i_key == count($item)-1){
								$class = " last";
							}
							//$tags
							$data['html'][] = '<li class="w-tabbox-tab'.$class.'"><a>'.$i_val['title'].'</a></li>';
						}
						$data['html'][] = '</ul></div>';

						//Tab内容
						$data['html'][] = '<div class="w-tabbox-contents t-tabbox-'.$val['theme']['base'].'-contents">';
						foreach($item as $i_key => $i_val){
							$class = "";
							if($i_key == 0){
								$class = " first active";
							}elseif($i_key == count($item)-1){
								$class = " last";
							}
							//$cons
							$cycle++;

							//自定义样式
							$style = $i_val['content']['theme']['style'];
							if(!empty($style)){
								$data['css'][] = "#w-area-$cycle{";
								foreach($style as $k => $v){
									//间距
									if($k == "margin"){
										$data['css'][] = "margin:".value_change($v['top'])." ".value_change($v['right'])." ".value_change($v['bottom'])." ".value_change($v['left']).";";

									//填充
									}elseif($k == "padding"){
										$data['css'][] = "padding:".value_change($v['top'])." ".value_change($v['right'])." ".value_change($v['bottom'])." ".value_change($v['left']).";";

									//背景
									}elseif($k == "background"){
										if(!empty($v['attachment'])){
											$data['css'][] = "background-attachment:".$v['attachment'].";";
										}
										if(!empty($v['color'])){
											$data['css'][] = "background-color:".$v['color'].";";
										}
										if(!empty($v['image'])){
											$data['css'][] = "background-image:".$v['image'].";";
										}
										if(!empty($v['position'])){
											$data['css'][] = "background-position:".$v['position'].";";
										}
										if(!empty($v['repeat'])){
											$data['css'][] = "background-repeat:".$v['repeat'].";";
										}

									//边框
									}elseif($k == "border"){

										$style = $v['style'];
										$data['css'][] = "border-style:".($style['top'] ? $style['top'] : "none")." ".($style['right'] ? $style['right'] : "none")." ".($style['bottom'] ? $style['bottom'] : "none")." ".($style['left'] ? $style['left'] : "none").";";
										$width = $v['width'];
										if(!empty($width['top'])){
											$data['css'][] = "border-top-width:".$width['top'].";";
										}
										if(!empty($width['right'])){
											$data['css'][] = "border-right-width:".$width['right'].";";
										}
										if(!empty($width['bottom'])){
											$data['css'][] = "border-bottom-width:".$width['bottom'].";";
										}
										if(!empty($width['left'])){
											$data['css'][] = "border-left-width:".$width['left'].";";
										}
										$color = $v['color'];
										if(!empty($color['top'])){
											$data['css'][] = "border-top-color:".$color['top'].";";
										}
										if(!empty($color['right'])){
											$data['css'][] = "border-right-color:".$color['right'].";";
										}
										if(!empty($color['bottom'])){
											$data['css'][] = "border-bottom-color:".$color['bottom'].";";
										}
										if(!empty($color['left'])){
											$data['css'][] = "border-left-color:".$color['left'].";";
										}

									}else{
										$data['css'][] = $k.":".$v.";";
									}
								}
								$data['css'][] = "}";
							}

							$data['html'][] = '<div id="w-area-'.$cycle.'" data-type="area" class="n-widget w-area w-tabbox-content'.$class.'">';
							$cycle++;
							data_foreach($i_val['content']);
							$data['html'][] = '</div>';
						}
						$data['html'][] = '</div>';
					}

				//Flash
				}elseif($val['type'] == "Flash"){

					$params = $val['params'];
					$flashvars = $params['flashvars'] ? " flashvars=\"".$params['flashvars']."\"" : "";
					$data['html'][] = '<embed align="'.$params['align'].'" quality="high" allowscriptaccess="never" allownetworking="internal" allowfullscreen="true" wmode="transparent" type="application/x-shockwave-flash" src="'.$params['flash'].'" style="margin:0px auto;width:'.$params['width'].';height:'.$params['height'].';"'.$flashvars.'>';

				//slider
				}elseif($val['type'] == "slider"){

					//脚本
					$jsFile = '/design/widgets/slider/view.js';
					if($themeBase != "default"){
						$jsFile = '/design/widgets/slider/theme/'.$themeBase.'/view.js';
					}
					$data['javascript'][] = defineJS($jsFile);
					$data['javascript'][] = "define(function(require){var $ = require('jquery'), V = {\"w-slider-$cycle\":require(\"$jsFile\")};$(function(){\$('.n-widget').each(function(){var t=$(this),v=V[t.attr('id')];v&&v(t)})})}).exec();";


					if($themeBase == "05" || $themeBase == "06"){
						$data['html'][] = '<div class="slidesjs"><div class="ad-image-wrapper"></div><div class="ad-controls" style="display:none;"></div><div class="ad-nav"><div class="ad-thumbs"><ul class="ad-thumb-list">';
					}elseif($themeBase == "07" || $themeBase == "08"){
						$data['html'][] = '<div class="expose"><div class="exposeBar"><ul class="exposeThumbs">';
					}elseif($themeBase == "09"){
						$data['html'][] = '<ul class="roundabout">';
					}else{
						$data['html'][] = '<div class="slidesjs">';
					}

					$slider = $val['params']['slider'];
					if(!empty($slider)){
						foreach($slider as $s_key => $s_val){

							$url = str_replace("{PROJECT_PAGES_BASE}", $pageurl . '/', $s_val['url']);
							$href = !empty($url) ? " href='".$url."'" : "";
							$target = !empty($s_val['target']) ? " target='".$s_val['target']."'" : "";
							$alt = !empty($s_val['alt']) ? "alt='".$s_val['alt']."'" : "";

							if($themeBase == "05" || $themeBase == "06"){
								$data['html'][] = '<li><a class="thumblink"'.$href.$target.'> /<img src="'.$s_val['src'].'"'.$alt.'></a></li>';
							}elseif($themeBase == "07" || $themeBase == "08"){
								$data['html'][] = '<li> /<img src="'.$s_val['src'].'" _src="'.$s_val['src'].'"'.$alt.($href ? '_'.$href : "").($target ? '_'.$target : "").'></li>';
							}elseif($themeBase == "09"){
								$data['html'][] = '<li><a'.$href.$target.'> /<img src="'.$s_val['src'].'"'.$alt.'></a></li>';
							}else{
								$data['html'][] = '<div class="slidesjs-slide"><a class="thumblink"'.$href.$target.'> /<img src="'.$s_val['src'].'"'.$alt.'></a></div>';
							}
						}
					}

					if($themeBase == "05" || $themeBase == "06"){
						$data['html'][] = '</ul></div></div></div>';
					}elseif($themeBase == "07" || $themeBase == "08"){
						$data['html'][] = '</ul></div><div class="exposeTarget"><div class="prevnext"><a class="prev">左</a><a class="next">右</a></div></div></div>';
					}else{
						$data['html'][] = '</div>';
					}

				//图文
				}elseif($val['type'] == "image-text"){

					$imageHtml = $textHtml = "";

					//图片
					$cycle++;
					$image = $val['image']['params'];

					//自定义样式
					$style = $val['image']['theme']['style'];
					if(!empty($style)){
						$data['css'][] = "#w-image-$cycle{";

						if($val['params']['imagePosition'] == "left"){
							$data['css'][] = 'float:left;';
						}elseif($val['params']['imagePosition'] == "right"){
							$data['css'][] = 'float:right;';
						}

						$data['css'][] = "text-align:".$image['align'].";";
						foreach($style as $k => $v){
							//间距
							if($k == "margin"){
								$data['css'][] = "margin:".value_change($v['top'])." ".value_change($v['right'])." ".value_change($v['bottom'])." ".value_change($v['left']).";";

							//填充
							}elseif($k == "padding"){
								$data['css'][] = "padding:".value_change($v['top'])." ".value_change($v['right'])." ".value_change($v['bottom'])." ".value_change($v['left']).";";

							//背景
							}elseif($k == "background"){
								if(!empty($v['attachment'])){
									$data['css'][] = "background-attachment:".$v['attachment'].";";
								}
								if(!empty($v['color'])){
									$data['css'][] = "background-color:".$v['color'].";";
								}
								if(!empty($v['image'])){
									$data['css'][] = "background-image:".$v['image'].";";
								}
								if(!empty($v['position'])){
									$data['css'][] = "background-position:".$v['position'].";";
								}
								if(!empty($v['repeat'])){
									$data['css'][] = "background-repeat:".$v['repeat'].";";
								}

							//边框
							}elseif($k == "border"){

								$style = $v['style'];
								$data['css'][] = "border-style:".($style['top'] ? $style['top'] : "none")." ".($style['right'] ? $style['right'] : "none")." ".($style['bottom'] ? $style['bottom'] : "none")." ".($style['left'] ? $style['left'] : "none").";";
								$width = $v['width'];
								if(!empty($width['top'])){
									$data['css'][] = "border-top-width:".$width['top'].";";
								}
								if(!empty($width['right'])){
									$data['css'][] = "border-right-width:".$width['right'].";";
								}
								if(!empty($width['bottom'])){
									$data['css'][] = "border-bottom-width:".$width['bottom'].";";
								}
								if(!empty($width['left'])){
									$data['css'][] = "border-left-width:".$width['left'].";";
								}
								$color = $v['color'];
								if(!empty($color['top'])){
									$data['css'][] = "border-top-color:".$color['top'].";";
								}
								if(!empty($color['right'])){
									$data['css'][] = "border-right-color:".$color['right'].";";
								}
								if(!empty($color['bottom'])){
									$data['css'][] = "border-bottom-color:".$color['bottom'].";";
								}
								if(!empty($color['left'])){
									$data['css'][] = "border-left-color:".$color['left'].";";
								}

							}else{
								$data['css'][] = $k.":".$v.";";
							}
						}
						$data['css'][] = "}";
					}

					$data['css'][] = "#w-image-$cycle img{";
					if(!empty($image['width'])){
						$data['css'][] = "width:".$image['width'].";";
					}
					if(!empty($image['height'])){
						$data['css'][] = "height:".$image['height'].";";
					}
					if(!empty($image['padding'])){
						$data['css'][] = "padding:".$image['padding'].";";
					}
					if(!empty($image['borderColor'])){
						$data['css'][] = "border:1px solid ".$image['borderColor'].";";
					}
					$data['css'][] = "}";

					$sty = "";
					if(!empty($image['lightbox']) && empty($image['link'])){
						$sty = " style=\"cursor:pointer;\"";
					}
					$img = '<img src="'.$image['image'].'"'.$sty.' />';
					if(!empty($image['link'])){
						$href = str_replace("{PROJECT_PAGES_BASE}", $pageurl . '/', $image['link']['href']);
						$img = '<a href="'.$href.'" target="'.$image['link']['target'].'"><img src="'.$image['image'].'" /></a>';
					}
					$dataParam = "";
					if(!empty($image['lightbox']) && empty($image['link'])){
						$dataParam = " data-lightbox=\"1\"";
					}
					$caption = "";
					if(!empty($image['title'])){
						$caption = "<p class=\"caption\">".$image['title']."</p>";
					}
					$imageHtml = '<div id="w-image-'.$cycle.'" data-type="image" class="n-widget w-image"'.$dataParam.'>'.$img.$caption.'</div>';

					//文字
					$cycle++;
					$text = $val['text']['params'];

					//自定义样式
					$style = $val['text']['theme']['style'];
					if(!empty($style)){
						$data['css'][] = "#w-text-$cycle{";
						foreach($style as $k => $v){
							//间距
							if($k == "margin"){
								$data['css'][] = "margin:".value_change($v['top'])." ".value_change($v['right'])." ".value_change($v['bottom'])." ".value_change($v['left']).";";

							//填充
							}elseif($k == "padding"){
								$data['css'][] = "padding:".value_change($v['top'])." ".value_change($v['right'])." ".value_change($v['bottom'])." ".value_change($v['left']).";";

							//背景
							}elseif($k == "background"){
								if(!empty($v['attachment'])){
									$data['css'][] = "background-attachment:".$v['attachment'].";";
								}
								if(!empty($v['color'])){
									$data['css'][] = "background-color:".$v['color'].";";
								}
								if(!empty($v['image'])){
									$data['css'][] = "background-image:".$v['image'].";";
								}
								if(!empty($v['position'])){
									$data['css'][] = "background-position:".$v['position'].";";
								}
								if(!empty($v['repeat'])){
									$data['css'][] = "background-repeat:".$v['repeat'].";";
								}

							//边框
							}elseif($k == "border"){

								$style = $v['style'];
								$data['css'][] = "border-style:".($style['top'] ? $style['top'] : "none")." ".($style['right'] ? $style['right'] : "none")." ".($style['bottom'] ? $style['bottom'] : "none")." ".($style['left'] ? $style['left'] : "none").";";
								$width = $v['width'];
								if(!empty($width['top'])){
									$data['css'][] = "border-top-width:".$width['top'].";";
								}
								if(!empty($width['right'])){
									$data['css'][] = "border-right-width:".$width['right'].";";
								}
								if(!empty($width['bottom'])){
									$data['css'][] = "border-bottom-width:".$width['bottom'].";";
								}
								if(!empty($width['left'])){
									$data['css'][] = "border-left-width:".$width['left'].";";
								}
								$color = $v['color'];
								if(!empty($color['top'])){
									$data['css'][] = "border-top-color:".$color['top'].";";
								}
								if(!empty($color['right'])){
									$data['css'][] = "border-right-color:".$color['right'].";";
								}
								if(!empty($color['bottom'])){
									$data['css'][] = "border-bottom-color:".$color['bottom'].";";
								}
								if(!empty($color['left'])){
									$data['css'][] = "border-left-color:".$color['left'].";";
								}

							}else{
								$data['css'][] = $k.":".$v.";";
							}
						}
						$data['css'][] = "}";
					}

					$textContent = $source = preg_replace("/\{PROJECT_PAGES_BASE\}/", $pageurl . '/', $text['text']);
					$textHtml = '<div id="w-text-'.$cycle.'" data-type="text" class="n-widget w-text">'.$textContent.'</div>';

					//设置图片输出的位置
					if($val['params']['imagePosition'] == "bottom"){
						$data['html'][] = $textHtml.$imageHtml;
					}else{
						$data['html'][] = $imageHtml.$textHtml;
					}

				//地图
				}elseif($val['type'] == "map"){

					$data['css'][] = "#w-map-$cycle{text-align:".$val['params']['align'].";}";
					$data['html'][] = '<a href="'.$val['params']['point']['link'].'" target="_blank"><img src="'.$val['params']['point']['image'].'&width='.$val['params']['width'].'&height='.$val['params']['height'].'"></a>';

				//Iframe
				}elseif($val['type'] == "iframe"){

					$params = $val['params'];
					$cycle++;

					$scroll = $params['overflow'] != "auto" ? ' scrolling="no"' : "";

					$data['css'][] = '#w-iframe-'.$cycle.'-iframe{width:'.$params['width'].';height:'.$params['height'].';overflow:'.$params['overflow'].';}';

					$data['html'][] = '<div class="w-iframe-container"><iframe frameborder="0" allowtransparency="true" src="'.$params['src'].'"'.$scroll.' id="w-iframe-'.$cycle.'-iframe"></iframe></div>';

				//Html
				}elseif($val['type'] == "html"){

					$data['html'][] = $val['params']['html'];


				//新闻列表
				}elseif($val['type'] == "articlelist"){

					global $catid;
					global $appname;
					global $alias;

					$isList = 1;

					$params = $val['params'];
					$typeid = $params['catid'];
					if(!empty($catid)){
						$typeid = (int)$catid;
					}
					$data['html'][] = '<ul class="w-'.$val['type'].'-container" data-module="article" data-catid="'.$typeid.'" data-num="'.$params['num'].'" data-template="'.$params['template'].'" data-titleNum="'.$params['titleNum'].'" data-summaryNum="'.$params['summaryNum'].'" data-showCategory="'.$params['showCategory'].'" data-showTime="'.$params['showTime'].'" data-timeFormat="'.$params['timeFormat'].'" data-imageWidth="'.$params['imageWidth'].'" data-imageHeight="'.$params['imageHeight'].'" data-showPage="'.$params['showPage'].'"></ul>';

					$data['javascript'][] = 'getAppList("w-'.$val['type'].'-'.$cycle.'");';

				//产品列表
				}elseif($val['type'] == "productlist"){

					global $catid;
					global $appname;
					global $alias;

					$isList = 1;

					$params = $val['params'];
					$typeid = $params['catid'];
					if(!empty($catid)){
						$typeid = $catid;
					}
					$data['html'][] = '<ul class="w-'.$val['type'].'-container" data-module="product" data-catid="'.$typeid.'" data-num="'.$params['num'].'" data-template="'.$params['template'].'" data-titleNum="'.$params['titleNum'].'" data-summaryNum="'.$params['summaryNum'].'" data-showCategory="'.$params['showCategory'].'" data-showTime="'.$params['showTime'].'" data-timeFormat="'.$params['timeFormat'].'" data-imageWidth="'.$params['imageWidth'].'" data-imageHeight="'.$params['imageHeight'].'" data-showPage="'.$params['showPage'].'"></ul>';

					$data['javascript'][] = 'getAppList("w-'.$val['type'].'-'.$cycle.'");';

				//活动列表
				}elseif($val['type'] == "eventlist"){

					$isList = 1;

					$params = $val['params'];
					$data['html'][] = '<ul class="w-'.$val['type'].'-container" data-module="event" data-catid="'.$params['catid'].'" data-num="'.$params['num'].'" data-template="'.$params['template'].'" data-titleNum="'.$params['titleNum'].'" data-summaryNum="'.$params['summaryNum'].'" data-showCategory="'.$params['showCategory'].'" data-showTime="'.$params['showTime'].'" data-timeFormat="'.$params['timeFormat'].'" data-imageWidth="'.$params['imageWidth'].'" data-imageHeight="'.$params['imageHeight'].'" data-showPage="'.$params['showPage'].'"></ul>';

					$data['javascript'][] = 'getAppList("w-'.$val['type'].'-'.$cycle.'");';

				//案例列表
				}elseif($val['type'] == "caselist"){

					$isList = 1;

					$params = $val['params'];
					$data['html'][] = '<ul class="w-'.$val['type'].'-container" data-module="case" data-catid="'.$params['catid'].'" data-num="'.$params['num'].'" data-template="'.$params['template'].'" data-titleNum="'.$params['titleNum'].'" data-summaryNum="'.$params['summaryNum'].'" data-showCategory="'.$params['showCategory'].'" data-showTime="'.$params['showTime'].'" data-timeFormat="'.$params['timeFormat'].'" data-imageWidth="'.$params['imageWidth'].'" data-imageHeight="'.$params['imageHeight'].'" data-showPage="'.$params['showPage'].'"></ul>';

					$data['javascript'][] = 'getAppList("w-'.$val['type'].'-'.$cycle.'");';

				//视频列表
				}elseif($val['type'] == "videolist"){

					$isList = 1;

					$params = $val['params'];
					$data['html'][] = '<ul class="w-'.$val['type'].'-container" data-module="video" data-catid="'.$params['catid'].'" data-num="'.$params['num'].'" data-template="'.$params['template'].'" data-titleNum="'.$params['titleNum'].'" data-summaryNum="'.$params['summaryNum'].'" data-showCategory="'.$params['showCategory'].'" data-showTime="'.$params['showTime'].'" data-timeFormat="'.$params['timeFormat'].'" data-imageWidth="'.$params['imageWidth'].'" data-imageHeight="'.$params['imageHeight'].'" data-showPage="'.$params['showPage'].'"></ul>';

					$data['javascript'][] = 'getAppList("w-'.$val['type'].'-'.$cycle.'");';

				//全景列表
				}elseif($val['type'] == "360qjlist"){

					$isList = 1;

					$params = $val['params'];
					$data['html'][] = '<ul class="w-'.$val['type'].'-container" data-module="360qj" data-catid="'.$params['catid'].'" data-num="'.$params['num'].'" data-template="'.$params['template'].'" data-titleNum="'.$params['titleNum'].'" data-summaryNum="'.$params['summaryNum'].'" data-showCategory="'.$params['showCategory'].'" data-showTime="'.$params['showTime'].'" data-timeFormat="'.$params['timeFormat'].'" data-imageWidth="'.$params['imageWidth'].'" data-imageHeight="'.$params['imageHeight'].'" data-showPage="'.$params['showPage'].'"></ul>';

					$data['javascript'][] = 'getAppList("w-'.$val['type'].'-'.$cycle.'");';

				//新闻分类
				}elseif($val['type'] == "articletype"){

					$params = $val['params'];
					$data['html'][] = '<ul class="w-articleType-container">';

                    global $cfg_basehost;
					global $cfg_secureAccess;
					$arr = @file_get_contents($cfg_secureAccess.$cfg_basehost."/include/website.inc.php?action=articleType&projectid=".$id."&num=".$params['num']."&showCount=".$params['showCount']);
					if(!empty($arr)){
						$arr = objtoarr(json_decode($arr));
						if(count($arr) > 0){
							foreach($arr as $k_ => $v_){
								$data['html'][] = '<li><a href="'.$pageurl.'/news.html?catid='.$v_['catid'].'">'.$v_['catname'].($params['showCount'] ? '('.$v_['count'].')' : "").'</a></li>';
							}
						}
					}

					$data['html'][] = '</ul>';

				//产品分类
				}elseif($val['type'] == "productype"){

					$params = $val['params'];
					$data['html'][] = '<ul class="w-productType-container">';

                    global $cfg_basehost;
					global $cfg_secureAccess;
					$arr = @file_get_contents($cfg_secureAccess.$cfg_basehost."/include/website.inc.php?action=productType&projectid=".$id."&num=".$params['num']."&showCount=".$params['showCount']);
					if(!empty($arr)){
						$arr = objtoarr(json_decode($arr));
						if(count($arr) > 0){
							foreach($arr as $k_ => $v_){
								$data['html'][] = '<li><a href="'.$pageurl.'/product-list-'.$v_['catid'].'.html">'.$v_['catname'].($params['showCount'] ? '('.$v_['count'].')' : "").'</a></li>';
							}
						}
					}

					$data['html'][] = '</ul>';

				//标题标题
				}elseif($val['type'] == "view-title"){
                    if($sid){
                        $archives = $dsql->SetQuery("SELECT * FROM `#@__website_".$table."` WHERE `website` = $projectid AND `id` = ".$sid);
                        $resultsView = $dsql->dsqlOper($archives, "results");
                    }
                    if($resultsView && is_array($resultsView)){
					    $data['html'][] = '<h1>'.$resultsView[0]['title'].'</h1>';
                    }

				//栏目标签
				}elseif($val['type'] == "view-category"){
					global $type;
					if($type == "template"){
						$data['html'][] = '<a href="news.html?catid=1" target="_blank">金融经济</a>';
					}else{
                        if($sid){
                            $archives = $dsql->SetQuery("SELECT * FROM `#@__website_".$table."` WHERE `website` = $projectid AND `id` = ".$sid);
                            $resultsView = $dsql->dsqlOper($archives, "results");
                            
                            $archives = $dsql->SetQuery("SELECT `name` FROM `#@__website_".$table."type` WHERE `id` = ".$resultsView[0]['typeid']);
                            $results = $dsql->dsqlOper($archives, "results");
                            if($results && is_array($results)){
                                $data['html'][] = '<a href="'.$pageurl.'/'.($alias == 'productd' ? 'product' : 'news').'.html?catid='.$resultsView[0]['typeid'].'" target="_blank">'.$results[0]['name'].'</a>';
                            }
                        }
					}

				//发布时间标签
				}elseif($val['type'] == "view-time"){
                    if($sid){
                        $archives = $dsql->SetQuery("SELECT * FROM `#@__website_".$table."` WHERE `website` = $projectid AND `id` = ".$sid);
                        $resultsView = $dsql->dsqlOper($archives, "results");
                    }
					$timeFormat = $val['params']['timeFormat'];
                    if($resultsView && is_array($resultsView)){
					    $data['html'][] = !empty($timeFormat) ? date($timeFormat, $resultsView[0]['pubdate']) : date("Y-m-d H:i:s", $resultsView[0]['pubdate']);
                    }

				//浏览次数
				}elseif($val['type'] == "view-count"){
                    if($sid){
                        $archives = $dsql->SetQuery("SELECT * FROM `#@__website_".$table."` WHERE `website` = $projectid AND `id` = ".$sid);
                        $resultsView = $dsql->dsqlOper($archives, "results");
                    }
                    if($resultsView && is_array($resultsView)){
					    $data['html'][] = "浏览次数：".$resultsView[0]['click'];
                    }

				//内容摘要标签
				}elseif($val['type'] == "view-summary"){
                    if($sid){
                        $archives = $dsql->SetQuery("SELECT * FROM `#@__website_".$table."` WHERE `website` = $projectid AND `id` = ".$sid);
                        $resultsView = $dsql->dsqlOper($archives, "results");
                    }
                    if($resultsView && is_array($resultsView)){
					    $data['html'][] = $resultsView[0]['description'];
                    }

				//正文标签
				}elseif($val['type'] == "view-content"){
                    if($sid){
                        $archives = $dsql->SetQuery("SELECT * FROM `#@__website_".$table."` WHERE `website` = $projectid AND `id` = ".$sid);
                        $resultsView = $dsql->dsqlOper($archives, "results");
                    }

                    if($resultsView && is_array($resultsView)){
                        //视频
                        if($table == "video"){

                            //本地视频
                            if($resultsView[0]['typeid'] == 0){

                                $data['html'][] = '<div id="video" style="text-align:center; margin-bottom:10px;"><div id="a1"></div></div>';
                                $data['html'][] = '<script type="text/javascript" src="/static/js/ui/ckplayer/ckplayer.js" charset="utf-8"></script>';
                                $data['html'][] = '<script type="text/javascript">';
                                $data['html'][] = 'var videoObject={';
                                $data['html'][] = 'container: \'#a1\',';
                                $data['html'][] = 'variable: \'player\',';
                                $data['html'][] = 'video:\''.getFilePath($resultsView[0]['video']).'\',';
                                $data['html'][] = '};';
                                $data['html'][] = 'var player=new ckplayer(videoObject);';
                                $data['html'][] = '</script>';

                            //第三方调用
                            }else{

                                $video = $resultsView[0]['video'];

                                //手机端
                                if(isMobile()){

                                    //优酷
                                    if(preg_match("/player.youku.com/", $video)){
                                        $exp = explode("/", $video);
                                        $vid = $exp[count($exp)-2];

                                        $video = 'http://player.youku.com/embed/'.$vid;

                                    //腾讯
                                    }elseif(preg_match("/video.qq.com/", $video)){
                                        $vid = getUrlQuery($video, "vid");
                                        $auto = getUrlQuery($video, "auto");

                                        $video = 'http://v.qq.com/iframe/player.html?vid='.$vid.'&tiny=0&auto='.$auto;
                                    }

                                    $data['html'][] = '<div style="text-align:center; margin-bottom:10px;"><iframe frameborder="0" width="100%" height="200" allowtransparency="true" src="'.$video.'"></iframe></div>';


                                //PC端
                                }else{

                                    $data['html'][] = '<div style="text-align:center; margin-bottom:10px;"><embed src="'.$video.'" allowFullScreen="true" quality="high" width="650" height="500" align="middle" allowScriptAccess="always" type="application/x-shockwave-flash"></embed></div>';

                                }

                            }

                        //全景
                        }elseif($table == "360qj"){

                            //图片方式
                            if($resultsView[0]['typeid'] == 0){

                                $height = 500;
                                if(isMobile()){
                                    $height = 250;
                                }
                                $data['html'][] = '<div style="text-align:center; margin-bottom:10px;"><iframe frameborder="0" width="100%" height="'.$height.'" allowtransparency="true" src="'.$cfg_secureAccess.$cfg_basehost.'/include/360panorama.php?f='.$resultsView[0]['file'].'"></iframe></div>';

                            //swf方式
                            }else{

                                $data['html'][] = '<div style="text-align:center; margin-bottom:10px;"><embed src="'.getFilePath($resultsView[0]['file']).'" allowFullScreen="true" quality="high" width="650" height="500" align="middle" allowScriptAccess="always" pluginspage="http://www.macromedia.com/go/getflashplayer" type="application/x-shockwave-flash"></embed></div>';

                            }

                        }
                        
                        $data['html'][] = $resultsView[0]['body'];

                    }


				//留言
				}elseif($val['type'] == "guest"){

					$isGuestList = 1;
					$isGuest = 1;

					$params = $val['params'];
					if($params['showList'] == 1){
						$data['html'][] = '<div class="guestList"></div>';
						$data['javascript'][] = 'getGuestList("w-'.$val['type'].'-'.$cycle.'");';
					}

					$data['html'][] = '<form action="###" method="post" class="addGuest">
		<p>尊敬的客户：<br /><font color="#FF0000">如果您对我们的产品或服务有任何意见和建议请及时告诉我们，我们将尽快给您满意的答复。</font></p>
        <table>
          <tr>
            <td width="110" align="center" valign="top" bgcolor="#f7f7f7">您的姓名：</td>
            <td><input name="user" type="text" size="30" placeholder="请输入您的姓名"></td>
          </tr>
          <tr>
            <td align="center" valign="top" bgcolor="#f7f7f7">联系方式：</td>
            <td><input name="contact" type="text" size="30" placeholder="您填写的联系方式是保密的"></td>
          </tr>
          <tr>
            <td align="center" valign="top" bgcolor="#f7f7f7">留言内容：</td>
            <td><textarea name="content" rows="6" placeholder="请输入您的留言内容"></textarea></td>
          </tr>
          <tr>
            <td align="center" bgcolor="#f7f7f7">&nbsp;</td>
            <td><input type="submit" name="addBtn" class="addBtn" value="提交留言"></td>
          </tr>
        </table>
      </form>';


				}


			}
			$cycle++;


			if(is_array($val['items']) && !empty($val['items'])){
				data_foreach($val, $val['type']);
			}

			if($type == "columnbox"){
				$data['html'][] = "</div>";
			}
			$data['html'][] = "</div>";

		}
	}
	return $data;
}

if(!empty($pagedata)){
	$comData = data_foreach($pagedata);
	$html = !empty($pagedata) ? (!empty($comData['html']) ? join("", $comData['html']) : "") : "";
	$css = !empty($pagedata) ? (!empty($comData['css']) ? join("", $comData['css']) : "") : "";
	$javascript = !empty($pagedata) ? (!empty($comData['javascript']) ? join("", $comData['javascript']) : "") : "";
}
?><!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1.0,minimum-scale=1.0,maximum-scale=1.0,user-scalable=no" />
<?php echo $head; ?>

<meta name="keywords" content="<?php echo $keywords;?>" />
<meta name="description" content="<?php echo $description;?>" />
<title><?php echo $title."-".$wTitle;?></title>
<link rel="stylesheet" type="text/css" href="/static/css/core/special.base.css" media="all" />
<script type="text/javascript" src="/static/js/core/special.core.js"></script>
<style type="text/css"><?php echo $css;?></style>
<!--[if IE 6]>
<script> try{document.execCommand('BackgroundImageCache', false, true);} catch(e){}</script>
<![endif]-->
</head>

<body id="w-body-aaaa" data-type="body" class="n-widget w-body t-body-default-aaaa">
<?php echo $html;?>

<?php echo $footer; ?>
<?php
global $isList;
global $cfg_secureAccess;
if($isList == 1){?>
<script type="text/javascript">
function getAppList(div){
	var ul = $("#"+div).find(">ul"),
		module       = ul.attr("data-module"),                 //栏目
		catid        = parseInt(ul.attr("data-catid")),        //分类
		num          = parseInt(ul.attr("data-num")),          //数量
		template     = parseInt(ul.attr("data-template")),     //模板
		titlenum     = parseInt(ul.attr("data-titlenum")),     //标题字数
		summarynum   = parseInt(ul.attr("data-summarynum")),   //摘要字数
		showcategory = parseInt(ul.attr("data-showcategory")), //显示分类
		showtime     = parseInt(ul.attr("data-showtime")),     //显示时间
		timeFormat   = ul.attr("data-timeFormat")              //时间格式
		imagewidth   = parseInt(ul.attr("data-imagewidth")),   //缩略图宽度
		imageheight  = parseInt(ul.attr("data-imageheight")),  //缩略图高度
		showpage     = parseInt(ul.attr("data-showpage")),     //显示分页
		atpage       = parseInt(ul.attr("data-atpage"));       //当前所在页

	atpage = atpage || 1;

	ul.html("加载中...");

	$.getJSON("/include/website.inc.php?action="+module+"List&type=<?php echo $type;?>&projectid=<?php echo $id;?>&jsoncallback=?", {
		page: atpage,
		catid: catid,
		num: num,
		timeformat: timeFormat
	}, function(e) {
		if (!e.code && e.data) {
			ul.html("");
			$.each(e.data, function(i, data) {
				var t,
				n = "li-text";
				if (2 == template ? n = "li-image": 3 == template && (n = "li-group"), t = '<li class="' + n + '">', template > 1) {
					t += '<div class="image"><a href="<?php echo $pageurl;?>/'+(module == "article" ? "news" : module)+'d.html?sid='+data.id+'" target="_blank"><img src="'+data.image+'"',
					imagewidth && (t += ' width="' + imagewidth + '"'),
					imageheight && (t += ' height="' + imageheight + '"'),
					t += '/></a></div>'
				}
				t += '<div class="text"><div class="title">',
				showcategory && (t += '<a class="category" href="<?php echo $pageurl;?>/'+(module == "article" ? "news" : module)+'.html?catid='+data.catid+'">['+data.catname+']</a>'),
				a = parseInt(titlenum, 10),
				title = data.title;
                a && (title = data.title.substr(0, a)),
				t += '<a href="<?php echo $pageurl;?>/'+(module == "article" ? "news" : module)+'d.html?sid='+data.id+'" target="_blank">'+title+'</a>',
				3 > template && showtime && (t += '<span class="time">'+data.addtime+'</span>'),
				t += "</div>",
				a = parseInt(summarynum, 10),
				summary = data.summary;
                a && (summary = data.summary.substr(0, a)),
				2 == template && (t += "<p>"+summary+"</p>"),
				t += "</div></li>";

				ul.append(t);
			});

			if(showpage == 1 && num < e.total){
				if($("#"+div).find(".pagination").html() == undefined){
					$("#"+div).append('<div class="pagination"></div>');
				}
				showPageInfo(div, ul, atpage, e.totalPage);
			}
		} else {
			$("#"+div).find(".pagination").hide();
			ul.html("暂无内容。");
		}
	});

}
</script>
<?php
}

global $isGuestList;
if($isGuestList == 1){?>
<script type="text/javascript">
function getGuestList(div){
	var guestList = $("#"+div).find(".guestList"),
		atpage = parseInt(guestList.attr("data-atpage"));       //当前所在页

	atpage = atpage || 1;

	guestList.html("加载中...");

	$.getJSON("/include/website.inc.php?action=guestList&projectid=<?php echo $id;?>&jsoncallback=?", {
		page: atpage,
		num: 10
	}, function(e) {
		if (!e.code && e.data) {
			guestList.html("");
			$.each(e.data, function(i, data) {
				var t,
				t  = '<table>';
				t += '  <tr>';
				t += '    <td width="100" align="center" valign="top" bgcolor="#f7f7f7">留言人：</td>';
				t += '    <td>'+data.people+'&nbsp;&nbsp;于&nbsp;&nbsp;'+data.date+'&nbsp;发表留言：</td>';
				t += '  </tr>';
				t += '  <tr>';
				t += '    <td align="center" valign="top" bgcolor="#f7f7f7">问&nbsp;&nbsp;&nbsp;&nbsp;题：</td>';
				t += '    <td>'+data.note+'</td>';
				t += '  </tr>';
				if(data.reply){
					t += '  <tr>';
					t += '    <td align="center" valign="top" bgcolor="#f7f7f7">回&nbsp;&nbsp;&nbsp;&nbsp;复：</td>';
					t += '    <td class="f60" bgcolor="#fefdf5">'+data.reply+'</td>';
					t += '  </tr>';
				}
				t += '</table>';
				guestList.append(t);
			});

			if(10 < e.total){
				if(guestList.find(".pagination").html() == undefined){
					guestList.append('<div class="pagination"></div>');
				}
				showPageInfo(div, guestList, atpage, e.totalPage, "guest");
			}
		} else {
			$("#"+div).find(".pagination").hide();
			guestList.html("暂无内容。");
		}
	});

}
</script>
<?php
}

global $isGuest;
if($isGuest == 1){?>
<script type="text/javascript">
$(function(){
	$(".addGuest .addBtn").bind("click", function(event){
		event.preventDefault();
		var user    = $(".addGuest input[name='user']"),
			contact = $(".addGuest input[name='contact']"),
			content = $(".addGuest textarea[name='content']");

		if($.trim(user.val()) == ""){
			alert("请输入您的姓名！");
			user.focus();
			return false;
		}

		if($.trim(contact.val()) == ""){
			alert("请输入您的联系方式！");
			contact.focus();
			return false;
		}

		if($.trim(content.val()) == ""){
			alert("请输入留言内容！");
			content.focus();
			return false;
		}

		$(this).attr("disabled", true).val("提交中...");
		var data = $(this).closest(".addGuest").serialize();

		$.ajax({
			url: "/include/website.inc.php?action=guestAdd&projectid=<?php echo $id;?>",
			data: data,
			type: "POST",
			dataType: "JSON",
			success: function(e) {
				if(e.state == 100){
					alert('留言成功，我们会尽快与您取得联系！');
					location.reload();
				}else{
					alert(e.info);
					$(this).attr("disabled", false).val("提交留言");
				}
			}
		});

	});
});
</script>
<?php
}

if($isList == 1 || $isGuestList == 1){
?>
<script type="text/javascript">
function showPageInfo(div, obj, nowPageNum, allPageNum, type) {
	var info = $("#"+div).find(".pagination");
	nowPageNum = parseInt(nowPageNum);
	allPageNum = parseInt(allPageNum);

	if (allPageNum > 1) {

		info.html("").hide();

		var ul = document.createElement("ul");
		info.append(ul);

		//上一页
		if (nowPageNum > 1) {
			var prev = document.createElement("li");
			prev.innerHTML = '<a href="javascript:;">« 上一页</a>';
			prev.onclick = function () {
				obj.attr("data-atpage", nowPageNum - 1);
				if(type == "guest"){
					getGuestList(div);
				}else{
					getAppList(div);
				}
			}
			$("#prevBtn").removeClass("disabled").show();
		} else {
			var prev = document.createElement("li");
			prev.className = "disabled";
			prev.innerHTML = '<a href="javascript:;">« 上一页</a>';
			$("#prevBtn").addClass("disabled").show();

		}
		info.find("ul").append(prev);

		//分页列表
		if (allPageNum - 2 < 1) {
			for (var i = 1; i <= allPageNum; i++) {
				if (nowPageNum == i) {
					var page = document.createElement("li");
					page.className = "active";
					page.innerHTML = '<a href="javascript:;">'+i+'</a>';
				}
				else {
					var page = document.createElement("li");
					page.innerHTML = '<a href="javascript:;">'+i+'</a>';
					page.onclick = function () {
						obj.attr("data-atpage", $(this).text());
						if(type == "guest"){
							getGuestList(div);
						}else{
							getAppList(div);
						}
					}
				}
				info.find("ul").append(page);
			}
		} else {
			for (var i = 1; i <= 2; i++) {
				if (nowPageNum == i) {
					var page = document.createElement("li");
					page.className = "active";
					page.innerHTML = '<a href="javascript:;">'+i+'</a>';
				}
				else {
					var page = document.createElement("li");
					page.innerHTML = '<a href="javascript:;">'+i+'</a>';
					page.onclick = function () {
						obj.attr("data-atpage", $(this).text());
						if(type == "guest"){
							getGuestList(div);
						}else{
							getAppList(div);
						}
					}
				}
				info.find("ul").append(page);
			}
			var addNum = nowPageNum - 4;
			if (addNum > 0) {
				var em = document.createElement("li");
				em.innerHTML = "<em>...</em>";
				info.find("ul").append(em);
			}
			for (var i = nowPageNum - 1; i <= nowPageNum + 1; i++) {
				if (i > allPageNum) {
					break;
				}
				else {
					if (i <= 2) {
						continue;
					}
					else {
						if (nowPageNum == i) {
							var page = document.createElement("li");
							page.className = "active";
							page.innerHTML = '<a href="javascript:;">'+i+'</a>';
						}
						else {
							var page = document.createElement("li");
							page.innerHTML = '<a href="javascript:;">'+i+'</a>';
							page.onclick = function () {
								obj.attr("data-atpage", $(this).text());
								if(type == "guest"){
									getGuestList(div);
								}else{
									getAppList(div);
								}
							}
						}
						info.find("ul").append(page);
					}
				}
			}
			var addNum = nowPageNum + 2;
			if (addNum < allPageNum - 1) {
				var em = document.createElement("li");
				em.innerHTML = "<em>...</em>";
				info.find("ul").append(em);
			}
			for (var i = allPageNum - 1; i <= allPageNum; i++) {
				if (i <= nowPageNum + 1) {
					continue;
				}
				else {
					var page = document.createElement("li");
					page.innerHTML = '<a href="javascript:;">'+i+'</a>';
					page.onclick = function () {
						obj.attr("data-atpage", $(this).text());
						if(type == "guest"){
							getGuestList(div);
						}else{
							getAppList(div);
						}
					}
					info.find("ul").append(page);
				}
			}
		}

		//下一页
		if (nowPageNum < allPageNum) {
			var next = document.createElement("li");
			next.innerHTML = '<a href="javascript:;">下一页 »</a>';
			next.onclick = function () {
				obj.attr("data-atpage", nowPageNum + 1);
				if(type == "guest"){
					getGuestList(div);
				}else{
					getAppList(div);
				}
			}
			$("#nextBtn").removeClass("disabled").show();
		} else {
			var next = document.createElement("li");
			next.className = "disabled";
			next.innerHTML = '<a href="javascript:;">下一页 »</a>';
			$("#nextBtn").addClass("disabled").show();
		}
		info.find("ul").append(next);
		info.show();
	}
}
</script>
<?php
}
?>
<script type="text/javascript"><?php echo $javascript;?></script>
</body>
</html>
