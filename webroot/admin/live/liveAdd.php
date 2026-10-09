<?php
/**
 * 添加信息
 *
 * @version        $Id: videoAdd.php 2016-1-18 下午16:43:15 $
 * @package        HuoNiao.Image
 * @copyright      Copyright (c) 2013 - 2015, HuoNiao, Inc.
 * @link           http://www.huoniao.co/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/live";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "liveAdd.html";

if($action == ""){
	$action = "live";
}

$dotitle = "直播";

$dopost = $dopost ? $dopost : "save";        //操作类型 save添加 edit修改

if($dopost == "edit"){
	checkPurview("liveList");
}
else{
	checkPurview("liveAdd");
}
$pagetitle     = "发布信息";

if($submit == "提交"){
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
	$pulltype    = (int)$pulltype;
    if($lnglat){
        $a = explode(",", $lnglat);
        $lng = $a[0];
        $lat = $a[1];
    }else{
        $lng = $lat = "";
    }

    $flags = isset($flags) ? join(",", $flags) : '';         //自定义属性
    if($flags){
        $flags_ = explode(',', $flags);
        $flag_h = in_array('h', $flags_) ? 1 : 0;
        $flag_r = in_array('r', $flags_) ? 1 : 0;
    }else{
        $flag_h = $flag_r = 0;
    }

	//获取当前管理员
	$adminid = $userLogin->getUserID();

	$menuArr = array();
	foreach ($menu as $key => $value) {
		$value['sys'] = (int)$value['sys'];
		$value['show'] = (int)$value['show'];

		if(empty($value['name']) || ($value['sys'] == -1 && empty($value['url'])) )  {
			// print_r($value);die;
			echo '{"state": 200, "info": "请填写完整直播菜单"}';
			exit();
		}
		$menuArr[] = $value;
	}
	$menuData = serialize($menuArr);
	if(strlen($menuData) > 2000){
		echo '{"state": 200, "info": "直播菜单总长度超出限制"}';
		exit();
	}
    $adv = cn_substrR($adv,60);
}
$replay = 1;

//页面标签赋值
$huoniaoTag->assign('dopost', $dopost);

$huoniaoTag->assign('pubdate', GetDateTimeMk(time()));

//阅读权限-下拉菜单
$huoniaoTag->assign('stateList', array(0 => '未直播', 1 => '正在直播', 2 => '直播结束'));
$huoniaoTag->assign('state', 1);  //阅读权限默认审核通过

if($dopost == "edit"){

	$pagetitle = "修改信息";

	if($submit == "提交"){
		if($token == "") die('token传递失败！');
		if($id == "") die('要修改的信息ID传递失败！');

		if(trim($title) == ''){
			echo '{"state": 200, "info": "标题不能为空"}';
			exit();
		}
		if($typeid == ''){
			echo '{"state": 200, "info": "请选择信息分类"}';
			exit();
		}
		if($livetype==1 &&  $password == ''){
			echo '{"state": 200, "info": "请填写加密密码"}';
			exit();
		}

		if($livetype==2 && $startmoney == ''){
			echo '{"state": 200, "info": "请填写开始收费"}';
			exit();
		}

		if($livetype==2 && $endmoney == ''){
			echo '{"state": 200, "info": "请填写结束收费"}';
			exit();
		}
        if($livetype==1){
            $startmoney=$endmoney='0.00';
        }elseif($livetype==2){
            $password='';
        }else{
            $password='';
            $startmoney=$endmoney='0.00';
        }
        if($pulltype && (empty($pullurl_pc) || empty($pullurl_touch))){
        	echo '{"state": 200, "info": "请输入拉流地址"}';
        	exit();
        }

        $sql = $dsql->SetQuery("SELECT `id`, `pulltype`, `pushurl`, `user` FROM `#@__livelist` WHERE `id` = $id");
        $res = $dsql->dsqlOper($sql, "results");
        if(!$res){
        	echo '{"state": 200, "info": "信息不存在"}';
        	exit();
        }
        $uid = $res[0]['user'];
        // if($res[0]['pulltype']){
        //     if(empty($pushurl)) return array("state" => 200, "info" => '请输入第三方推流地址');
        //     if($pushurl != $res[0]['pushurl']){
        //         $pushurl_ = ", `pushurl` = '$pushurl'";
        //     }
        // }
        // if(empty($pulltype)){

        //     // 上一次是手动输入，需要重新生成
        //     if($res[0]['pulltype']){
        //     	$obj = new live();
        //         $streamName = 'live' . $id . '-' . $uid;
        //         $vhost      = $obj->aliLive->vhost;
        //         $time       = time() + 2592000;  //1个月有效期
        //         $videohost  = $obj->aliLive->video_host;
        //         $vhost      = $obj->aliLive->vhost;
        //         $appName    = $obj->aliLive->appName;
        //         $privateKey = $obj->aliLive->privateKey;
        //         if ($privateKey) {
        //             $auth_key = md5('/' . $appName . '/' . $streamName . '-' . $time . '-0-0-' . $privateKey);
        //             //生成推流地址
        //             $pushurl = $videohost . '/' . $appName . '/' . $streamName . '?auth_key=' . $time . '-0-0-' . $auth_key;
        //         } else {
        //             //生成推流地址
        //             $pushurl = $videohost . '/' . $appName . '/' . $streamName;
        //         }
        //     }else{
        //         $pushurl = $res[0]['pushurl'];
        //     }
        // }
        $pullurl_ = ", `pulltype` = $pulltype, `pullurl_touch` = '$pullurl_touch', `pullurl_pc` = '$pullurl_pc'";

        $minute = (int)$minute;
        $second = (int)$second;
        $livetime_ = '';
        if($minute || $second){
            $livetime = ($minute * 60 + $second) * 1000;
            $livetime_ = ", `livetime` = $livetime";
        }

		//保存到主表
		$archives = $dsql->SetQuery("UPDATE `#@__".$action."list` SET  `title` = '$title',`typeid`='$typeid',`litpic`='$litpic',`click`='$click',`replay`='$replay',`starttime`='$pubdate',`way`='$way',`catid`='$livetype',`password`='$password',`startmoney`='$startmoney',`endmoney`='$endmoney',`flow`='$flow', `note` = '$note', `menu` = '$menuData', `adv` = '$adv' $pullurl_ $livetime_ , `flag_h` = $flag_h, `flag_r` = $flag_r, `lng` = '$lng', `lat` = '$lat' WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "update");

		if($results != "ok"){
			echo '{"state": 200, "info": "主表保存失败！"}';
			exit();
		}

		adminLog("删除".$dotitle."live", $title);

		$param = array(
			"service"     => $action,
			"template"    => "detail",
			"id"          => $id,
			"flag"        => $flags
		);
		$url = getUrlPath($param);

		echo '{"state": 100, "url": "'.$url.'"}';die;
		exit();

	}else{
		if(!empty($id)){

			//主表信息
			$archives = $dsql->SetQuery("SELECT * FROM `#@__".$action."list` WHERE `id` = ".$id);
			$results = $dsql->dsqlOper($archives, "results");
			if(!empty($results)){
				$title       = $results[0]['title'];
				$typeid      = $results[0]['typeid'];
				$click       = $results[0]['click'];
				$replay      = $results[0]['replay'];
				$litpic      = $results[0]['litpic'];
				$pubdate     = $results[0]['pubdate'];
				$way         = $results[0]['way'];
				$livetype    = $results[0]['catid'];
				$password    = $results[0]['password'];
				$startmoney  = $results[0]['startmoney'];
				$endmoney    = $results[0]['endmoney'];
				$flow		 = $results[0]['flow'];
				$note		 = $results[0]['note'];
				$menu		 = $results[0]['menu'];
				$pulltype	 = $results[0]['pulltype'];
                $pushurl     = $results[0]['pushurl'];
                $pullurl_pc  = $results[0]['pullurl_pc'];
                $pullurl_touch   = $results[0]['pullurl_touch'];
				$livetime	 = $results[0]['livetime'];
                $adv         = $results[0]['adv'];
                $flag_h         = $results[0]['flag_h'];
                $flag_r         = $results[0]['flag_r'];
                $lnglat         = $results[0]['lng'] && $results[0]['lat'] ? $results[0]['lng'].','.$results[0]['lat'] : '';

                $flagArr = [];
                if($results[0]['flag_h']){
                    $flagArr[] = 'h';
                }
                if($results[0]['flag_r']){
                    $flagArr[] = 'r';
                }
                $flags = join(",", $flagArr);
                $flagitem    = $flagArr;

                if($livetime){
                    $minute = (int)($livetime / 1000 / 60);
                    $second = $livetime / 1000 % 60;
                }

				global $data;
				$data = "";
				$typename = getParentArr($action."type", $results[0]['typeid']);
				$typename = join(" > ", array_reverse(parent_foreach($typename, "typename")));

			}else{
				ShowMsg('要修改的信息不存在或已删除！', "-1");
				die;
			}

		}else{
			ShowMsg('要修改的信息参数传递失败，请联系管理员！', "-1");
			die;
		}
	}
}
elseif($dopost == "" || $dopost == "save"){
	$dopost = "save";

	//表单提交
	if($submit == "提交"){
		if($token == "") die('token传递失败！');

		if(trim($title) == ''){
			echo '{"state": 200, "info": "标题不能为空"}';
			exit();
		}

		if($typeid == ''){
			echo '{"state": 200, "info": "请选择信息分类"}';
			exit();
		}

		if($livetype==1 &&  $password == ''){
			echo '{"state": 200, "info": "请填写加密密码"}';
			exit();
		}

		if($livetype==2 && $startmoney == ''){
			echo '{"state": 200, "info": "请填写开始收费"}';
			exit();
		}

		if($livetype==2 && $endmoney == ''){
			echo '{"state": 200, "info": "请填写结束收费"}';
			exit();
		}

		//开始生成推流地址
		include_once(HUONIAOROOT."/api/live/alilive/alilive.class.php");
        $aliLive = new Alilive() ;

        $sql = $dsql->SetQuery("SELECT max(`id`) i FROM `#@__livelist`");
        $res = $dsql->dsqlOper($sql, "results");
        $maxid = $res[0]['i']+1;		//最大id

        $streamName='live'.$maxid.'-'.$adminid;
        $vhost=$aliLive->vhost;
        $time = time()+300;
        $videohost = $aliLive->video_host;
        $vhost=$aliLive->vhost;
        $appName=$aliLive->appName;
		$privateKey=$aliLive->privateKey;
		//rtmp://tui.hdsj0898.com/test/test?auth_key=1552379694-0-0-43b37d6273c9f9a700e39573b6fb26d6
        if($privateKey){
            $auth_key =md5('/'.$appName.'/'.$streamName.'-'.$time.'-0-0-'.$privateKey);
			//生成推流地址
			$pushurl =$videohost.'/'.$appName.'/'.$streamName.'?auth_key='.$time.'-0-0-'.$auth_key;
            //$pushurl =$videohost.'/'.$appName.'/'.$streamName.'?vhost='.$vhost.'&auth_key='.$time.'-0-0-'.$auth_key;
        }else{
			//生成推流地址
			$pushurl = $videohost.'/'.$appName.'/'.$streamName;
            //$pushurl = $videohost.'/'.$appName.'/'.$streamName.'?vhost='.$vhost;
        }

        if(!$startmoney){
            $startmoney = 0.00;
        }
        if(!$endmoney){
            $endmoney = 0.00;
        }
		//global $userLogin;
		//$passwd    = $userLogin->_getSaltedHash($password);
		//保存到主表
		$archives = $dsql->SetQuery("INSERT INTO `#@__livelist`
		(`user`,`title`,`catid`,`typeid`,`starttime`,`way`,`password`,`startmoney`,`endmoney`,`click`,`replay`,`litpic`,`pushurl`,`streamname`,`state`, `note`, `menu`, `adv`)

		VALUES ('$adminid','$title','$livetype','$typeid','$pubdate','$way','$passwd','$startmoney','$endmoney','$click','$replay','$litpic','$pushurl','$streamName','0', '$note', '$menuData', '$adv')");

		$aid = $dsql->dsqlOper($archives, "lastid");

		adminLog("添加".$dotitle."信息", $title);

		$param = array(
			"service"     => "live",
			"template"    => "detail",
			"id"          => $aid,
			"flag"        => $flags
		);
		$url = getUrlPath($param);

		echo '{"state": 100, "url": "'.$url.'"}';die;

	}

}elseif($dopost == "getTree"){
	$options = $dsql->getOptionList($pid, $action);
	echo json_encode($options);die;
}
//css
$cssFile = array(
    'ui/jquery.chosen.css',
    'admin/chosen.min.css'
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
		'ui/jquery-ui-sortable.js',
        'ui/chosen.jquery.min.js',
		'publicUpload.js',
		'admin/live/liveAdd.js'
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
	$huoniaoTag->assign('title', htmlentities($title, ENT_NOQUOTES, "utf-8"));
	$huoniaoTag->assign('typeid', empty($typeid) ? "0" : $typeid);
	$huoniaoTag->assign('typename', empty($typename) ? "选择分类" : $typename);
	$huoniaoTag->assign('litpic', $litpic);
	$huoniaoTag->assign('click', (int)$click);
	$huoniaoTag->assign('replay', (int)$replay);
	$huoniaoTag->assign('color', $color);
	$huoniaoTag->assign('pubdate', empty($pubdate) ? date("Y-m-d H:i:s",time()) : date("Y-m-d H:i:s",$pubdate));

	$huoniaoTag->assign('password', $password);
	$huoniaoTag->assign('startmoney', $startmoney);
	$huoniaoTag->assign('endmoney', $endmoney);

	//横竖屏
	$huoniaoTag->assign('wayArr', array('0', '1'));
	$huoniaoTag->assign('wayNames',array('横屏','竖屏'));
	$huoniaoTag->assign('way', (int)$way);
	//直播类型
	$huoniaoTag->assign('livetypeArr', array('0', '1','2'));
	$huoniaoTag->assign('livetypeNames',array('公开','加密','收费'));
	$huoniaoTag->assign('livetype', (int)$livetype);
	//流畅度
	$huoniaoTag->assign('flowArr', array('0', '1','2'));
	$huoniaoTag->assign('flowNames',array('流畅','普清','高清'));
	$huoniaoTag->assign('flow', (int)$flow);

	$huoniaoTag->assign('note', $note);
	$huoniaoTag->assign('menuArr', $menu ? unserialize($menu) : array());


	//拉流地址
	$huoniaoTag->assign('pulltypeArr', array('0', '1'));
	$huoniaoTag->assign('pulltypeNames',array('系统生成','手动输入'));
	$huoniaoTag->assign('pulltype', (int)$pulltype);
    $huoniaoTag->assign('pushurl', $pushurl);

    $huoniaoTag->assign('minute', $minute);
    $huoniaoTag->assign('second', $second);

    $huoniaoTag->assign('adv', $adv);


    // 系统生成拉流地址
    if($id){
        if(empty($pushtype)){
            if(empty($pullurl_touch) || empty($pullurl_pc)){
                $PulldetailHandels = new handlers('live', "getPullSteam");
                $param = array('id' => $id, 'type' => 'm3u8');
                $PulldetailConfig = $PulldetailHandels->getHandle($param);
                $pullurl_touch = $PulldetailConfig['info'];
                $param = array('id' => $id, 'type' => 'flv');
                $PulldetailConfig = $PulldetailHandels->getHandle($param);
                $pullurl_pc = $PulldetailConfig['info'];
            }
        }
    }
    $huoniaoTag->assign('pullurl_pc', $pullurl_pc);
    $huoniaoTag->assign('pullurl_touch', $pullurl_touch);

	$huoniaoTag->assign('typeListArr', json_encode($dsql->getTypeList(0, $action."type")));


    //自定义属性-多选
    $huoniaoTag->assign('flag',array('h','r'));
    $huoniaoTag->assign('flagList',array('热门[h]','推荐[r]'));
    $huoniaoTag->assign('flagitem', $flagitem);
    $huoniaoTag->assign('lnglat', $lnglat);

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/video";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
