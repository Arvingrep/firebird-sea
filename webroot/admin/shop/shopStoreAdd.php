<?php
/**
 * 添加商城商铺
 *
 * @version        $Id: shopStoreAdd.php 2014-2-11 上午10:21:10 $
 * @package        HuoNiao.Shop
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/shop";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "shopStoreAdd.html";

$tab = "shop_store";
$dopost = $dopost ? $dopost : "save";        //操作类型 save添加 edit修改
if($dopost == "edit"){
	$pagetitle = "修改商城店铺";
	checkPurview("shopStoreEdit");
}else{
	$pagetitle = "添加商城店铺";
	checkPurview("shopStoreAdd");
}
if($dopost == "del"){
    $sql        = $dsql->SetQuery("DELETE FROM `#@__shop_shopprint` WHERE `sid` = '$sid' AND `id` = '$printid' AND `type` = 0");
    $results    = $dsql->dsqlOper($sql,"update");
    if($results =="ok"){
        dataAsync("shop",$sid,"store");  // 在线商城、店铺、删除
         echo '{"state": 100, "info": '.json_encode("删除成功！").'}';die;

    } else{
        echo '{"state": 100, "info": '.json_encode("删除失败！").'}';die;

    }
}
if(empty($domaintype)) $domaintype = 0;
if(empty($domainexp)) $domainexp = 0;
$domainexp = empty($domainexp) ? 0 : GetMkTime($domainexp);
if(empty($userid)) $userid = 0;
if(empty($weight)) $weight = 1;
if(empty($state)) $state = 0;
if(empty($certi)) $certi = 0;
if(empty($click)) $click = 0;
$rec    = (int)$rec;
$distribution     = (int)$distribution;   //骑手配送
$express          = (int)$express;   //快递
$merchant_deliver = (int)$merchant_deliver;   //商家自配
$delivery         = (int)$delivery;   //是否支持货到付款
$toshop           = (int)$toshop;   //是否支持货到付款

if($_POST['submit'] == "提交"){

    if($token == "") die('token传递失败！');

    $_POST['refuse'] = $state == 2 ? $_POST['refuse'] : '';

    unset($_POST['dopost'],$_POST['token']);
    $_POST['tel']           = filterSensitiveWords(addslashes($_POST['telphone']));
    $_POST['pic']           = filterSensitiveWords(addslashes($_POST['imglist']));
    $_POST['note']          = filterSensitiveWords(addslashes($_POST['note']));
    $_POST['project']          = filterSensitiveWords(addslashes($_POST['project']));
    $_POST['pubdate']      = GetMkTime(time());
    $_POST['shopFee']      = (int)$_POST['shopFee'];
    $_POST['rec']          = (int)$_POST['rec'];
    $_POST['delivery']     = (int)$_POST['delivery'];
    if ($dopost == 'save'){
        unset($_POST['id']);
    }
    unset($_POST['telphone'],$_POST['print_config'],$_POST['imglist'],$_POST['body'],$_POST['areaCode'],$_POST['user'],$_POST['submit']);
    if ($_POST) {
        foreach ($_POST as $p => $m) {
            if ($p == 'peisongstate' && $m == 1) {
                $m = 0;
            }
                if ($p == 'industry' && empty($m)) {
                echo '{"state": 200, "info": "请选择所属行业！"}';
                exit();
            } elseif ($p == 'addrid' && empty($m)) {
                echo '{"state": 200, "info": "请选择所在区域！"}';
                exit();
            } elseif ($p == 'company' && empty($m)) {
                echo '{"state": 200, "info": "请输入公司名称！"}';
                exit();
            } elseif ($p == 'title' && empty($m)) {
                echo '{"state": 200, "info": "请输入公司名称！"}';
                exit();
            } elseif ($p == 'address' && empty($m)) {
                echo '{"state": 200, "info": "请输入公司地址！"}';
                exit();
            } elseif ($p == 'logo' && empty($m)) {
                echo '{"state": 200, "info": "请上传店铺LOGO！"}';
                exit();
            } elseif ($p == 'people' && empty($m)) {
                echo '{"state": 200, "info": "请输入联系人！"}';
                exit();
            } elseif ($p == 'contact' && empty($m)) {
                echo '{"state": 200, "info": "请输入联系电话！"}';
                exit();
            }elseif ($p == 'body' && empty($m)) {
                echo '{"state": 200, "info": "请输入详细介绍！"}';
                exit();
            }

            if ($p == 'company' || $p == 'title' || $p == 'referred' || $p == 'address' || $p == 'project' || $p == 'people' || $p == 'contact' || $p == 'telphone' || $p == 'qq' || $p == 'wechatcode' ) {
                $m = filterSensitiveWords(addslashes($m));
            }

            if ($p == 'cityid' || $p == 'industry' || $p == 'addrid' || $p == 'shoptype' || $p == 'distribution') {
                $m = (int)$m;
            }

            if ($p == 'typesales') {
                $typesales = explode(',',$m);
                if (in_array('1',$typesales)) {

                    $upstr     .= "`toshop` = '1',";
                    $insertstr .= "`toshop`,";
                    $insertval .= "'1',";
                }else{
                    $upstr     .= "`toshop` = '0',";
                    $insertstr .= "`toshop`,";
                    $insertval .= "'0',";
                }

                if (in_array('2',$typesales)) {

                    $upstr     .= "`distribution` = '1',";
                    $insertstr .= "`distribution`,";
                    $insertval .= "'1',";
                }else{
                    $upstr     .= "`distribution` = '0',";
                    $insertstr .= "`distribution`,";
                    $insertval .= "'0',";
                }

                if (in_array('3',$typesales)) {

                    $upstr     .= "`merchant_deliver` = '1',";
                    $insertstr .= "`merchant_deliver`,";
                    $insertval .= "'1',";
                }else{
                    $upstr     .= "`merchant_deliver` = '0',";
                    $insertstr .= "`merchant_deliver`,";
                    $insertval .= "'0',";
                }

                if (in_array('4',$typesales)) {

                    $upstr     .= "`express` = '1',";
                    $insertstr .= "`express`,";
                    $insertval .= "'1',";
                }else{
                    $upstr     .= "`express` = '0',";
                    $insertstr .= "`express`,";
                    $insertval .= "'0',";
                }
                unset($p,$m);
            }elseif ($p == 'lnglat') {
                $lnglatarr = explode(',',$m);

                $upstr     .= "`lng` = '".$lnglatarr[0]."',`lat` = '".$lnglatarr[1]."',";
                $insertstr .= "`lng`,`lat`,";
                $insertval .= "'".$lnglatarr[0]."','".$lnglatarr[1]."',";

            } else {
                if ($p == 'limit_time') {
                    $p = 'period';
                    $newtimearr = array();
                    $m = explode('||',$m);
                    foreach ($m as $a => $b) {
                        $a+=1;
                        $newb   = explode('-',$b);
                        $insertstr .= "`start_time".$a."`,`end_time".$a."`,";
                        $insertval .= "'".$newb['0']."','".$newb['1']."',";
                        $upstr     .= "`start_time".$a."` = '".$newb['0']."',`end_time".$a."` = '".$newb['1']."',";

                        $newtimearr[$a]['start']  = $newb[0];
                        $newtimearr[$a]['stop']   = $newb[1];

                    }
                    $m = serialize($newtimearr);
                }

                if ($p == 'authattrparam') {

                    $authattrparamarr = $m ? json_decode($m,true) : array() ;

                    $authattrtype     = array_column($authattrparamarr,"id");

                    $authattrtype     = $authattrtype ? join(',',$authattrtype) : '';
                    
                    $upstr     .= "`authattrtype` = '".$authattrtype."',`authattrparam` = '".serialize($authattrparamarr)."',";
                    $insertstr .= "`authattrtype`,";
                    $insertval .= "'".$authattrtype."',";

                }

                if ($p == 'note') {
                    $m = filterSensitiveWords(addslashes($m));
                }
                if (strpos($p,'mark') !== false){
                       unset($p,$m);
                }
//                if(empty($m) && $p != 'peisongstate'){
//                    unset($p,$m);
//                }
                if (!empty($p)){
//                    if ($p =='authattrparam'){
//                        $authattrparamarr = $m ? json_decode($m,true) : array() ;
//                        $m = serialize($authattrparamarr);
//                    }
                    $insertstr .= "`".$p."`,";
                    $insertval .= "'".$m."',";
                    $upstr     .= "`".$p."` = '".$m."',";
                }

            }

        }

        $insertstr = substr($insertstr,0,-1);
        $insertval = substr($insertval,0,-1);
        $upstr     = substr($upstr,0,-1);

    } else {
        echo '{"state": 200, "info": "参数错误！"}';
        exit();
    }


	if($userid == 0){
		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__member` WHERE `username` = '".$user."'");
		$userResult = $dsql->dsqlOper($userSql, "results");
		if(!$userResult){
			echo '{"state": 200, "info": "会员不存在，请在联想列表中选择"}';
			exit();
		}
		$userid = $userResult[0]['id'];
	}else{
		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__member` WHERE `id` = ".$userid);
		$userResult = $dsql->dsqlOper($userSql, "results");
		if(!$userResult){
			echo '{"state": 200, "info": "会员不存在，请在联想列表中选择"}';
			exit();
		}
	}
    // $mcodearr =  array_column($print_config, 'mcode');
    // if(count($mcodearr) != count(array_unique($mcodearr))){
    //     echo '{"state": 200, "info": "重复的终端号"}';
    //     exit();
    // }
    // //查询有无绑定
    // foreach ($print_config as $key => $value) {

    //     if ($value['id']!='') {
    //         $printsql        = $dsql->SetQuery("UPDATE `#@__shop_shopprint` SET  `mcode`= '".$value['mcode']."', `msign` = '".$value['msign']."',`remarks` ='".$value['remarks']."',`bind_print` = '".$value['bind_print']."' WHERE `id` = ".$value['id']." AND `type` = 0");

    //     }else{
    //         $printsql   = $dsql->SetQuery("INSERT INTO `#@__shop_shopprint` (`sid`,`mcode`,`msign`,`remarks`,`bind_print`)VALUES('$id','".$value['mcode']."','".$value['msign']."','".$value['remarks']."','".$value['bind_print']."')");
    //     }

    //     $dsql->dsqlOper($printsql, "update");

    // }

	if($dopost == "save"){
		$print_state = 0;
	}

	$lnglat = explode(",", $lnglat);
	$lng = $lnglat[0];
	$lat = $lnglat[1];
	//检测是否已经注册
	if($dopost == "save"){

		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__".$tab."` WHERE `title` = '".$title."'");
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			echo '{"state": 200, "info": "店铺名称已存在，不可以重复添加！"}';
			exit();
		}

//		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__".$tab."` WHERE `company` = '".$company."'");
//		$userResult = $dsql->dsqlOper($userSql, "results");
//		if($userResult){
//			echo '{"state": 200, "info": "公司名称已注册其它店铺，不可以重复添加！"}';
//			exit();
//		}

		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__".$tab."` WHERE `userid` = '".$userid."'");
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			echo '{"state": 200, "info": "此会员已授权管理其它店铺，一个会员不可以管理多个店铺！"}';
			exit();
		}

	}else{

		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__".$tab."` WHERE `title` = '".$title."' AND `id` != ". $id);
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			echo '{"state": 200, "info": "店铺名称已存在，不可以重复添加！"}';
			exit();
		}

//		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__".$tab."` WHERE `company` = '".$company."' AND `id` != ". $id);
//		$userResult = $dsql->dsqlOper($userSql, "results");
//		if($userResult){
//			echo '{"state": 200, "info": "公司名称已注册其它店铺，不可以重复添加！"}';
//			exit();
//		}

		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__".$tab."` WHERE `userid` = '".$userid."' AND `id` != ". $id);
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			echo '{"state": 200, "info": "此会员已授权管理其它店铺，一个会员不可以管理多个店铺！"}';
			exit();
		}
	}

}

if ($authattr) {
    $authattr = join(',',$authattr);
}

if($dopost == "save" && $submit == "提交"){

    $archives = $dsql->SetQuery("INSERT INTO `#@__shop_store` ($insertstr) VALUES ($insertval)");
    $aid      = $dsql->dsqlOper($archives, "lastid");

	if($aid){
		adminLog("添加商城店铺", $title);
		dataAsync("shop",$aid,"store");  //  在线商城、店铺、新增
		echo '{"state": 100, "info": '.json_encode("添加成功！").'}';
	}else{
		echo '{"state": 200, "info": '.json_encode("保存到数据库失败！").'}';
	}
	die;
}elseif($dopost == "edit"){

	if($submit == "提交"){
        $archives = $dsql->SetQuery("UPDATE `#@__shop_store` SET $upstr,psaudit=0 WHERE `id` = " . $id);
        $results  = $dsql->dsqlOper($archives, "update");
		if($results == "ok"){
			adminLog("修改商城店铺", $title);
			dataAsync("shop",$id,"store");  // 在线商城、店铺、修改
			echo '{"state": 100, "info": '.json_encode('修改成功！').'}';
		}else{
			echo '{"state": 200, "info": '.json_encode('修改失败！').'}';
		}
		die;
	}

	if(!empty($id)){

		//主表信息
		$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."` WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "results");

		if(!empty($results)){

			$title        = $results[0]['title'];
			$domaintype   = $results[0]['domaintype'];
			//获取域名信息
			$domainInfo   = getDomain('shop', $tab, $id);
			$domain       = $domainInfo['domain'];
			$domainexp    = $domainInfo['expires'];
			$domaintip    = $domainInfo['note'];
			$company      = $results[0]['company'];
			$referred     = $results[0]['referred'];
			$addrid       = $results[0]['addrid'];
			$address      = $results[0]['address'];
			$industry     = $results[0]['industry'];
			$project      = $results[0]['project'];
			$logoSource   = $results[0]['logo'];
			$logo         = getFilePath($results[0]['logo']);
			$userid       = $results[0]['userid'];
			$people       = $results[0]['people'];
			$contact      = $results[0]['contact'];
			$telphone          = $results[0]['tel'];
			$qq           = $results[0]['qq'];
			$psaudit      = $results[0]['psaudit'];
			$note         = $results[0]['note'];
			$click        = $results[0]['click'];
			$weight       = $results[0]['weight'];
			$state        = $results[0]['state'];
            $refuse       = $results[0]['refuse'];
			$certi        = $results[0]['certi'];
			$rec          = $results[0]['rec'];
			$cityid       = $results[0]['cityid'];
			$shop_openid  = $results[0]['shop_openid'];
			$wechatcode   = $results[0]['wechatcode'];
			$wechatqr     = $results[0]['wechatqr'];
            $litpic       = $results[0]['litpic'];
            $facility     = $results[0]['facility'];
            $explosion    = $results[0]['explosion'];

            /*营业日*/
			$day = array('1'=>'周一','2'=>'周二','3'=>'周三','4'=>'周四','5'=>'周五','6'=>'周六','7'=>'周日',);

			$daystr = '';
			$businessday = $results[0]['businessday'] != '' ? explode(',',$results[0]['businessday']) : array();
			if ($businessday) {
					for ($i = 1; $i <=7; $i++) {
							if(in_array($i,$businessday)){
									$daystr .= $day[$i].' ';
							}
					}
			}
			$daystr    = $daystr;
			$daystrarr  = $businessday;
			/*时间段*/
			$period =  $results[0]['period'] !='' ? unserialize($results[0]['period']) : array() ;

			$periodarr = array();
			if ($period) {
					foreach ($period as $item) {
							array_push($periodarr,$item['start'].'-'.$item['stop']);
					}

			}

			$madvertisearr = $results[0]['madvertise'] !='' ? explode('||',$results[0]['madvertise']) : array() ;
			$newmadvertisearr = array();
			if ($madvertisearr) {
					foreach ($madvertisearr as $key => $value) {
							$madver = explode("###",$value);
							$newmadvertisearr[$key]['picpath']   = getFilePath($madver[0]);
							$newmadvertisearr[$key]['picsource'] = $madver[0];
							$newmadvertisearr[$key]['title']     = $madver[1];
							$newmadvertisearr[$key]['link']      = $madver[2];
					}
			}
            $madvertisear     = $newmadvertisearr;

			$padvertisearr    = $results[0]['padvertise'] !='' ? explode('||',$results[0]['padvertise']) : array() ;

			$newpadvertisearr = array();
			if ($padvertisearr) {
					foreach ($padvertisearr as $key1 => $value1) {
							$padver = explode("###",$value1);
							$newpadvertisearr[$key1]['picpath']   = getFilePath($padver[0]);
							$newpadvertisearr[$key1]['picsource'] = $padver[0];
							$newpadvertisearr[$key1]['title']     = $padver[1];
							$newpadvertisearr[$key1]['link']      = $padver[2];
					}
			}
			$padvertisear     = $newpadvertisearr;
			$periodarr     = $periodarr;
			$periodstr     = join(',',$periodarr);

			$start1 = (int)str_replace(":", "", $results[0]["start_time1"]);
			$end1   = (int)str_replace(":", "", $results[0]["end_time1"]);
			$start2 = (int)str_replace(":", "", $results[0]["start_time2"]);
			$end2   = (int)str_replace(":", "", $results[0]["end_time2"]);
			$start3 = (int)str_replace(":", "", $results[0]["start_time3"]);
			$end3   = (int)str_replace(":", "", $results[0]["end_time3"]);

			$s1 = GetMkTime(date("Y-m-d ", time()) . $results[0]["start_time1"]);
			$e1 = $start1 > $end1 ? GetMkTime(date("Y-m-d ",
							strtotime("+1 day")) . $results[0]["end_time1"]) : GetMkTime(date("Y-m-d ",
							time()) . $results[0]["end_time1"]);
			$s2 = GetMkTime(date("Y-m-d ", time()) . $results[0]["start_time2"]);
			$e2 = $start2 > $end2 ? GetMkTime(date("Y-m-d ",
							strtotime("+1 day")) . $results[0]["end_time2"]) : GetMkTime(date("Y-m-d ",
							time()) . $results[0]["end_time2"]);
			$s3 = GetMkTime(date("Y-m-d ", time()) . $results[0]["start_time3"]);
			$e3 = $start3 > $end3 ? GetMkTime(date("Y-m-d ",
							strtotime("+1 day")) . $results[0]["end_time3"]) : GetMkTime(date("Y-m-d ",
							time()) . $results[0]["end_time3"]);

			$weeks      = explode(",", $results[0]['businessday']);
			$dayweek    = date("w") == 0 ? 7 : date("w");
			$yingyeWeek = 0;
			$yingyeTime = 0;
			$_state      = 0;
			$time = GetMkTime(time());
			if (in_array($dayweek, $weeks)) {
					$yingyeWeek = 1;
					if (($s1 < $time && $e1 > $time) or ($s2 < $time && $e2 > $time) or ($s3 < $time && $e3 > $time)) {
							$yingyeTime = 1;
							$_state      = 1;
					} else {
							$_state = 0;
					}
			} else {
					$_state = 0;
			}
			$yingye     = $_state;
			$yingyeWeek = $yingyeWeek;
			$yingyeTime = $yingyeTime;

			$authattrtype = $results[0]['authattrtype'] !='' ? explode(',',$results[0]['authattrtype']) : array () ;
            $shoptype        = $results[0]['shoptype'];
            $imglist = array();
            $pics    = str_replace('||', '', $results[0]['pic']);
            if (!empty($pics)) {
                $pics = explode("###", $pics);//print_R($pics);exit;
                foreach ($pics as $key => $value) {
                    if (!empty($value)) {
                        $imglist[$key]['path']       = getFilePath($value);
                        $imglist[$key]['pathSource'] = $value;
                    }
                }
            }
			// $bind_print   = $results[0]['bind_print'];
			// $print_config = empty($results[0]['print_config']) ? array('mcode' => '', 'msign' => '') : unserialize($results[0]['print_config']);
			$print_state  = $results[0]['print_state'];
			$lng          = $results[0]['lng'];
			$lat          = $results[0]['lat'];
			$distribution = $results[0]['distribution'];
			$express      = $results[0]['express'];
			$merchant_deliver = $results[0]['merchant_deliver'];
			$toshop          = $results[0]['toshop'];
			$delivery     = $results[0]['delivery'];
			$shopFee      = $results[0]['shopFee'];
			$videoSource  = $results[0]['video'];
			$video        = getFilePath($results[0]['video']);
			$authattrtypearr = array();
            $Sql = $dsql->SetQuery("SELECT `id`,`typename` FROM `#@__shop_authattr`");
            $Res = $dsql->dsqlOper($Sql, "results");
