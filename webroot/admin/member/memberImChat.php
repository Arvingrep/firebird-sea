<?php
/**
 * 用户Im聊天记录
 *
 * @version        $Id: memberImChat.php 2015-11-11 上午09:37:12 $
 * @package        HuoNiao.Member
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("memberImChat");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/member";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "memberImChat.html";

//获取最近聊天列表
if($dopost == "getRecentlyList"){
	$where = "`id` > 0";

	//查询用户ID
	$userid1 = (int)$userid1;
	$userid2 = (int)$userid2;

	if ($userid1 != null && $userid2 != null) {
		//精确搜索两个用户的聊天
		$where .= ' AND ((`fid` = '.$userid1.' AND `tid` = '.$userid2.') OR (`fid` = '.$userid2.' AND `tid` = '.$userid1.'))';
	} else {
		//搜索单个用户的聊天列表
		$searchUserid = 0;
		if ($userid1 != null) {
			$searchUserid = $userid1;
		} elseif ($userid2 != null) {
			$searchUserid = $userid2;
		}

		if ($searchUserid != null) {
			$where .= ' AND (`fid` = '.$searchUserid.' OR `tid` = '.$searchUserid.')';
		}
	}

	//是否好友
	$isfriend = (int)$isfriend;
	if ($isfriend != -1) {
		$where .= " AND `state` = ".$isfriend;
	}

	//是否临时会话
	$istemp = (int)$istemp;
	if ($istemp != -1) {
		$where .= " AND `temp` = ".$istemp;
	}

	//最后聊天时间范围
	$chatStart = trim($chatStart);
	if ($chatStart != null) {
		$start = GetMkTime(date($chatStart." 00:00:00"));
		$where .= " AND `updatetime` >= ".$start;
	}
	$chatEnd = trim($chatEnd);
	if ($chatEnd != null) {
		$end = GetMkTime(date($chatEnd." 23:59:59"));
		$where .= " AND `updatetime` <= ".$end;
	}

	//添加好友时间范围
	$addStart = trim($addStart);
	if ($addStart != null) {
		$start = GetMkTime(date($addStart." 00:00:00"));
		$where .= " AND `date` >= ".$start;
	}
	$addEnd = trim($addEnd);
	if ($addEnd != null) {
		$end = GetMkTime(date($addEnd." 23:59:59"));
		$where .= " AND `date` <= ".$end;
	}

	//分页信息
	$page = (int)$page;
	$pagestep = (int)$pagestep;

	//初始化当前页码
	if ($page == 0) {
		$page = 1;
	}

	//初始化每页条数
	if ($pagestep == 0) {
		$pagestep = 10;
	}

	//总条数
	$sql = $dsql->SetQuery("SELECT count(`id`) totalCount FROM `#@__member_friend` WHERE ".$where);
	$totalCount = (int)$dsql->getOne($sql);
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);

	$pageInfo = array(
		"page"       => $page,
		"pageSize"   => $pagestep,
		"totalPage"  => $totalPage,
		"totalCount" => $totalCount,
	);

	//计算游标
	$atpage = $pagestep*($page-1);
	$limit = " LIMIT $atpage, $pagestep";

	//排序，0:默认按最后聊天时间排序 1:按添加好友时间排序
	$sort = (int)$sort;
	if ($sort == 1) {
		$order = " ORDER BY `date` DESC";
	} else {
		$order = " ORDER BY `updatetime` DESC";
	}

	//查询列表
	$sql = $dsql->SetQuery("SELECT * FROM `#@__member_friend` WHERE ".$where.$order.$limit);
    $results = $dsql->dsqlOper($sql, "results");
	$list = array();
	if($results != null && is_array($results)){
		foreach ($results as $key => $value) {
			$list[$key]["id"] = (int)$value["id"]; //ID

			//用户信息
			$list[$key]["fid"] = (int)$value["fid"];
			$list[$key]["fname"] = '未知';
			$list[$key]["fphoto"] = '';
			$sql = $dsql->SetQuery("SELECT `nickname`, `username`, `photo` FROM `#@__member` WHERE `id` = ".$list[$key]["fid"]);
            $userinfo = $dsql->dsqlOper($sql, "results");
            if ($userinfo != null && is_array($userinfo)) {
                $list[$key]["fname"] = $userinfo[0]['nickname'] ? $userinfo[0]['nickname'] : $userinfo[0]['username'];
				$list[$key]["fphoto"] = $userinfo[0]['photo'] ? (strstr($userinfo[0]['photo'], 'http') ? $userinfo[0]['photo'] : getFilePath($userinfo[0]['photo'])) : getAttachemntFile('/static/images/noPhoto_100.jpg');
            }

			$list[$key]["tid"] = (int)$value["tid"];
			$list[$key]["tname"] = '未知';
			$list[$key]["tphoto"] = '';
			$sql = $dsql->SetQuery("SELECT `nickname`, `username`, `photo` FROM `#@__member` WHERE `id` = ".$list[$key]["tid"]);
            $userinfo = $dsql->dsqlOper($sql, "results");
            if ($userinfo != null && is_array($userinfo)) {
                $list[$key]["tname"] = $userinfo[0]['nickname'] ? $userinfo[0]['nickname'] : $userinfo[0]['username'];
				$list[$key]["tphoto"] = $userinfo[0]['photo'] ? (strstr($userinfo[0]['photo'], 'http') ? $userinfo[0]['photo'] : getFilePath($userinfo[0]['photo'])) : getAttachemntFile('/static/images/noPhoto_100.jpg');
            }

			$list[$key]["state"] = (int)$value["state"]; //是否添加好友 0:否 1:是
			$list[$key]["date"] = (int)$value["date"]; //添加好友时间
			$list[$key]["dateStr"] = ''; //添加好友时间格式化
			if ($list[$key]["date"] != null) {
				$list[$key]["dateStr"] = date('Y-m-d H:i:s', $list[$key]["date"]);
			}
			$list[$key]["delfrom"] = (int)$value["delfrom"]; //添加方删除(隐藏)
			$list[$key]["delto"] = (int)$value["delto"]; //被添加方删除(隐藏)

			$list[$key]["temp"] = (int)$value["temp"]; //是否临时会话 0:否 1:是
			$list[$key]["tempdelfrom"] = (int)$value["tempdelfrom"]; //添加方删除(隐藏)
			$list[$key]["tempdelto"] = (int)$value["tempdelto"]; //被添加方删除(隐藏)

			$list[$key]["updatetime"] = (int)$value["updatetime"]; //最后聊天时间
			$list[$key]["updatetimeStr"] = ''; //最后聊天时间格式化
			if ($list[$key]["updatetime"] != null) {
				$list[$key]["updatetimeStr"] = date('Y-m-d H:i:s', $list[$key]["updatetime"]);
			}
		}
	}

	if(count($list) > 0){
		output('获取成功', 0, array('list' => $list, 'pageInfo' => $pageInfo));
	}else{
		output('暂无相关信息');
	}

//获取单个聊天记录详情
}elseif($dopost == "getChatInfo"){
	//查询用户ID
	$userid1 = (int)$userid1;
	$userid2 = (int)$userid2;

	//聊天好友表ID
	$chatId = (int)$chatId;
	if($chatId != null){
		//查询聊天双方ID
		$sql = $dsql->SetQuery("SELECT `id`, `fid`, `tid` FROM `#@__member_friend` WHERE `id` = ".$chatId);
		$ret = $dsql->dsqlOper($sql, "results");
        if ($ret != null && is_array($ret)) {
			$userid1 = (int)$ret[0]['fid'];
			$userid2 = (int)$ret[0]['tid'];
		}
	}

	if ($userid1 == null || $userid2 == null) {
		output('聊天双方用户ID不能为空');
	}

	$where = '((`fid` = '.$userid1.' AND `tid` = '.$userid2.') OR (`fid` = '.$userid2.' AND `tid` = '.$userid1.'))';

	//是否已读
	$isread = (int)$isread;
	if ($isread != -1) {
		$where .= " AND `isread` = ".$isread;
	}

	//消息类型
	$type = trim($type);
	if ($type != null) {
		$where .= " AND `type` = '".$type."'";
	}

	//聊天内容
	$content = trim($content);
	if ($content != null) {
		$where .= " AND `content` LIKE '%".$content."%'";
	}

	//聊天时间范围
	$chatStart = trim($chatStart);
	if ($chatStart != null) {
		$start = GetMkTime(date($chatStart." 00:00:00"));
		$where .= " AND `time` >= ".$start;
	}
	$chatEnd = trim($chatEnd);
	if ($chatEnd != null) {
		$end = GetMkTime(date($chatEnd." 23:59:59"));
		$where .= " AND `time` <= ".$end;
	}

	//分页信息
	$page = (int)$page;
	$pagestep = (int)$pagestep;

	//初始化当前页码
	if ($page == 0) {
		$page = 1;
	}

	//初始化每页条数
	if ($pagestep == 0) {
		$pagestep = 10;
	}

	$tableIndex = ($userid1 + $userid2)%10; //分表序号
	$table = 'member_chat_history_'.$tableIndex; //分表名

	//总条数
	$sql = $dsql->SetQuery("SELECT count(`id`) totalCount FROM `#@__".$table."` WHERE ".$where);
	$totalCount = (int)$dsql->getOne($sql);
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);

	$pageInfo = array(
		"page"       => $page,
		"pageSize"   => $pagestep,
		"totalPage"  => $totalPage,
		"totalCount" => $totalCount,
	);

	//计算游标
	$atpage = $pagestep*($page-1);
	$limit = " LIMIT $atpage, $pagestep";

	//排序，默认聊天时间排序
	$order = " ORDER BY `time` DESC";

	//查询列表
	$sql = $dsql->SetQuery("SELECT * FROM `#@__".$table."` WHERE ".$where.$order.$limit);
    $results = $dsql->dsqlOper($sql, "results");
	$list = array();
	if($results != null && is_array($results)){

		//用户信息
		$userInfo = array();
		$sql = $dsql->SetQuery("SELECT `id`, `nickname`, `username`, `photo` FROM `#@__member` WHERE `id` IN (".$userid1.",".$userid2.")");
		$ret = $dsql->dsqlOper($sql, "results");
		if ($ret != null && is_array($ret)) {
			foreach ($ret as $key => $value) {
				$name = $value['nickname'] ? $value['nickname'] : $value['username'];
				$photo = $value['photo'] ? (strstr($value['photo'], 'http') ? $value['photo'] : getFilePath($value['photo'])) : getAttachemntFile('/static/images/noPhoto_100.jpg');
				$userInfo[$value['id']] = array(
					'name' => $name,
					'photo' => $photo,
				);
			}
		}

		foreach ($results as $key => $value) {
			$list[$key]["id"] = (int)$value["id"]; //ID

			//用户信息
			$list[$key]["fid"] = (int)$value["fid"];
			$list[$key]["fname"] = '未知';
			$list[$key]["fphoto"] = '';
            if (isset($userInfo[$list[$key]["fid"]])) {
                $list[$key]["fname"] = $userInfo[$list[$key]["fid"]]['name'];
				$list[$key]["fphoto"] = $userInfo[$list[$key]["fid"]]['photo'];
            }

			$list[$key]["tid"] = (int)$value["tid"];
			$list[$key]["tname"] = '未知';
			$list[$key]["tphoto"] = '';
			if (isset($userInfo[$list[$key]["tid"]])) {
                $list[$key]["tname"] = $userInfo[$list[$key]["tid"]]['name'];
				$list[$key]["tphoto"] = $userInfo[$list[$key]["tid"]]['photo'];
            }

			$list[$key]["isread"] = (int)$value["isread"]; //是否已读 0:否 1:是

			$list[$key]["time"] = (int)$value["time"]; //发送时间
			$list[$key]["timeStr"] = ''; //发送时间格式化
			if ($list[$key]["time"] != null) {
				$list[$key]["timeStr"] = date('Y-m-d H:i:s', $list[$key]["time"]);
			}

			$list[$key]["type"] = $value['type']; //消息类型
			$list[$key]["content"] = $value['content']; //消息内容
			//不是文本和apply类型就进行解码操作
			if ($value['type'] != 'text' && $value['type'] != 'apply') {
				$list[$key]["content"] = json_decode($value['content'], true);
			}
		}
	}

	if(count($list) > 0){
		output('获取成功', 0, array('list' => $list, 'pageInfo' => $pageInfo));
	}else{
		output('暂无相关信息');
	}
}

//验证模板文件
if(file_exists($tpl."/".$templates)){

	//css
	$cssFile = array(
	  'ui/jquery.chosen.css',
	  'admin/chosen.min.css',
	  'admin/memberImChat.css'
	);
	$huoniaoTag->assign('cssFile', includeFile('css', $cssFile));

	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'ui/bootstrap-datetimepicker.min.js',
		'ui/chosen.jquery.min.js',
		'admin/member/memberImChat.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/member";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
