<?php 
if(!defined('HUONIAOINC')) exit('Request Error!');

//加载招聘的配置
require_once HUONIAOROOT."/api/handlers/zhaopin.config.php";

/**
 *
 * 每分钟执行的计划任务
 * 1. 企业会员是否到期
 * 2. 简历推荐是否到期
 * 3. 职位普通推荐+超级推荐职位是否到期
 * 4. 职位智能推荐 包含免费刷新和付费刷新逻辑
 * 
 */
 /**
  * 企业会员到期处理
  */
$now = GetMkTime(time());
//会员过期置为1，部分字段重置为零

$default = array(); //默认配置
$cityids = array(); //有配置的分站ID合集

//查询出所有分站的配置
$sql = $dsql->SetQuery("SELECT `id`, `cityid`, `totalPublishCount_user`, `dayPublishCount_user`, `normalRefreshCount_user`, `resumePackagePoint_user`, `smsCount_user` FROM `#@__zhaopin_config`");
$results = $dsql->dsqlOper($sql, "results");

//循环每个分站的配置，记录下默认配置和已经执行过的分站
if ($results != null && is_array($results)) {
	foreach ($results as $item) {
		$cityid = (int)$item['cityid'];

		//如果cityid为0，就记录下来
		if ($cityid == 0) {
			$default = $item;
			continue;
		}

		//保存每次循环的cityid
		$cityids[] = $cityid;

		$configInfo = $item;

		$totalPublishCount_user = (int)$configInfo['totalPublishCount_user']; //发布总数_普通用户
		$dayPublishCount_user = (int)$configInfo['dayPublishCount_user']; //每日发布信息条数_普通用户
		$normalRefreshCount_user = (int)$configInfo['normalRefreshCount_user']; //免费手动刷新信息次数_普通用户

		$where = " AND `cityid` = ".$cityid;

		$sql = $dsql->SetQuery("UPDATE `#@__zhaopin_company` SET `levelExpired` = 1, `account_smartRefreshCount` = 0, `account_resumePackagePoint` = 0, `account_balancePackage` = 0, `account_totalPublishCount` = ".$totalPublishCount_user.", `account_dayPublishCount` = ".$dayPublishCount_user.", `account_normalRefreshCount` = ".$normalRefreshCount_user.", `status` = 7, `time_lastFollow` = ".$now.", `lastFollowInfo` = '会员已过期，会员状态修改为：会员到期未续费', `send_levelExpired` = 1  WHERE `levelExpired` = 0 AND `levelType` != 0 AND `time_levelEnd` <= $now".$where);
		$dsql->dsqlOper($sql, "update");
	}
}

//根据默认配置，把其他分站的逻辑再执行一面
if ($default != null) {
	//如果有已经执行的分站ID，则筛选没有执行的分站ID，否则就执行全部的分站
	$where = '';
	if ($cityids != null) {
		$where = " AND `cityid` NOT IN (".join(', ', $cityids).")";
	}

	$configInfo = $default;

	$totalPublishCount_user = (int)$configInfo['totalPublishCount_user']; //发布总数_普通用户
	$dayPublishCount_user = (int)$configInfo['dayPublishCount_user']; //每日发布信息条数_普通用户
	$normalRefreshCount_user = (int)$configInfo['normalRefreshCount_user']; //免费手动刷新信息次数_普通用户

	$sql = $dsql->SetQuery("UPDATE `#@__zhaopin_company` SET `levelExpired` = 1, `account_smartRefreshCount` = 0, `account_resumePackagePoint` = 0, `account_balancePackage` = 0, `account_totalPublishCount` = ".$totalPublishCount_user.", `account_dayPublishCount` = ".$dayPublishCount_user.", `account_normalRefreshCount` = ".$normalRefreshCount_user.", `status` = 7, `time_lastFollow` = ".$now.", `lastFollowInfo` = '会员已过期，会员状态修改为：会员到期未续费', `send_levelExpired` = 1  WHERE `levelExpired` = 0 AND `levelType` != 0 AND `time_levelEnd` <= $now".$where);
	$dsql->dsqlOper($sql, "update");
}

/**
 * 推荐简历到期处理
 */
