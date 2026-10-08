<?php   
if(!defined('HUONIAOINC')) exit('Request Error!');
/**
 * 按小时执行计划任务
 * 数据统计 近7日发布数量  近7日刷新次数 近7日简历下载数量 近7日订单金额
 * 
 */

//加载招聘的配置
require_once HUONIAOROOT."/api/handlers/zhaopin.config.php";


/**
 * 数据统计
 * 近7日发布数量 近7日刷新次数 近7日简历下载数量 近7日订单金额
 */
$startTime = strtotime('-7 days');
$sql = $dsql->SetQuery("SELECT `id` FROM `#@__zhaopin_company` WHERE `del` = 0");
$ret = $dsql->dsqlOper($sql, "results");
if(is_array($ret) && count($ret) > 0){
	$cid = $ret[0]['id'];
	$data = array();
	//近7日发布数量
	$sql = $dsql->SetQuery("SELECT count(`id`) total FROM `#@__zhaopin_post` WHERE `cid` = {$cid} AND `time_add` >= {$startTime}"); //有效的数据
	$total = $dsql->getOne($sql);
	$publishTotal = $total ? (int) $total : 0;

	//近7日刷新次数
	$sql = $dsql->SetQuery("SELECT count(`id`) total FROM `#@__zhaopin_service_log` WHERE `cid` = {$cid} AND `type` in (5, 6)  AND `addtime` >= {$startTime}"); //有效的数据
	$total = $dsql->getOne($sql);
	$refreshTotal = $total ? (int) $total : 0;

	//近7日简历下载数量
	$sql = $dsql->SetQuery("SELECT count(`id`) total FROM `#@__zhaopin_resume_download_log` WHERE `cid` = {$cid} AND `addtime` >= {$startTime}"); //有效的数据
	$total = $dsql->getOne($sql);
	$downloadTotal = $total ? (int) $total : 0;

	//近7日订单金额
	$sql = $dsql->SetQuery("SELECT sum(`amount`) total FROM `#@__zhaopin_order` WHERE `cid` = {$cid} AND `addtime` >= {$startTime}"); //有效的数据
	$total = $dsql->getOne($sql);
	$amountTotal = $total ? (int) $total : 0;

    //更新数据
	$sql = $dsql->SetQuery("UPDATE `#@__zhaopin_company` SET `week_release` = {$publishTotal}, `week_refresh` = {$refreshTotal}, `week_download` = {$downloadTotal}, `week_amount` = {$amountTotal}  WHERE `id` = {$cid}");
	$dsql->dsqlOper($sql, "update");
}


//会员暂停功能的计划任务，查询出暂停到期的会员，循环执行取消暂停操作
$now = GetMkTime(time()); //当前时间
$sql = $dsql->SetQuery("SELECT `id`,`stop_params` FROM `#@__zhaopin_company` WHERE `del` = 0 AND `levelType` > 0 AND `stop_status` = 1 AND `stop_end` <= ".$now." ORDER BY `id` ASC");
$stopCompanys = $dsql->dsqlOper($sql,"results");
if($stopCompanys != null && is_array($stopCompanys)){
    foreach ($stopCompanys as $v) {
		//解析暂停时保存的数据
        $stopParams = json_decode($v['stop_params'], true);
        if ($stopParams != null && is_array($stopParams)) {
            //计算新的会员过期时间
			$time_levelEnd = $now + (int)$stopParams['timeLeaved'];

			//更新会员，取消暂停
			$mainsql = $dsql->SetQuery("UPDATE `#@__zhaopin_company` SET `status` = ".$stopParams['status'].",`levelExpired` = 0, `time_levelEnd` = ".$time_levelEnd.", `account_smartRefreshCount` = ".$stopParams['account_smartRefreshCount'].", `account_resumePackagePoint` = ".$stopParams['account_resumePackagePoint'].", `account_balancePackage` = ".$stopParams['account_balancePackage'].", `account_totalPublishCount` = ".$stopParams['account_totalPublishCount'].", `account_dayPublishCount` = ".$stopParams['account_dayPublishCount'].", `account_normalRefreshCount` = ".$stopParams['account_normalRefreshCount'].", `stop_status` = 0 WHERE `id` = ".$v['id']);
			$ret = $dsql->dsqlOper($mainsql, "update");
			if ($ret == "ok") {
				//插入一条操作记录
				$sql = $dsql->SetQuery("INSERT INTO `#@__zhaopin_company_stop_log` (`cid`, `type`, `addtime`, `userid`, `isadmin`) VALUES ('".$v['id']."', '2', '".$now."', '0', '1')");
				$lastid = $dsql->dsqlOper($sql, "lastid");
			}
        }
	}
}


//用户绑定合伙人后，如果一定时间内没有注册简历或者入驻企业，就自动解除绑定关系

//先查询出基础配置
$sql = $dsql->SetQuery("SELECT `autoRemoveFromUidTime` FROM `#@__zhaopin_config` WHERE `cityid` = 0");
$result = $dsql->dsqlOper($sql, "results");
if ($result != null && is_array($result)) {
	$autoRemoveFromUidTime = (int)$result[0]['autoRemoveFromUidTime'];
	//时间配置存在且大于0，则进行自动解除的逻辑
	if ($autoRemoveFromUidTime > 0) {
		$removeTime = $now - $autoRemoveFromUidTime;
		$sql = $dsql->SetQuery("UPDATE `#@__member` SET `from_uid` = 0  WHERE `from_uid` > 0 AND `zhaopin_company` = 1 AND `zhaopin_resume` = 1 AND `from_bindtime` <= ".$removeTime);
		$dsql->dsqlOper($sql, "update");
	}
}

//查询所有已到投递时间但是还未投递的简历，执行自动投递逻辑

//先获取当前的小时数，只有7点到22点之间才执行自动投递逻辑
$hour = (int)date('H', $now);
if ($hour >= 7 && $hour <= 22) {
	$sql = $dsql->SetQuery("SELECT * FROM `#@__zhaopin_resume_autopost_plan` WHERE `status` = 1 AND `posttime` <= ".$now);
	$result = $dsql->dsqlOper($sql,"results");
	if($result != null && is_array($result)){
	
		//将zhaopin_system_noticeTemplate声明成全局变量，方便aotoSubmitResumePost函数里引用
		$zhaopin_system_noticeTemplate1 = $zhaopin_system_noticeTemplate;
		global $zhaopin_system_noticeTemplate;
		$zhaopin_system_noticeTemplate = $zhaopin_system_noticeTemplate1;
	
		foreach ($result as $v) {
			//将投递状态修改为已投递
			$sql = $dsql->SetQuery("UPDATE `#@__zhaopin_resume_autopost_plan` SET `status` = 2,`updatetime` = ".$now."  WHERE `id` = ".$v['id']);
			$ret = $dsql->dsqlOper($sql, "update");
			if ($ret == "ok") {
				//执行自动投递逻辑
				aotoSubmitResumePost($v['resumeid'], $v['postid']);
			}
		}
	}
}