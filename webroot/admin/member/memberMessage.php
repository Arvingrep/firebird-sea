<?php
/**
 * 个人会员留言板内容管理
 *
 * @version        $Id: memberMessage.php 2023-2-15 上午11:02:18 $
 * @package        HuoNiao.Member
 * @copyright      Copyright (c) 2013, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("memberMessage");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/member";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "memberMessage.html";


global $handler;
$handler = true;

$action = "member_message";

//删除留言
if($dopost == "delMessage"){
	if($id == "") die;

    $archives = $dsql->SetQuery("DELETE FROM `#@__".$action."` WHERE `id` in (".$id.")");
    $results = $dsql->dsqlOper($archives, "update");

    adminLog("删除会员留言", $id);
    echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
	die;

//获取评论列表
}else if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

	$where = "";

	if($sKeyword != ""){

        $sType = (int)$sType;

		//按评论内容搜索
		if($sType == 0){
			$where .= " AND `content` like '%$sKeyword%'";

		//按留言人ID
		}elseif($sType == 1){
			$sKeyword = (int)$sKeyword;
            $where .= " AND `uid` = $sKeyword";

        //按被留言人ID
        }elseif($sType == 2){
            $sKeyword = (int)$sKeyword;
            $where .= " AND `tid` = $sKeyword";

		//按IP搜索
		}elseif($sType == 3){
			$where .= " AND `ip` like '%$sKeyword%'";
		}
	}

	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__".$action."`");

	//总条数
	$totalCount = $dsql->dsqlOper($archives." WHERE 1 = 1".$where, "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);
	$where .= " order by `id` desc";

	$atpage = $pagestep*($page-1);
	$where .= " LIMIT $atpage, $pagestep";
	$archives = $dsql->SetQuery("SELECT `id`, `tid`, `uid`, `content`, `date`, `ip`, `ipaddr` FROM `#@__".$action."` WHERE 1 = 1".$where);
	$results = $dsql->dsqlOper($archives, "results");

	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[$key]["id"] = $value["id"];

			$list[$key]["tid"] = $value["tid"];
			$tname = '会员不存在';
            $member = $dsql->SetQuery("SELECT `username`, `nickname` FROM `#@__member` WHERE `id` = ".$value["tid"]);
			$username = $dsql->dsqlOper($member, "results");
            if($username){
                $tname = $username[0]['nickname'] ? $username[0]['nickname'] : $username[0]['username'];
            }
			$list[$key]["tname"]  = $tname;

            $list[$key]["uid"] = $value["uid"];
			$uname = '会员不存在';
            $member = $dsql->SetQuery("SELECT `username`, `nickname` FROM `#@__member` WHERE `id` = ".$value["uid"]);
			$username = $dsql->dsqlOper($member, "results");
            if($username){
                $uname = $username[0]['nickname'] ? $username[0]['nickname'] : $username[0]['username'];
            }
			$list[$key]["uname"]  = $uname;

			$list[$key]["content"] = strip_tags($value["content"]);
			$list[$key]["date"] = date('Y-m-d H:i:s', $value["date"]);
			$list[$key]["ip"] = $value["ip"];
			$list[$key]["ipAddr"] = $value["ipaddr"];
		}
		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}, "messageList": '.json_encode($list).'}';
		}else{
			echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}}';
		}
	}else{
		echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}}';
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
		'ui/jquery-ui-selectable.js',
		'ui/chosen.jquery.min.js',
		'admin/member/memberMessage.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/member";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