$sql = $dsql->SetQuery("UPDATE `#@__zhaopin_resume` SET `rec_status` = 2, `send_recExpired` = 1 WHERE `rec_status` = 1 AND `time_recExpire` <= $now");
$dsql->dsqlOper($sql, "update");

/**
 * 检测[普通推荐+超级推荐]的职位到期处理
 */
$sql = $dsql->SetQuery("UPDATE `#@__zhaopin_post` SET `rec_status` = 2, `send_recExpired` = 1 WHERE `rec_type` != 0 AND `rec_status` = 1 AND `time_recExpire` <= {$now}");

$dsql->dsqlOper($sql, "update");


/**
 * 职位智能刷新 包含免费刷新和付费刷新逻辑
 */
$today = GetMkTime(date('Y-m-d'));
$sql = $dsql->SetQuery("SELECT `id`, `cid`, `cityid`, `userid`, `time_update`, `smartRefresh_free`, `smartRefresh_numBuy`, `smartRefresh_nextTime`, `smartRefresh_lastTime`, `smartRefresh_frequency` FROM `#@__zhaopin_post` where `smartRefresh_status` = 1 AND `smartRefresh_numBuy` > 0 AND `smartRefresh_nextTime` <= $now"); //设置了自动刷新并且有刷新次数
$ret = $dsql->dsqlOper($sql, "results");
if($ret){
	foreach ($ret as $key => $value) {
		if($value['smartRefresh_free']){ //免费智能刷新
			//企业智能刷新额度
			$sql = $dsql->SetQuery("SELECT `account_smartRefreshCount`, `levelType` FROM `#@__zhaopin_company` WHERE `id` = {$value['cid']}");
			$company = $dsql->dsqlOper($sql, "results");
			if(!$company) continue;
			$company = $company[0];
			$levelType = $company['levelType'];
			$smartRefreshTotal = (int)$company['account_smartRefreshCount'];
			if($levelType == 0){//免费用户为入驻时首次赠送
				//免费用户扣除赠送的智能刷新次数
				$sql = $dsql->SetQuery("UPDATE `#@__zhaopin_company` SET  `account_smartRefreshCount` = account_smartRefreshCount -1 WHERE `id` = {$value['cid']} AND `account_smartRefreshCount` > 0");
				$dsql->dsqlOper($sql, "update");

				//已使用的刷新数量
				//2026-01-27 日志开始执行6月以上内容清理操作，这里是企业入驻首次赠送的智能手动刷新额度,理论上6个月怎么也会用完了，如果发现企业卡6个月后免费刷新职位的问题。
				// 可取消该企业职位可用免费智能刷新额度的能力，且该职位后面只能付费才能进行智能刷新了 
				// UPDATE `huoniao_zhaopin_post` SET `smartRefresh_status`=0, `smartRefresh_free`=0 where `cid`=xxx;  xxx-为具体的招聘企业id

				$sql = $dsql->SetQuery("SELECT count(`id`) FROM `#@__zhaopin_service_log` WHERE `type` = 6 AND `cid` = {$value['cid']}"); 
				$total = $dsql->getOne($sql);
				$refreshTotal = $total ? (int)$total : 0;
				if($refreshTotal >= $smartRefreshTotal){
					$sql = $dsql->SetQuery("UPDATE `#@__zhaopin_post` SET `smartRefresh_status` = 0 WHERE `id` = {$value['id']}");
					$dsql->dsqlOper($sql, "update");
					continue;
				}
				//设置为智能刷新时用的频率
				$nextTime = $now + ($value['smartRefresh_frequency'] * 3600);
			} else { 
				//会员中的为每日赠送
				//已使用的刷新数量
				$sql = $dsql->SetQuery("SELECT count(`id`) FROM `#@__zhaopin_service_log` WHERE `addtime` >= $today AND `type` = 6 AND `cid` = {$value['cid']}"); 
				$total = $dsql->getOne($sql);
				$refreshTotal = $total ? (int)$total : 0;
				if($refreshTotal >= $smartRefreshTotal){
					$sql = $dsql->SetQuery("UPDATE `#@__zhaopin_post` SET `smartRefresh_status` = 0 WHERE `id` = {$value['id']}");
					$dsql->dsqlOper($sql, "update");
					continue;
				}

				//当天职位是否刷新过
				// $sql = $dsql->SetQuery("SELECT count(`id`) FROM `#@__zhaopin_service_log` WHERE `addtime` >= $today AND `type` = 6 AND `cid` = {$value['cid']} AND `paramid` = {$value['id']}"); 
				// $total = $dsql->getOne($sql);
				// $logTotal = $total ? (int)$total : 0;
				// if($logTotal){
				// 	continue;
				// }
				//第二天
				// $nextTime = $now + 86400;
				$nextTime = $now + ($value['smartRefresh_frequency'] * 3600);
			}

			//更新时间
			$sql = $dsql->SetQuery("UPDATE `#@__zhaopin_post` SET  `time_update` = $now, `smartRefresh_lastTime` = $now, `smartRefresh_nextTime` = $nextTime WHERE `id` = {$value['id']}");
			$dsql->dsqlOper($sql, "update");

			//增加智能刷新记录
			$data = array('type'=>6, 'cid'=>(int)$value['cid'], 'userid' =>(int)$value['userid'], 'addtime'=>$now, 'expireTime'=>0, 'paramid'=>$value['id'], 'num'=>1, 'sort'=>0, 'cityid'=>$value['cityid'] );
			zhaopinServiceLog($data);

		} else {
			//付费购买的智能刷新
			$nextTime = $now + ($value['smartRefresh_frequency'] * 3600);

			//如果智能刷新次数本次用完，就增加消息通知发送状态
			$sendField = '';
			if ($value['smartRefresh_numBuy'] == 1) {
				$sendField = ', `send_smartRefreshEnd` = 1';
			}

			//更新次数，时间
			$sql = $dsql->SetQuery("UPDATE `#@__zhaopin_post` SET `smartRefresh_numBuy` = smartRefresh_numBuy - 1, `smartRefresh_lastTime` = $now, `smartRefresh_nextTime` = $nextTime, `time_update` = $now".$sendField." WHERE `id` = {$value['id']} AND `smartRefresh_numBuy` > 0");
			$dsql->dsqlOper($sql, "update");

			//增加智能刷新记录
			$data = array('type'=>6, 'cid'=>(int)$value['cid'], 'userid'=>(int)$value['userid'], 'addtime'=>$now, 'expireTime'=>0, 'paramid'=>$value['id'], 'num'=>1, 'sort'=>1, 'cityid'=>$value['cityid'] );
			zhaopinServiceLog($data);
		}
	}
}

