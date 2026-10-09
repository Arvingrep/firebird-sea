<?php
/**
 * 添加信息
 *
 * @version        $Id: videoAdd.php 2016-1-18 下午16:43:15 $
 * @package        HuoNiao.Image
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/video";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "videoAdd.html";

if($action == ""){
	$action = "video";
}

$dotitle = "视频";

$dopost = $dopost ? $dopost : "save";        //操作类型 save添加 edit修改

if($dopost == "edit"){
	checkPurview("edit".$action);
}else{
	checkPurview("videoAdd".$action);
}
$pagetitle     = "发布信息";

if($submit == "提交"){
	$flags = isset($flags) ? join(',',$flags) : '';         //自定义属性
	$pubdate = GetMkTime($pubdate);       //发布时间

	//对字符进行处理
	$title       = cn_substrR($title,60);
	$subtitle    = cn_substrR($subtitle,36);
	$source      = cn_substrR($source,30);
	$sourceurl   = cn_substrR($sourceurl,150);
	$writer      = cn_substrR($writer,20);
	$keywords    = cn_substrR($keywords,50);
	$description = cn_substrR($description,150);
	$color       = cn_substrR($color,6);

	if(!empty($litpic)){
		if(!empty($flags)){
			$flags .= ",p";
		}else{
			$flags .= "p";
		}
	}

	//获取当前管理员
	$adminid = $userLogin->getUserID();
}
if(empty($click)) $click = mt_rand(50, 200);

//页面标签赋值
$huoniaoTag->assign('dopost', $dopost);

//自定义属性-多选
$huoniaoTag->assign('flag',array('h','r','b','t'));
$huoniaoTag->assign('flagList',array('头条[h]','推荐[r]','加粗[b]','跳转[t]'));

$huoniaoTag->assign('pubdate', GetDateTimeMk(time()));

//评论开关-单选
$huoniaoTag->assign('postopt', array('0', '1'));
$huoniaoTag->assign('postnames',array('开启','关闭'));
$huoniaoTag->assign('notpost', 0);  //评论开关默认开启

//阅读权限-下拉菜单
$huoniaoTag->assign('arcrankList', array(0 => '等待审核', 1 => '审核通过', 2 => '审核拒绝'));
$huoniaoTag->assign('arcrank', 1);  //阅读权限默认审核通过

if($dopost == "edit"){

	$pagetitle = "修改信息";

	if($submit == "提交"){
		if($token == "") die('token传递失败！');
		if($id == "") die('要修改的信息ID传递失败！');

        //表单二次验证
        if(empty($cityid)){
            echo '{"state": 200, "info": "请选择城市"}';
            exit();
        }

        $adminCityIdsArr = explode(',', $adminCityIds);
        if(!in_array($cityid, $adminCityIdsArr)){
            echo '{"state": 200, "info": "要发布的城市不在授权范围"}';
            exit();
        }

		if(trim($title) == ''){
			echo '{"state": 200, "info": "标题不能为空"}';
			exit();
		}

		if($typeid == ''){
			echo '{"state": 200, "info": "请选择信息分类"}';
			exit();
		}
        if($price =='' && ($videocharge && in_array('3', $videocharge))){
            echo '{"state": 200, "info": "请填写价格"}';
            exit();
        }

        if(empty($priceinfo) && ($videocharge && in_array('1', $videocharge))){
            echo '{"state": 200, "info": "请选择会员~!"}';
            exit();
        }

		$videotype = (int)$videotype;

		if(!$videotype){

			if(empty($video)){
				echo '{"state": 200, "info": "请上传视频"}';
				exit();
			}

			$videourl = $video;
		}

		if(empty($videourl)){
			echo '{"state": 200, "info": "请填写视频地址"}';
			exit();
		}
		if(stripos($videourl,'<iframe') !== false){
			$videourl = str_replace("<iframe", "", $videourl);
			$videourl = str_replace("iframe>", "", $videourl);
			$videourl = str_replace("</", "", $videourl);
			$videourl = str_replace(">", "", $videourl);
			$iframe = explode(" ", $videourl);
			foreach ($iframe as $k => $v) {
				if(stripos($v,'src') !== false){
					$videourl = str_replace("'", "", $v);
					$videourl = str_replace('"', "", $videourl);
					$videourl = str_replace("src=", "", $videourl);
					break;
				}
			}
		}
		$videourl = stripslashes($videourl);

        $videocharge = isset($videocharge) ? join(',',$videocharge) : '';         //自定义属性
        if($priceinfo){

        	$videochargeinfo = implode(',',$priceinfo);
        }

        if($businessinfo){
            $businessinfoarr = implode(',',$businessinfo);
        }
        $commodity = stripslashes($commodity);

        $price  = (float)$price;
        $hour   = (int)$hour;
        $minute = (int)$minute;
        $second = (int)$second;
        $livetime_ = '';
        if($minute || $second){
            $livetime = ($hour * 3600 +$minute * 60 + $second) * 1000;
            $livetime_ = ", `videotime` = $livetime";
        }
		//保存到主表
		$archives = $dsql->SetQuery("UPDATE `#@__".$action."list` SET `cityid` = '$cityid', `title` = '$title', `subtitle` = '$subtitle', `flag` = '$flags', `redirecturl` = '$redirecturl', `weight` = '$weight', `litpic` = '$litpic', `source` = '$source', `sourceurl` = '$sourceurl', `videotype` = '$videotype', `videourl` = '$videourl', `writer` = '$userid', `typeid` = '$typeid', `keywords` = '$keywords', `description` = '$description', `click` = '$click', `color` = '$color', `arcrank` = '$arcrank',`album` ='$album',`price`= '$price',`videochargeinfo`='$videochargeinfo',`businessinfo` = '$businessinfoarr',`videocharge`='$videocharge',`commodity`='$commodity',`pubdate` = '$pubdate' $livetime_ WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "update");

		if($results != "ok"){
			echo '{"state": 200, "info": "主表保存失败！"}';
			exit();
		}

        /*新增*/
        $commodityarr = json_decode($commodity,true);
        foreach ($commodityarr as $k =>$v){
            if($v['id']!=''){
                $sefooddsql = $dsql->SetQuery("SELECT `id` FROM `#@__video_goods` WHERE `gid` = '".$v['id']."' AND `vid` = '".$id."'");
                $sefooddres = $dsql->dsqlOper($sefooddsql,'results');
            }
            if(empty($sefooddres) || $v['id'] == ''){
                $foodsql = $dsql->SetQuery("INSERT INTO `#@__video_goods` (`vid`,`goodsurl`,`gid`,`litpic`,`title`,`price`) VALUES ('".$id."','".$v['url']."','".$v['id']."','".$v['litpic']."','".$v['title']."','".$v['price']."')");
                $inserid = $dsql->dsqlOper($foodsql, "lastid");

                $v['id'] = $inserid;
            }
        }