//            $authattrparam   = $results[0]['authattrparam'] !='' ?unserialize($results[0]['authattrparam']): array();
            $authattrparam   = $results[0]['authattrparam'] !='' ? json_decode($results[0]['authattrparam'],true) : array();
            if ($authattrparam){
                foreach ($authattrparam as $key => $value) {
                    $authattrparam[$key]['imageSource'] = $value['image'];
                    $authattrparam[$key]['image'] = getFilePath($value['image']);
                }
                $authattrparamid = array_column($authattrparam,null,'id');
                $authattrtypearr = $authattrparam;
            }

		}else{
			ShowMsg('要修改的信息不存在或已删除！', "-1");
			die;
		}

	}else{
		ShowMsg('要修改的信息参数传递失败，请联系管理员！', "-1");
		die;
	}

}

//验证模板文件
if(file_exists($tpl."/".$templates)){
  require(HUONIAOINC . "/config/shop.inc.php");
	//js
	$jsFile = array(
		'ui/bootstrap-datetimepicker.min.js',
		'ui/jquery.dragsort-0.5.1.min.js',
		'publicUpload.js',
		'publicAddr.js',
		'admin/shop/shopStoreAdd.js',
		'admin/shop/config-shop.js',
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('dopost', $dopost);
	$huoniaoTag->assign('pagetitle', $pagetitle);
	global $cfg_basehost;
	global $customChannelDomain;
	global $customUpload;
	if($customUpload == 1){
		global $custom_thumbSize;
		global $custom_thumbType;
		$huoniaoTag->assign('thumbSize', $custom_thumbSize);
		$huoniaoTag->assign('thumbType', "*.".str_replace("|", ";*.", $custom_thumbType));
	}
	$huoniaoTag->assign('basehost', $cfg_basehost);

	$huoniaoTag->assign('shopCourierState', (int)$custom_shopCourierState);  //平台配送开关，0启用  1禁用

    //0混合  1到店优惠  2送到家
    $huodongshoptypeopen = (int)$custom_huodongshoptypeopen;
    $huoniaoTag->assign('custom_huodongshoptypeopen', $huodongshoptypeopen);

    //销售类型 1到店消费  3商家自配  4快递
    $saleType = $custom_saleType == '' ? array('1', '3','4') : explode(",", $custom_saleType);
	$huoniaoTag->assign('custom_saleType', $saleType);


	//获取域名信息
	$domainInfo = getDomain('shop', 'config');
	$huoniaoTag->assign('subdomain', $domainInfo['domain']);
	$huoniaoTag->assign('id', $id);

	$huoniaoTag->assign('title', $title);

	global $customSubDomain;
	$huoniaoTag->assign('customSubDomain', $customSubDomain);
	if($customSubDomain != 2){
		$huoniaoTag->assign('domaintype', array('0', '1', '2'));
		$huoniaoTag->assign('domaintypeNames',array('默认','绑定主域名','绑定子域名'));
	}else{
		$huoniaoTag->assign('domaintype', array('0', '1'));
		$huoniaoTag->assign('domaintypeNames',array('默认','绑定主域名'));
	}
	if($customSubDomain == 2 && $domaintype == 2) $domaintype = 0;

	$huoniaoTag->assign('domaintypeChecked', $domaintype == "" ? 0 : $domaintype);
	$huoniaoTag->assign('domain', $domain);
	$huoniaoTag->assign('authattrtype', $authattrtype ? $authattrtype : array());
	$huoniaoTag->assign('domainexp', $domainexp == 0 ? "" : date("Y-m-d H:i:s", $domainexp));
	$huoniaoTag->assign('domaintip', $domaintip);

	$huoniaoTag->assign('company', $company);
	$huoniaoTag->assign('referred', $referred);
	$huoniaoTag->assign('addrid', $addrid == "" ? 0 : $addrid);
	$huoniaoTag->assign('addrListArr', json_encode($dsql->getTypeList(0, "shopaddr")));
	$huoniaoTag->assign('address', $address);
	$huoniaoTag->assign('industry', $industry == "" ? 0 : $industry);
	$huoniaoTag->assign('industryListArr', json_encode(getTypeList(0, "shop_type")));
	$huoniaoTag->assign('project', $project);
	$huoniaoTag->assign('logo', $logo);
	$huoniaoTag->assign('litpic', $litpic);
	$huoniaoTag->assign('wechatcode', $wechatcode);
	$huoniaoTag->assign('wechatqr', $wechatqr);
	$huoniaoTag->assign('distribution', $distribution);
	$huoniaoTag->assign('express', $express);
	$huoniaoTag->assign('merchant_deliver', $merchant_deliver);
	$huoniaoTag->assign('toshop', $toshop);
	$huoniaoTag->assign('delivery', $delivery);
    $huoniaoTag->assign('pics', !empty($imglist) ? $imglist : array());
	$huoniaoTag->assign('userid', $userid);
	$userSql = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = ". $userid);
	$username = $dsql->getTypeName($userSql);
	$huoniaoTag->assign('username', $username[0]['username']);

	$huoniaoTag->assign('people', $people);
	$huoniaoTag->assign('contact', $contact);
	$huoniaoTag->assign('tel', $telphone);
	$huoniaoTag->assign('qq', $qq);
	$huoniaoTag->assign('psaudit', $psaudit);
	$huoniaoTag->assign('note', $note);
	$huoniaoTag->assign('shopFee', $shopFee);
	$huoniaoTag->assign('click', $click == "" ? "1" : $click);
	$huoniaoTag->assign('weight', $weight == "" ? "1" : $weight);
	$huoniaoTag->assign('logoSource', $logoSource);
	$huoniaoTag->assign('video', $video);
	$huoniaoTag->assign('daystr', $daystr);
	$huoniaoTag->assign('daystrarr', $daystrarr);
	$huoniaoTag->assign('periodarr', $periodarr);
	$huoniaoTag->assign('period', $period);
	$huoniaoTag->assign('periodstr', $periodstr);
	$huoniaoTag->assign('yingye', $yingye);
	$huoniaoTag->assign('yingyeTime', $yingyeTime);
	$huoniaoTag->assign('yingyeWeek', $yingyeWeek);
	$huoniaoTag->assign('madvertisear', $madvertisear);
	$huoniaoTag->assign('padvertisear', $padvertisear);
    $huoniaoTag->assign('facility', $facility);
    $huoniaoTag->assign('notice', $noticearr);


    //显示状态
	$huoniaoTag->assign('stateopt', array('0', '1', '2'));
	$huoniaoTag->assign('statenames',array('待审核','已审核','审核拒绝'));
	$huoniaoTag->assign('state', $state == "" ? 1 : $state);
    $huoniaoTag->assign('refuse', $refuse);

	//属性
	$huoniaoTag->assign('certiopt', array('0', '1', '2'));
	$huoniaoTag->assign('certinames',array('待认证','已认证','认证失败'));
	$huoniaoTag->assign('certi', $certi == "" ? 1 : $certi);

	//商城类型
    $huoniaoTag->assign('shoptypeopt', array('1', '2'));
    $huoniaoTag->assign('shoptypename',array('本地团购','电商销售'));
    $huoniaoTag->assign('shoptype', $shoptype == "" ? ($huodongshoptypeopen != 0 ? $huodongshoptypeopen : 1) : $shoptype);

	$huoniaoTag->assign('rec', $rec);

    $huoniaoTag->assign('cityid', $cityid);
	$huoniaoTag->assign('shop_openid', $shop_openid);

    $huoniaoTag->assign('atlasMax', $customAtlasMax);
    $huoniaoTag->assign('atlasSize', $custom_atlasSize);
    
	// // 打印机配置
	// $huoniaoTag->assign('bind_printList', array(0 => '关闭', 1 => '开启'));
	// $huoniaoTag->assign('bind_print', $bind_print);
	// $huoniaoTag->assign('print_config', $print_config);
	// $huoniaoTag->assign('print_state', $print_state);
	if($id !=''){
    $printsql = $dsql->SetQuery("SELECT * FROM `#@__shop_shopprint` WHERE `sid` = $id");
    $printret = $dsql->dsqlOper($printsql,"results");
	}
    $huoniaoTag->assign('printret', $printret ? $printret : array());
	$huoniaoTag->assign('lnglat', $lng.",".$lat);
    $huoniaoTag->assign('tuanTag',explode("|",$customtuanTag));
    $Sql = $dsql->SetQuery("SELECT `id`,`typename` FROM `#@__shop_authattr` WHERE 1=1 ORDER BY `weight` ASC ");
	$Ress = $dsql->dsqlOper($Sql, "results");


    $tuan = $dsql->SetQuery("SELECT `promotype` FROM `#@__shop_product` WHERE `promotype` = 1 AND `store` = '$id'");
    $tuanresult = $dsql->dsqlOper($tuan,"results");
    $tuantype = 0;
    if ($tuanresult){
        $tuantype = 1;
    }
    $huoniaoTag->assign('tuantype', $tuantype);


    $proSql = $dsql->SetQuery("SELECT count(CASE WHEN `typesales` = 1 THEN `id` ELSE null END) as daodian,
                                                  count(CASE WHEN `typesales` = 2 THEN `id` ELSE null END) as pt, 
                                                  count(CASE WHEN `typesales` = 3 THEN `id` ELSE null END) as shangjia, 
                                                  count(CASE WHEN `typesales` = 4 THEN `id` ELSE null END) as kuaidi
                                                  FROM `#@__shop_product` WHERE 1=1 AND  `store` = '$id'");
    $Res = $dsql->dsqlOper($proSql, "results");
    $huoniaoTag->assign('daodiancount', $Res[0]['daodian']);


    $huoniaoTag->assign('authattr', $Res&&is_array($Ress) ? $Ress : array());
    
    //以资质表为主
    $_authattrtypearr = array();
    if($Res&&is_array($Ress)){
        foreach ($Ress as $key => $val){
            if($authattrtypearr[$key]){
                array_push($_authattrtypearr, $authattrtypearr[$key]);
            }
        }
    }
    $huoniaoTag->assign('authattrtypearr', $_authattrtypearr);


    $explosionarr = $explosion != '' ? explode(",", $explosion) : array();

    $huoniaoTag->assign('explosionidarr', $explosionarr);
    $newexplosionarr = array();

    $time = GetMkTime(time());
    foreach ($explosionarr as $key => $value) {

        $Sql = $dsql->SetQuery("SELECT p.`id`,p.`title`,p.`litpic`,p.`sales`,h.`huodongprice`,p.`mprice`,h.`huodongtype` FROM `#@__shop_product` p LEFT JOIN `#@__shop_huodongsign` h ON p.`id` = h.`proid` WHERE 1=1 AND p.`id` = '$value' ");
        $Res = $dsql->dsqlOper($Sql, "results");

        if ($Res) {
            if ($Res[0]['huodongtype'] != 3) {
                $newexplosionarr[$key]['id']         = $Res[0]['id'];
                $newexplosionarr[$key]['title']      = $Res[0]['title'];
                $newexplosionarr[$key]['litpic']     = $Res[0]['litpic'];
                $newexplosionarr[$key]['sales']      = $Res[0]['sales'];
                $newexplosionarr[$key]['litpicpath'] = getFilePath($Res[0]['litpic']);
            } else {
                $newexplosionarr[$key]['id']         = $Res[0]['id'];
                $newexplosionarr[$key]['title']      = $Res[0]['title'];
                $newexplosionarr[$key]['litpic']     = $Res[0]['litpic'];
                $newexplosionarr[$key]['litpicpath'] = getFilePath($Res[0]['litpic']);
            }
            $newexplosionarr[$key]['url'] = getUrlPath(array('service' => 'shop', 'template' => 'detail', 'id' => $Res[0]['id']));
        }
    }
    $huoniaoTag->assign('explosion', $explosion);
    $huoniaoTag->assign('explosionarr', $newexplosionarr);
    
    
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/shop";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}

//获取行业分类列表
function getTypeList($id, $tab){
	global $dsql;
	$sql = $dsql->SetQuery("SELECT `id`, `parentid`, `typename` FROM `#@__".$tab."` WHERE `parentid` = $id ORDER BY `weight`");
	$results = $dsql->dsqlOper($sql, "results");
	if($results){
		return $results;
	}else{
		return '';
	}
}