/**
 * 面试邀请到期处理
 */
$sql = $dsql->SetQuery("UPDATE `#@__zhaopin_interview_log` SET `status` = 3 WHERE `status` < 3 AND `interviewTime` <= $now");
$dsql->dsqlOper($sql, "update");


/**
 * 职位推荐到期发送消息通知
 */
//查询待发送消息通知的职位记录
$sql = $dsql->SetQuery("SELECT `id`,`userid`,`title`,`rec_type`,`rec_sort`,`cityid`,`cid`,`time_recExpire`,`company` FROM `#@__zhaopin_post` WHERE `send_recExpired` = 1 ORDER BY `id` ASC");
$sendPosts = $dsql->dsqlOper($sql,"results");

if($sendPosts != null && is_array($sendPosts)){
    foreach ($sendPosts as $v){
		//先更新通知状态
        $sql = $dsql->SetQuery("UPDATE `#@__zhaopin_post` SET `send_recExpired` = 0 WHERE `id` = ".$v['id']);
        $dsql->dsqlOper($sql, "update");

		//增加一条职位推荐到期的系统通知
		//推荐类型
		$ordertype = 3;
		$param = '';
		$recommendtype = '普通';
		$recommend = '普通推荐';
		if ($v['rec_type'] == 2) {
			$ordertype = 4;
			$param = json_encode(array('rec_sort' => $v['rec_sort']));
			$recommendtype = '超级';
			$recommend = '超级推荐（第'.$v['rec_sort'].'位）';
		}

		//生成消息通知模板
		$notice = array();
		$noticeTemplate = $zhaopin_system_noticeTemplate[3][$ordertype];
		$notice['title'] = $noticeTemplate['title']; //通知标题
		$moban = $noticeTemplate['moban']; //通知模板名称
		if ($ordertype == 3) {
			$notice['content'] = sprintf($noticeTemplate['content'],$v['title'],date("Y-m-d H:i:s",$v['time_recExpire'])); //生成消息通知的完整内容

			//如果有模板名称，就去查询对应的系统消息配置
			if ($moban != null) {
				$sql = $dsql->SetQuery("SELECT `site_title`,`site_body` FROM `#@__site_notify` WHERE `title` = '".$moban."'");
				$ret = $dsql->dsqlOper($sql, "results");
				if ($ret != null && is_array($ret)) {
					//如果系统消息配置有网页消息标题，则消息通知应用此标题
					$siteTitle = $ret[0]['site_title'];
					if ($siteTitle != null) {
						//替换标题中对应的变量
						$notice['title'] = str_replace(array('$recommendtype'), array($recommendtype), $siteTitle);
					}

					//如果系统消息配置有网页消息模板，则消息通知应用此模板
					$siteMoban = $ret[0]['site_body'];
					if ($siteMoban != null) {
						//替换模板中对应的变量
						$notice['content'] = str_replace(array('$postname','$recommend','$enddate'), array($v['title'],$recommend,date("Y-m-d H:i:s",$v['time_recExpire']),$title), $siteMoban);
					}
				}
			}
		} else {
			$notice['content'] = sprintf($noticeTemplate['content'],$v['title'],'第'.$v['rec_sort'].'位',date("Y-m-d H:i:s",$v['time_recExpire'])); //生成消息通知的完整内容

			//如果有模板名称，就去查询对应的系统消息配置
			if ($moban != null) {
				$sql = $dsql->SetQuery("SELECT `site_title`,`site_body` FROM `#@__site_notify` WHERE `title` = '".$moban."'");
				$ret = $dsql->dsqlOper($sql, "results");
				if ($ret != null && is_array($ret)) {
					//如果系统消息配置有网页消息标题，则消息通知应用此标题
					$siteTitle = $ret[0]['site_title'];
					if ($siteTitle != null) {
						//替换标题中对应的变量
						$notice['title'] = str_replace(array('$recommendtype'), array($recommendtype), $siteTitle);
					}

					//如果系统消息配置有网页消息模板，则消息通知应用此模板
					$siteMoban = $ret[0]['site_body'];
					if ($siteMoban != null) {
						//替换模板中对应的变量
						$notice['content'] = str_replace(array('$postname','$recommend','$enddate'), array($v['title'],$recommend,date("Y-m-d H:i:s",$v['time_recExpire']),$title), $siteMoban);
					}
				}
			}
		}

		$sql = $dsql->SetQuery("INSERT INTO `#@__zhaopin_system_notice` (`cityid`, `userid`, `type`, `ordertype`, `postid`, `companyid`, `resumeid`, `orderid`, `addtime`, `param`, `content`, `title`) VALUES ('".$v['cityid']."', '".$v['userid']."', '3', '".$ordertype."', '".$v['id']."', '".$v['cid']."', '0', '0', '".$now."', '".$param."', '".$notice['content']."', '".$notice['title']."')");
		$logId = $dsql->dsqlOper($sql, "lastid");

		//如果有模板名称，则发送消息通知
		if ($moban != null) {
			//职位详情链接
			$param = array(
				"service"  => "zhaopin",
				"template" => "postDetail",
				"id" => $v['id']
			);

			//查询会员昵称
			$username = '';
			$sql = $dsql->SetQuery("SELECT `nickname`, `username` FROM `#@__member` WHERE `id` = ".$v['userid']);
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret != null && is_array($ret)){
				$username = $ret[0]['nickname'] ? $ret[0]['nickname'] : $ret[0]['username'];
			}

			//网站名称
			global $cfg_webname;
			global $siteCityName;
			$webname = str_replace('$city', $siteCityName, stripslashes($cfg_webname));

			//自定义配置
			$config = array(
				"webname" => $webname,
				"username" => $username,
				"postname" => $v['title'],
				"companyname" => $v['company'],
				"recommendtype" => $recommendtype,
				"recommend" => $recommend,
				"enddate" => date("Y-m-d H:i:s",$v['time_recExpire']),
				"time" => date("Y-m-d H:i:s",GetMkTime(time())),
				"url" => getUrlPath($param),
				"fields" => array(
					'keyword1' => '职位名称',
					'keyword2' => '企业名称',
					'keyword3' => '推荐类型',
					'keyword4' => '到期时间'
				)
			);

			//后发通知，防止出现重复发送的问题
			updateMemberNotice($v['userid'], $moban, $param, $config);
		}
    }
}

