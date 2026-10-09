<?php
/**
 * 公众号用户管理
 *
 * @version        $Id: wechatMember.php 2022-4-7 上午10:44:11 $
 * @package        HuoNiao.Wechat
 * @copyright      Copyright (c) 2013 - 2022, 火鸟门户系统(苏州酷曼软件技术有限公司), Inc.
 * @link           https://www.ihuoniao.cn/  https://www.kumanyun.com
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("wechatMember");
$dsql = new dsql($dbo);
$userLogin = new userLogin($dbo);
$tpl = dirname(__FILE__)."/../templates/wechat";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录

$db = "site_wechat_member";
$templates = "wechatMember.html";

//跳转到一下页的JS
$gotojs = "\r\nfunction GotoNextPage(){
    document.gonext."."submit();
}"."\r\nset"."Timeout('GotoNextPage()',1500);";
$dojs = "<script language='javascript'>$gotojs\r\n</script>";
$action = $_GET['action'];

//同步所有会员
if($action == "syncAll"){

    //引入配置文件
    $wechatConfig = HUONIAOINC."/config/wechatConfig.inc.php";
    if(!file_exists($wechatConfig)) {
        ShowMsg('请先设置微信开发者信息！', 'wechatMember.php');
        die;
    }
    require($wechatConfig);

    include_once(HUONIAOROOT."/include/class/WechatJSSDK.class.php");
    $jssdk = new WechatJSSDK($cfg_wechatAppid, $cfg_wechatAppsecret);
    $token = $jssdk->getAccessToken();

    //步骤
    $step = (int)$step;

    //第一步，清除现有的数据
    if(!$step){

        $sql = $dsql->SetQuery("DELETE FROM `#@__".$db."`");
        $dsql->dsqlOper($sql, "update");

        $tmsg = "<p class='text-success' style='text-align:center;'>正在清除历史记录</p>\r\n\r\n";
        $doneForm  = "<form name='gonext' method='post' action='wechatMember.php?action=syncAll'>\r\n";
        $doneForm .= "  <input type='hidden' name='step' value='1' />\r\n</form>\r\n{$dojs}";
        PutInfo($tmsg,$doneForm);
        exit();

    }

    //第二步，查询所有微信用户到本地
    if($step == 1){

        $page = $page ? (int)$page : 1;
        $page = $page <= 0 ? 1 : $page;
        
        //获取用户列表
        $url = "https://api.weixin.qq.com/cgi-bin/user/get?access_token=$token&next_openid=".$next_openid;
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_HEADER, 0);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, FALSE);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
        $output = curl_exec($ch);
        curl_close($ch);
        $result = json_decode($output, true);
        if(!isset($result['errcode'])) {
            $total = $result['total'];
            $count = $result['count'];
            $next = $result['next_openid'];
            $data = $result['data']['openid'];
            if($data){
                $openids = '("' . join('"),("', $data) . '")';

                $sql = $dsql->SetQuery("INSERT INTO `#@__".$db."` (`openid`) VALUES ".$openids);
                $dsql->dsqlOper($sql, "update");
            }

            //如果当前页的数量为10000，说明还有下一页，继续查询下一页数据
            if($count == 10000){

                $tmsg = "<p class='text-success' style='text-align:center;'>共 ".$total." 个会员需要同步，已同步 ".($page * 10000)." 个，继续同步中，请稍候...</p>\r\n\r\n";
                $doneForm  = "<form name='gonext' method='post' action='wechatMember.php?action=syncAll'>\r\n";
                $doneForm .= "  <input type='hidden' name='step' value='1' /><input type='hidden' name='next_openid' value='".$next."' /><input type='hidden' name='page' value='".($page + 1)."' />\r\n</form>\r\n{$dojs}";
                PutInfo($tmsg,$doneForm);
                exit();

            }else{

                $tmsg = "<p class='text-success' style='text-align:center;'>同步成功，正在查询 ".$total." 个会员的关注情况，请稍候...</p>\r\n\r\n";
                $doneForm  = "<form name='gonext' method='post' action='wechatMember.php?action=syncAll'>\r\n";
                $doneForm .= "  <input type='hidden' name='step' value='2' />\r\n</form>\r\n{$dojs}";
                PutInfo($tmsg,$doneForm);
                exit();

            }


        }else{
            ShowMsg($result['errmsg'], 'wechatMember.php', 0, 3000);
            die;
        }

    }

    //第三步，根据本地数据库用户openid信息，批量查询用户关注公众号的情况
    if($step == 2){

        //每次查询200条，由于微信接口每次最多100条，我们一次性发送2个请求
        $pagestep = 200;
        $page = $page ? (int)$page : 1;
        $page = $page <= 0 ? 1 : $page;

        $archives = $dsql->SetQuery("SELECT count(*) totalCount FROM `#@__".$db."`");
        $totalCount = $dsql->dsqlOper($archives, "results");
        $totalCount = $totalCount[0]['totalCount'];

        $totalPage = ceil($totalCount/$pagestep);

        $atpage = $pagestep*($page-1);
        $where = " ORDER BY `id` ASC LIMIT $atpage, $pagestep";
        $archives = $dsql->SetQuery("SELECT `openid` FROM `#@__".$db."`".$where);
        $results = $dsql->dsqlOper($archives, "results");
        if($results){

            $openids = array();
            foreach($results as $key => $value){
                array_push($openids, array('openid' => $value['openid']));
            }

            if($openids){

                //100个一组
                $openidArr = array_chunk($openids, 100);

                //查询到的结果集
                $user_info_list = array();

                foreach($openidArr as $key => $value){

                    //要查询的openid
                    $postData = array(
                        'user_list' => $value
                    );

                    $url = "https://api.weixin.qq.com/cgi-bin/user/info/batchget?access_token=$token";
                    $ch = curl_init($url);
                    curl_setopt($ch, CURLOPT_HEADER, 0);
                    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
                    curl_setopt($ch, CURLOPT_POST, 1);
                    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($postData));
                    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, FALSE);
                    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
                    $output = curl_exec($ch);
                    curl_close($ch);
                    $result = json_decode($output, true);
                    if(!isset($result['errcode'])) {
                        
                        $info_list = $result['user_info_list'];

                        //合并多个请求的结果
                        $user_info_list = array_merge($user_info_list, $info_list);

                    }
                }

                //根据查询到的基本信息，更新数据库信息
                if($user_info_list){

                    foreach($user_info_list as $key => $value){
                        $openid = $value['openid'];
                        $subscribe = $value['subscribe'];  //是否关注
                        $subscribe_time = $value['subscribe_time'];  //关注时间
                        $unionid = $value['unionid'];  //暂未用到

                        //更新微信用户表
                        $sql = $dsql->SetQuery("UPDATE `#@__".$db."` SET `subscribe` = '$subscribe', `subscribe_time` = '$subscribe_time' WHERE `openid` = '$openid'");
                        $dsql->dsqlOper($sql, "update");

                        //更新会员表，老会员的公众号关注状态
                        $sql = $dsql->SetQuery("UPDATE `#@__member` SET `wechat_subscribe` = '$subscribe' WHERE `wechat_openid` = '$openid'");
                        $dsql->dsqlOper($sql, "update");

                    }

                }

            }

            //如果还有下一步，继续更新
            if($page < $totalPage){
                $tmsg = "<p class='text-success' style='text-align:center;'>共 ".$totalCount." 个会员的关注情况需要查询，已查询 ".($page * $pagestep)." 个，继续查询中(每次查询200个)，请稍候...</p>\r\n\r\n";
                $doneForm  = "<form name='gonext' method='post' action='wechatMember.php?action=syncAll'>\r\n";
                $doneForm .= "  <input type='hidden' name='step' value='2' /><input type='hidden' name='page' value='".($page + 1)."' />\r\n</form>\r\n{$dojs}";
                PutInfo($tmsg,$doneForm);
                exit();
            }


            //同步完成
            if($page == $totalPage || !$openids){
                adminLog("同步微信公众号用户");
                ShowMsg('同步完成！', 'wechatMember.php', 0, 3000);
                exit();
            }

        }else{
            ShowMsg('没有需要查询的信息，请确认后重试！', 'wechatMember.php', 0, 3000);
            die;
        }
    }

}

function PutInfo($msg1,$msg2){
	$htmlhead  = "<html>\r\n<head>\r\n<title>温馨提示</title>\r\n";
	$htmlhead .= "<meta http-equiv=\"Content-Type\" content=\"text/html; charset=".$GLOBALS['cfg_soft_lang']."\" />\r\n";
	$htmlhead .= "<link rel='stylesheet' rel='stylesheet' href='".HUONIAOADMIN."/../static/css/admin/bootstrap.css?v=4' />";
	$htmlhead .= "<link rel='stylesheet' rel='stylesheet' href='".HUONIAOADMIN."/../static/css/admin/common.css?v=1111' />";
    $htmlhead .= "<base target='_self'/>\r\n</head>\r\n<body>\r\n";
    $htmlfoot  = "</body>\r\n</html>";
	$rmsg  = "<div class='s-tip'><div class='s-tip-head'><h1>".$GLOBALS['cfg_soft_enname']." 提示：</h1></div>\r\n";
    $rmsg .= "<div class='s-tip-body' style='text-align:left;'>".str_replace("\"","“",$msg1)."\r\n".$msg2."\r\n";
    $msginfo = $htmlhead.$rmsg.$htmlfoot;
    echo $msginfo;
}

//获取会员列表
if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

	$where = "";    

    //是否注册
    if($sReg){
        //已注册
        if($sReg == 1){
            $where .= " AND (m.`mtype` = 1 OR m.`mtype` = 2) AND m.`id` IS NOT NULL";
        //未注册
        }elseif($sReg == 2){
            $where .= " AND ((m.`mtype` != 1 AND m.`mtype` != 2) OR m.`id` IS NULL)";
        }
    }

    //是否关注
    if($sSubscribe){
        //已关注
        if($sSubscribe == 1){
            $where .= " AND w.`subscribe` = 1";
        //未关注
        }elseif($sSubscribe == 2){
            $where .= " AND w.`subscribe` = 0";
        }
    }

	if($sKeyword != ""){
		$where .= " AND (m.`username` like '%$sKeyword%' OR m.`nickname` like '%$sKeyword%' OR w.`openid` like '%$sKeyword%')";
	}

	$archives = $dsql->SetQuery("SELECT w.`id` FROM `#@__".$db."` w LEFT JOIN `#@__member` m ON m.`wechat_openid` = w.`openid` WHERE 1 = 1");
	//总条数
	$totalCount = $dsql->dsqlOper($archives.$where . " GROUP BY w.`id`", "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);

	$where .= " GROUP BY w.`id` order by w.`id` desc";

	$atpage = $pagestep*($page-1);
	$where .= " LIMIT $atpage, $pagestep";
	$archives = $dsql->SetQuery("SELECT m.`id`, m.`mtype`, m.`username`, m.`nickname`, w.`openid`, w.`subscribe`, w.`subscribe_time` FROM `#@__".$db."` w LEFT JOIN `#@__member` m ON m.`wechat_openid` = w.`openid` WHERE 1 = 1".$where);
	$results = $dsql->dsqlOper($archives, "results");
    
	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[$key]["id"]         = $value['mtype'] == 1 || $value['mtype'] == 2 ? (int)$value["id"] : 0;
			$list[$key]["nickname"]   = $value['mtype'] == 1 || $value['mtype'] == 2 ? ($value["nickname"] ? $value['nickname'] : $value['username']) : '';
			$list[$key]["openid"]   = $value["openid"];
			$list[$key]["subscribe"]   = (int)$value["subscribe"];
			$list[$key]["subscribe_time"]   = $value["subscribe_time"] ? date("Y-m-d H:i:s", $value["subscribe_time"]) : '';
		}
		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}, "memberList": '.json_encode($list).'}';
		}else{
			echo '{"state": 101, "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}, "info": '.json_encode("暂无相关信息").'}';
		}
	}else{
		echo '{"state": 101, "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}, "info": '.json_encode("暂无相关信息").'}';
	}
	die;

}

//验证模板文件
if(file_exists($tpl."/".$templates)){

    
    //css
    $cssFile = array(
        'ui/jquery.chosen.css',
        'admin/chosen.min.css'
    );
    $huoniaoTag->assign('cssFile', includeFile('css', $cssFile));

    //js
    $jsFile = array(
        'ui/bootstrap.min.js',
        'ui/bootstrap-datetimepicker.min.js',
        'ui/jquery-ui-selectable.js',
        'ui/chosen.jquery.min.js',
        'admin/wechat/wechatMember.js'
    );
    $huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/wechat";  //设置编译目录
	$huoniaoTag->display($templates);

}else{
	echo $templates."模板文件未找到！";
}