//         /*删除*/
//         $defoodsql = $dsql->SetQuery("SELECT `gid` FROM `#@__video_goods` WHERE `vid` = '".$id."'");

// 		$defoodres = $dsql->dsqlOper($defoodsql,"results");

//         $commodityid =  array_column(json_decode($commodity,true),'id');
// //        $commodityidarr = implode(',',$commodityid); /*传过来的商品*/
//         if(is_array($defoodres)&&!empty($defoodres)){/*原来的商品*/
//             $deid    = array_column($defoodres,'gid');
// //            $deidarr = implode(',',$deid);
//         }
//         $delarr = array();
//         if($deid){

// 	        for ($i = 0; $i<count($deid);$i++){
// 	            if(!in_array($deid[$i],$commodityid)){
// 	                array_push($delarr,$deid[$i]);
// 	            }
// 	        }
//         }
//         /*删除商品*/

// //        var_dump($delarr);die;
//         if(!empty($delarr)){
//             for ($a = 0; $a<count($delarr);$a++){
//                 $archives = $dsql->SetQuery("DELETE FROM `#@__video_goods` WHERE `gid` = '".$delarr[$a]."' AND `vid` = '$id'");
//                 $dsql->dsqlOper($archives, "update");
//             }
//         }

        adminLog("修改".$dotitle."信息", $title);

		$param = array(
			"service"     => $action,
			"template"    => "detail",
			"id"          => $id,
			"flag"        => $flags
		);
		$url = getUrlPath($param);
        dataAsync("video",$id);   // 修改视频信息
		echo '{"state": 100, "url": "'.$url.'"}';die;
		exit();

	}else{
		if(!empty($id)){

			//主表信息
			$archives = $dsql->SetQuery("SELECT * FROM `#@__".$action."list` WHERE `id` = ".$id);
			$results = $dsql->dsqlOper($archives, "results");

			if(!empty($results)){

				$title       = $results[0]['title'];
				$subtitle    = $results[0]['subtitle'];
				$typeid      = $results[0]['typeid'];
				$flagitem    = explode(",", $results[0]['flag']);
				$flags       = $results[0]['flag'];
				$redirecturl = $results[0]['redirecturl'];
				$weight      = $results[0]['weight'];
				$litpic      = $results[0]['litpic'];
				$source      = $results[0]['source'];
				$sourceurl   = $results[0]['sourceurl'];
				$videotype   = $results[0]['videotype'];
				$videourl    = $results[0]['videourl'];
				$writer      = $results[0]['writer'];
				$keywords    = $results[0]['keywords'];
				$description = $results[0]['description'];
				$notpost     = $results[0]['notpost'];
				$click       = $results[0]['click'];
				$color       = $results[0]['color'];
				$arcrank     = $results[0]['arcrank'];
				$album       = $results[0]['album'];
				$price       = $results[0]['price'];
				$videocharge = $results[0]['videocharge'];
				$videochargeinfo = $results[0]['videochargeinfo'];
				$businessinfo = $results[0]['businessinfo'];
				$price       = $results[0]['price'];
                $livetime	 = $results[0]['videotime'];
				$pubdate     = date('Y-m-d H:i:s', $results[0]['pubdate']);
                $cityid  = $results[0]['cityid'];

				global $data;
				$data = "";
				$typename = getParentArr($action."type", $results[0]['typeid']);
				$typename = join(" > ", array_reverse(parent_foreach($typename, "typename")));
				if(stripos($videourl,'<iframe') !== false){
					$videourl = str_replace("<iframe", "", $videourl);
					$videourl = str_replace("iframe>", "", $videourl);
					$videourl = str_replace("</", "", $videourl);
					$videourl = str_replace(">", "", $videourl);
					$iframe = explode(" ", $videourl);
					foreach ($iframe as $k => $v) {
						if(stripos($v,'src') !== false){
							$videourl = str_replace("'", "", str_replace('"', "", str_replace('src=', "", $v)));
							break;
						}
					}
				}

			$articleDetail["videourl"]	  = $videourl;

            if($livetime){
                $hour   = (int)($livetime /1000/3600 );
                $minute = (int)($livetime / 1000 / 60 %60);
                $second = $livetime / 1000 % 60;
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
}elseif($dopost == "" || $dopost == "save"){
	$dopost = "save";

	//表单提交
	if($submit == "提交"){
		if($token == "") die('token传递失败！');

        //表单二次验证
        if(empty($cityid)){
            echo '{"state": 200, "info": "请选择城市"}';
            exit();
        }

        $adminCityIdsArr = explode(',', $adminCityIds);
        if(!in_array($cityid, $adminCityIdsArr)){
            echo '{"state": 200, "info": "要发布的城市不在授权范围"}';
            exit();
        }
		if(trim($title) == ''){
			echo '{"state": 200, "info": "标题不能为空"}';
			exit();
		}

		if($typeid == ''){
			echo '{"state": 200, "info": "请选择信息分类"}';
			exit();
		}
        if($userid == ''){
            echo '{"state": 200, "info": "请选择作者"}';
            exit();
        }

        if($price =='' && in_array('3', $videocharge)){
            echo '{"state": 200, "info": "请填写价格"}';
            exit();
        }

		$videotype = (int)$videotype;

		if(!$videotype){

			if(empty($video)){
				echo '{"state": 200, "info": "请上传视频"}';
				exit();
			}

			$videourl = $video;
		}

		if(empty($videourl)){
			echo '{"state": 200, "info": "请填写视频地址"}';
			exit();
		}
		if(stripos($videourl,'<iframe') !== false){
			$videourl = str_replace("<iframe", "", $videourl);
			$videourl = str_replace("iframe>", "", $videourl);
			$videourl = str_replace("</", "", $videourl);
			$videourl = str_replace(">", "", $videourl);
			$iframe = explode(" ", $videourl);
			foreach ($iframe as $k => $v) {
				if(stripos($v,'src') !== false){
					$videourl = str_replace("'", "", $v);
					$videourl = str_replace('"', "", $videourl);
					$videourl = str_replace("src=", "", $videourl);
					break;
				}
			}
		}
		$videourl = stripslashes($videourl);

        if(empty($priceinfo) && ($videocharge && in_array('1', $videocharge))){
            echo '{"state": 200, "info": "请选择会员~!"}';
            exit();
        }
		$videocharge = !empty($videocharge)? join(',',$videocharge) : '';         //自定义属性

       	if($priceinfo){
            $priceinfo = implode(',',$priceinfo);
        }

        if($businessinfo){
            $businessinfoarr = implode(',',$businessinfo);
        }

		$price  = (float)$price;
        $hour   = (int)$hour;
        $minute = (int)$minute;
        $second = (int)$second;
        $livetimef_ = '';
        $livetimev_ = '';
        if($minute || $second || $hour){
            $livetimef_ = ',`videotime`';
            $livetimev_ = ",'".(( $hour * 3600 +$minute * 60 + $second) * 1000)."'";
        }

//        }
        //保存到主表
        $archives = $dsql->SetQuery("INSERT INTO `#@__".$action."list` (`cityid`, `title`, `subtitle`, `flag`, `redirecturl`, `weight`, `litpic`, `source`, `sourceurl`, `videotype`, `videourl`, `writer`, `typeid`, `keywords`, `description`, `click`, `color`, `arcrank`, `pubdate`, `admin`,`album`,`videocharge`,`videochargeinfo`,`businessinfo`,`price` $livetimef_) VALUES ('$cityid', '$title', '$subtitle', '$flags', '$redirecturl', '$weight', '$litpic', '$source', '$sourceurl', '$videotype', '$videourl', '$userid', '$typeid', '$keywords', '$description', '$click', '$color', '$arcrank', '$pubdate', '$adminid','$album','$videocharge','$priceinfo','$businessinfoarr','$price' $livetimev_)");

        $aid = $dsql->dsqlOper($archives, "lastid");

        $commodity = json_decode(stripslashes($commodity),true);
        foreach ($commodity as $k =>$v){
            $foodsql =$dsql->SetQuery("INSERT INTO `#@__video_goods` (`vid`,`goodsurl`,`gid`,`litpic`,`title`,`price`) VALUES ('".$aid."','".$v['url']."','".$v['id']."','".$v['litpic']."','".$v['title']."','".$v['price']."')");
            $dsql->dsqlOper($foodsql, "update");
        }

        adminLog("添加".$dotitle."信息", $title);

		$param = array(
			"service"     => "video",
			"template"    => "detail",
			"id"          => $aid,
			"flag"        => $flags
		);
		$url = getUrlPath($param);
        dataAsync("video",$aid);  // 新增视频
		echo '{"state": 100, "url": "'.$url.'"}';die;

	}

}elseif($dopost == "getTree"){
	$options = $dsql->getOptionList($pid, $action);
	echo json_encode($options);die;
}elseif ($dopost == "getAlbum"){
    $storeOption = array();
    $archives = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__video_album` WHERE `uid` = '".$uid."' ORDER BY `id` DESC");
    $results = $dsql->dsqlOper($archives, "results");

    /*视频是哪个专辑*/
    $ablumsql = $dsql->SetQuery("SELECT `album` FROM `#@__videolist` WHERE `id` = '".$videoid."'");

    $ablumres = $dsql->dsqlOper($ablumsql,"results");
    $album = (int)$ablumres[0]['album'];
    if($results){
        $storeOption[0] = '<option value="0" >暂不选择</option>';
        foreach($results as $key => $val){
            $selected = "";
            if($val["id"] == $album){
                $selected = "selected";
            }
            array_push($storeOption, '<option value="'.$val["id"].'"'.$selected.'>'.$val["title"].'</option>');
        }
        echo '{"state": 100, "info": '.json_encode($storeOption).',"uid":"'.$uid.'"}';die;
    }else{
        echo '{"state": 200, "info": "暂无专辑!"}';
        exit();
    }
}elseif($dopost == "delgoods"){
    if($id ==''){
        echo '{"state": 200, "info": "请传id!"}';
        exit();
    }

    $archives = $dsql->SetQuery("DELETE FROM `#@__video_goods` WHERE `id` = '".$id."'");
    $res      = $dsql->dsqlOper($archives, "update");
    if($res =="ok"){
        echo '{"state": 100, "info": "删除成功"}';die;
    }else{
        echo '{"state": 200, "info": "删除失败"}';
        exit();
    }

}
//css
$cssFile = array(
    'ui/jquery.chosen.css',
    'admin/chosen.min.css',
    'admin/videoAdd.css'
);
$huoniaoTag->assign('cssFile', includeFile('css', $cssFile));
//验证模板文件
if(file_exists($tpl."/".$templates)){

	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'ui/bootstrap-datetimepicker.min.js',
		'ui/jquery.colorPicker.js',
		'ui/jquery.dragsort-0.5.1.min.js',
        'ui/chosen.jquery.min.js',
		'publicUpload.js',
		'admin/video/videoAdd.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	require_once(HUONIAOINC."/config/".$action.".inc.php");

	global $customUpload;
	if($customUpload == 1){
		global $custom_thumbSize;
		global $custom_thumbType;
		global $custom_atlasSize;
		global $custom_atlasType;
		$huoniaoTag->assign('thumbSize', $custom_thumbSize);
		$huoniaoTag->assign('thumbType', "*.".str_replace("|", ";*.", $custom_thumbType));
		$huoniaoTag->assign('atlasSize', $custom_atlasSize);
		$huoniaoTag->assign('atlasType', "*.".str_replace("|", ";*.", $custom_atlasType));
	}

	$huoniaoTag->assign('customDelLink', $customDelLink);
	$huoniaoTag->assign('customAutoLitpic', $customAutoLitpic);

	$huoniaoTag->assign('action', $action);
	$huoniaoTag->assign('pagetitle', $pagetitle);
	$huoniaoTag->assign('dopost', $dopost);
	$huoniaoTag->assign('id', $id);
    $huoniaoTag->assign('cityid', (int)$cityid);
	$huoniaoTag->assign('title', htmlentities($title, ENT_NOQUOTES, "utf-8"));
	$huoniaoTag->assign('subtitle', $subtitle);
	$huoniaoTag->assign('typeid', empty($typeid) ? "0" : $typeid);
	$huoniaoTag->assign('typename', empty($typename) ? "选择分类" : $typename);
	$huoniaoTag->assign('flagitem', $flagitem);
	$huoniaoTag->assign('flags', empty($flags) ? "" : $flags);
	$huoniaoTag->assign('redirecturl', $redirecturl);
	$huoniaoTag->assign('weight', $weight == "" ? "50" : $weight);
	$huoniaoTag->assign('litpic', $litpic);
	$huoniaoTag->assign('source', $source);
	$huoniaoTag->assign('sourceurl', $sourceurl);
	$huoniaoTag->assign('videourl', $videourl);
	$huoniaoTag->assign('uid', $writer);
	$huoniaoTag->assign('keywords', $keywords);
	$huoniaoTag->assign('description', $description);
	$huoniaoTag->assign('imglist', empty($imglist) ? "''" : $imglist);
	$huoniaoTag->assign('click', $click);
	$huoniaoTag->assign('color', $color);
	$huoniaoTag->assign('arcrank', $arcrank == "" ? 1 : $arcrank);
	$huoniaoTag->assign('pubdate', empty($pubdate) ? date("Y-m-d H:i:s",time()) : $pubdate);
    $huoniaoTag->assign('cityList', json_encode($adminCityArr));


    //用户
    $usersql = $dsql->SetQuery("SELECT `nickname` FROM `#@__member` WHERE  `id` = '".$writer."'");
    $userres = $dsql->dsqlOper($usersql,"results");
    $huoniaoTag->assign('nickname', $userres[0]['nickname']);

    //专辑
    $archives = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__video_album` WHERE `uid` = '".$writer."' ORDER BY `id` DESC");
    $results = $dsql->dsqlOper($archives, "results");
    $storeOption = array();
    $storeOption[0] = '<option value="0" >暂不选择</option>';
    foreach($results as $key => $val){
        $selected = "";
        if($val["id"] == $album){
            $selected = "selected";
        }
        array_push($storeOption, '<option value="'.$val["id"].'"'.$selected.'>'.$val["title"].'</option>');
    }
    $huoniaoTag->assign('storeOption', join("", $storeOption));
	//视频类型
	$huoniaoTag->assign('videotypeArr', array('0', '1'));
	$huoniaoTag->assign('videotypeNames',array('本地','外站调用'));
    $huoniaoTag->assign('videotype', (int)$videotype);
    $huoniaoTag->assign('videochargeinfo', explode(',',$videochargeinfo));

    $huoniaoTag->assign('businessinfo', explode(',',$businessinfo));

    //收费模式
//    $huoniaoTag->assign('videochargeTypearr', array('0', '1','3'));
//    $huoniaoTag->assign('videochargeNames',array('免费','会员','收费'));

    $huoniaoTag->assign('videochargeTypearr',array('0','1','3'));
    $huoniaoTag->assign('videochargeNames',array('免费','会员','收费'));
    $huoniaoTag->assign('videocharge', $videocharge == ''? array('0'=>'0') : explode(',',$videocharge));

    $levelsql  = $dsql->SetQuery("SELECT `id`,`name` FROM `#@__member_level` WHERE  1=1 ORDER BY `id` ASC");

    $levelres  = $dsql->dsqlOper($levelsql,"results");

    $huoniaoTag->assign('levelarr', $levelres);

    $businesssql  = $dsql->SetQuery("SELECT `id`,`title` FROM `#@__business_list` WHERE  `state`=1");

    $businessres  = $dsql->dsqlOper($businesssql,"results");

    $huoniaoTag->assign('businessarr', $businessres);


    $huoniaoTag->assign('price',$price);

    $huoniaoTag->assign('hour', $hour);
    $huoniaoTag->assign('minute', $minute);
    $huoniaoTag->assign('second', $second);
    if($id){
        $commoditysql = $dsql->SetQuery("SELECT * FROM `#@__video_goods` WHERE `vid` = ".$id);
        $commodityres = $dsql->dsqlOper($commoditysql,'results');
    }else{
        $commodityres = array();
    }

     $huoniaoTag->assign('commodity',$commodityres);

	$huoniaoTag->assign('typeListArr', json_encode($dsql->getTypeList(0, $action."type")));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/video";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