/**
 * 简历推荐到期发送消息通知
 */
//查询待发送消息通知的简历记录
$sql = $dsql->SetQuery("SELECT `id`,`userid`,`name`,`cityid`,`time_recExpire` FROM `#@__zhaopin_resume` WHERE `send_recExpired` = 1 ORDER BY `id` ASC");
$sendResumes = $dsql->dsqlOper($sql,"results");

if($sendResumes != null && is_array($sendResumes)){
    foreach ($sendResumes as $v){
		//先更新通知状态
        $sql = $dsql->SetQuery("UPDATE `#@__zhaopin_resume` SET `send_recExpired` = 0 WHERE `id` = ".$v['id']);
        $dsql->dsqlOper($sql, "update");

		//增加一条简历推荐到期的系统通知

		//生成消息通知模板
		$notice = array();
		$noticeTemplate = $zhaopin_system_noticeTemplate[3][6];
		$notice['title'] = $noticeTemplate['title']; //通知标题
		$moban = $noticeTemplate['moban']; //通知模板名称
		$notice['content'] = sprintf($noticeTemplate['content'],$v['name'],date("Y-m-d H:i:s",$v['time_recExpire'])); //生成消息通知的完整内容

		//如果有模板名称，就去查询对应的系统消息配置
		if ($moban != null) {
			$sql = $dsql->SetQuery("SELECT `site_title`,`site_body` FROM `#@__site_notify` WHERE `title` = '".$moban."'");
			$ret = $dsql->dsqlOper($sql, "results");
			if ($ret != null && is_array($ret)) {
				//如果系统消息配置有网页消息标题，则消息通知应用此标题
				$siteTitle = $ret[0]['site_title'];
				if ($siteTitle != null) {
					$notice['title'] = $siteTitle;
				}

				//如果系统消息配置有网页消息模板，则消息通知应用此模板
				$siteMoban = $ret[0]['site_body'];
				if ($siteMoban != null) {
					//替换模板中对应的变量
					$notice['content'] = str_replace(array('$resumename','$enddate'), array($v['name'],date("Y-m-d H:i:s",$v['time_recExpire'])), $siteMoban);
				}
			}
		}


		$noticeTemplate = $zhaopin_system_noticeTemplate[3][6]['content'];
		$content = sprintf($noticeTemplate,$v['name'],date("Y-m-d H:i:s",$v['time_recExpire']));

		$sql = $dsql->SetQuery("INSERT INTO `#@__zhaopin_system_notice` (`cityid`, `userid`, `type`, `ordertype`, `postid`, `companyid`, `resumeid`, `orderid`, `addtime`, `content`, `title`) VALUES ('".$v['cityid']."', '".$v['userid']."', '3', '6', '0', '0', '".$v['id']."', '0', '".$now."', '".$notice['content']."', '".$notice['title']."')");
		$logId = $dsql->dsqlOper($sql, "lastid");

		//如果有模板名称，则发送消息通知
		if ($moban != null) {
			//跳转至求职者的个人中心
			$param = array(
				"service"  => "zhaopin",
				"template" => "u_center",
				"param" => "user_type=1",
				"id" => $v['id'] //带上简历id，方便查询分站
			);

			//查询会员昵称
			$username = '';
			$sql = $dsql->SetQuery("SELECT `nickname`, `username` FROM `#@__member` WHERE `id` = ".$v['userid']);
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret != null && is_array($ret)){
				$username = $ret[0]['nickname'] ? $ret[0]['nickname'] : $ret[0]['username'];
			}

			//网站名称
			global $cfg_webname;
			global $siteCityName;
			$webname = str_replace('$city', $siteCityName, stripslashes($cfg_webname));

			//自定义配置
			$config = array(
				"webname" => $webname,
				"username" => $username,
				"resumename" => $v['name'],
				"enddate" => date("Y-m-d H:i:s",$v['time_recExpire']),
				"time" => date("Y-m-d H:i:s",GetMkTime(time())),
				"url" => getUrlPath($param),
				"fields" => array(
					'keyword1' => '简历名称',
					'keyword3' => '到期时间'
				)
			);

			//后发通知，防止出现重复发送的问题
			updateMemberNotice($v['userid'], $moban, $param, $config);
		}
    }
}

/**
 * 职位智能刷新次数用尽发送消息通知
 */
//查询待发送消息通知的职位记录
$sql = $dsql->SetQuery("SELECT `id`,`userid`,`title`,`cityid`,`cid`,`smartRefresh_lastTime`,`company` FROM `#@__zhaopin_post` WHERE `send_smartRefreshEnd` = 1 ORDER BY `id` ASC");
$sendPosts = $dsql->dsqlOper($sql,"results");

if($sendPosts != null && is_array($sendPosts)){
    foreach ($sendPosts as $v){
		//先更新通知状态
        $sql = $dsql->SetQuery("UPDATE `#@__zhaopin_post` SET `send_smartRefreshEnd` = 0 WHERE `id` = ".$v['id']);
        $dsql->dsqlOper($sql, "update");

		//增加一条职位智能刷新次数用尽的系统通知

		//生成消息通知模板
		$notice = array();
		$noticeTemplate = $zhaopin_system_noticeTemplate[3][5];
		$notice['title'] = $noticeTemplate['title']; //通知标题
		$moban = $noticeTemplate['moban']; //通知模板名称
		$notice['content'] = sprintf($noticeTemplate['content'],$v['title'],date("Y-m-d H:i:s",$v['smartRefresh_lastTime'])); //生成消息通知的完整内容

		//如果有模板名称，就去查询对应的系统消息配置
		if ($moban != null) {
			$sql = $dsql->SetQuery("SELECT `site_title`,`site_body` FROM `#@__site_notify` WHERE `title` = '".$moban."'");
			$ret = $dsql->dsqlOper($sql, "results");
			if ($ret != null && is_array($ret)) {
				//如果系统消息配置有网页消息标题，则消息通知应用此标题
				$siteTitle = $ret[0]['site_title'];
				if ($siteTitle != null) {
					$notice['title'] = $siteTitle;
				}

				//如果系统消息配置有网页消息模板，则消息通知应用此模板
				$siteMoban = $ret[0]['site_body'];
				if ($siteMoban != null) {
					//替换模板中对应的变量
					$notice['content'] = str_replace(array('$postname','$enddate'), array($v['title'],date("Y-m-d H:i:s",$v['smartRefresh_lastTime'])), $siteMoban);
				}
			}
		}

		$sql = $dsql->SetQuery("INSERT INTO `#@__zhaopin_system_notice` (`cityid`, `userid`, `type`, `ordertype`, `postid`, `companyid`, `resumeid`, `orderid`, `addtime`, `content`, `title`) VALUES ('".$v['cityid']."', '".$v['userid']."', '3', '5', '".$v['id']."', '".$v['cid']."', '0', '0', '".$now."', '".$notice['content']."', '".$notice['title']."')");
		$logId = $dsql->dsqlOper($sql, "lastid");

		//如果有模板名称，则发送消息通知
		if ($moban != null) {
			//职位详情链接
			$param = array(
				"service"  => "zhaopin",
				"template" => "postDetail",
				"id" => $v['id']
			);

			//查询会员昵称
			$username = '';
			$sql = $dsql->SetQuery("SELECT `nickname`, `username` FROM `#@__member` WHERE `id` = ".$v['userid']);
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret != null && is_array($ret)){
				$username = $ret[0]['nickname'] ? $ret[0]['nickname'] : $ret[0]['username'];
			}

			//网站名称
			global $cfg_webname;
			global $siteCityName;
			$webname = str_replace('$city', $siteCityName, stripslashes($cfg_webname));

			//自定义配置
			$config = array(
				"webname" => $webname,
				"username" => $username,
				"postname" => $v['title'],
				"companyname" => $v['company'],
				"enddate" => date("Y-m-d H:i:s",$v['smartRefresh_lastTime']),
				"time" => date("Y-m-d H:i:s",GetMkTime(time())),
				"url" => getUrlPath($param),
				"fields" => array(
					'keyword1' => '职位名称',
					'keyword2' => '企业名称',
					'keyword3' => '到期时间',
				)
			);

			//后发通知，防止出现重复发送的问题
			updateMemberNotice($v['userid'], $moban, $param, $config);
		}
    }
}

/**
 * 会员到期发送消息通知
 */
//查询待发送消息通知的会员
$sql = $dsql->SetQuery("SELECT `id`,`userid`,`title`,`levelType`,`cityid`,`name`,`time_levelEnd` FROM `#@__zhaopin_company` WHERE `send_levelExpired` = 1 ORDER BY `id` ASC");
$sendCompanys = $dsql->dsqlOper($sql,"results");

if($sendCompanys != null && is_array($sendCompanys)){
    foreach ($sendCompanys as $v){
		//会员类型
		$title = '认证会员';
		if ($v['levelType'] == 1) {
			$title = '名企会员';
		}

		//先更新通知状态
        $sql = $dsql->SetQuery("UPDATE `#@__zhaopin_company` SET `send_levelExpired` = 0 WHERE `id` = ".$v['id']);
        $dsql->dsqlOper($sql, "update");

		//增加一条会员到期的系统通知

		//会员类型
		$ordertype = 2;
		if ($v['levelType'] == 1) {
			$ordertype = 1;
		}

		//生成消息通知模板
		$notice = array();
		$noticeTemplate = $zhaopin_system_noticeTemplate[3][$ordertype];
		$notice['title'] = $noticeTemplate['title']; //通知标题
		$moban = $noticeTemplate['moban']; //通知模板名称
		$notice['content'] = sprintf($noticeTemplate['content'],$v['name'],date("Y-m-d H:i:s",$v['time_levelEnd'])); //生成消息通知的完整内容

		//如果有模板名称，就去查询对应的系统消息配置
		if ($moban != null) {
			$sql = $dsql->SetQuery("SELECT `site_title`,`site_body` FROM `#@__site_notify` WHERE `title` = '".$moban."'");
			$ret = $dsql->dsqlOper($sql, "results");
			if ($ret != null && is_array($ret)) {
				//如果系统消息配置有网页消息标题，则消息通知应用此标题
				$siteTitle = $ret[0]['site_title'];
				if ($siteTitle != null) {
					//替换标题中对应的变量
					$notice['title'] = str_replace(array('$levelname'), array($title), $siteTitle);
				}

				//如果系统消息配置有网页消息模板，则消息通知应用此模板
				$siteMoban = $ret[0]['site_body'];
				if ($siteMoban != null) {
					//替换模板中对应的变量
					$notice['content'] = str_replace(array('$companyname','$enddate','$levelname'), array($v['name'],date("Y-m-d H:i:s",$v['time_levelEnd']),$title), $siteMoban);
				}
			}
		}

		$sql = $dsql->SetQuery("INSERT INTO `#@__zhaopin_system_notice` (`cityid`, `userid`, `type`, `ordertype`, `postid`, `companyid`, `resumeid`, `orderid`, `addtime`, `content`, `title`) VALUES ('".$v['cityid']."', '".$v['userid']."', '3', '".$ordertype."', '0', '".$v['id']."', '0', '0', '".$now."', '".$notice['content']."', '".$notice['title']."')");
		$logId = $dsql->dsqlOper($sql, "lastid");

		//如果有模板名称，则发送消息通知
		if ($moban != null) {
			//企业详情链接
			$param = array(
				"service"  => "zhaopin",
				"template" => "u_center",
				"param" => "user_type=2",
				"id" => $v['id'] //带上企业id，方便查询分站
			);

			//查询会员昵称
			$username = '';
			$sql = $dsql->SetQuery("SELECT `nickname`, `username` FROM `#@__member` WHERE `id` = ".$v['userid']);
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret != null && is_array($ret)){
				$username = $ret[0]['nickname'] ? $ret[0]['nickname'] : $ret[0]['username'];
			}

			//网站名称
			global $cfg_webname;
			global $siteCityName;
			$webname = str_replace('$city', $siteCityName, stripslashes($cfg_webname));

			//自定义配置
			$config = array(
				"webname" => $webname,
				"username" => $username,
				"companyname" => $v['name'],
				"levelname" => $title,
				"enddate" => date("Y-m-d H:i:s",$v['time_levelEnd']),
				"time" => date("Y-m-d H:i:s",GetMkTime(time())),
				"url" => getUrlPath($param),
				"fields" => array(
					'keyword1' => '企业名称',
					'keyword2' => '会员类型',
					'keyword3' => '到期时间',
				)
			);

			//后发通知，防止出现重复发送的问题
			updateMemberNotice($v['userid'], $moban, $param, $config);
		}
    }
}


/**
 * 平台自动刷新职位
 */

//查询开启了刷新且自动刷新已经到期的分站
$sql = $dsql->SetQuery("SELECT * FROM `#@__zhaopin_city_post_refresh` where `open` = 1 AND `endtime` <= $now ORDER BY `id` ASC");
$ret = $dsql->dsqlOper($sql, "results");
if ($ret != null && is_array($ret)) {
	foreach ($ret as $value) {
		//更新当前分站的刷新配置为关闭
		$sql = $dsql->SetQuery("UPDATE `#@__zhaopin_city_post_refresh` SET `open` = 0,`starttime` = 0,`endtime` = 0 WHERE `id` = ".$value['id']);
        $ret1 = $dsql->dsqlOper($sql, "update");

		//如果当前分站的配置不是默认，就去关闭对应分站的刷新配置
		if ($value['custom'] == 1) {
			$sql = $dsql->SetQuery("SELECT `config` FROM `#@__site_city` where `cid` = ".$value['cityid']);
	        $ret1 = $dsql->dsqlOper($sql, "results");
			if ($ret1 != null && is_array($ret1)) {
				$config = $ret1[0]['config'];
				$configArr = unserialize($config);
				if ($configArr != null && is_array($configArr) && isset($configArr['zhaopin'])) {
					$configArr['zhaopin']['autojobup'] = 1;

					$config = serialize($configArr);
					$config = addslashes($config);
					$sql = $dsql->SetQuery("UPDATE `#@__site_city` SET `config` = '".$config."' WHERE `cid` = ".$value['cityid']);
					$ret1 = $dsql->dsqlOper($sql, "update");
				}
			}
		//如果当前分站的配置是默认，就去关闭系统的刷新配置
		} else if ($value['custom'] == 0) {
			$sql = $dsql->SetQuery("UPDATE `#@__zhaopin_config` SET `postRefresh` = 0 WHERE `cityid` = 0");
	        $ret1 = $dsql->dsqlOper($sql, "update");
		}
	}
}

//查询开启了刷新且刷新时间小于当前时间的分站
$sql = $dsql->SetQuery("SELECT * FROM `#@__zhaopin_city_post_refresh` where `open` = 1 AND `nexttime` <= $now ORDER BY `id` ASC");
$ret = $dsql->dsqlOper($sql, "results");
if ($ret != null && is_array($ret)) {
	foreach ($ret as $value) {
		//根据配置刷新当前分站的相关职位
		$postWhere = '`cityid` = '.$value['cityid']." AND `status` = 2 AND `del` = 0";
		//如果限制后台发布职位
		if ($value['scope'] == 1) {
			$postWhere .= ' AND `isadmin` = 1';
		}
		//如果限制发布时间范围
		if ((int)$value['createPeriod'] > 0) {
			$postWhere .= ' AND `time_add` >= '.($now - (int)$value['createPeriod']*86400);
		}
		$sql = $dsql->SetQuery("UPDATE `#@__zhaopin_post` SET `time_update` = ".$now." + FLOOR(1 + (RAND() * 999)) WHERE ".$postWhere);
		$ret1 = $dsql->dsqlOper($sql, "update");

		//更新当前分站的刷新配置
		$sql = $dsql->SetQuery("UPDATE `#@__zhaopin_city_post_refresh` SET `lasttime` = ".$now.",`nexttime` = ".round($now + $value['frequency']*3600)." WHERE `id` = ".$value['id']);
        $ret1 = $dsql->dsqlOper($sql, "update");
	}
}


/**
 * 简历自动投递过期处理
 */
$sql = $dsql->SetQuery("UPDATE `#@__zhaopin_resume` SET `autoSubmitResume` = 0 WHERE `autoSubmitResume` = 1 AND `autoSubmitEndtime` < ".$now);
$ret = $dsql->dsqlOper($sql, "update");