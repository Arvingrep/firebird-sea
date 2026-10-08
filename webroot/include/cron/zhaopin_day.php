<?php 
if(!defined('HUONIAOINC')) exit('Request Error!');
/**
 * 按天执行的计划任务
 * 1 简历活跃度每天-2
 * 2 企业会员累计时长
 * 3 crm规则执行
 */

 //执行记录限制重复执行
$startTime = strtotime('today');
$fileName= "zhaopin_day";
$sql = $dsql->SetQuery("SELECT count(`id`) FROM `#@__site_cron` where `ltime` > {$startTime} AND `file` = '{$fileName}'");
$ret = $dsql->getOne($sql);
if(!$ret){
	/**
	 * 简历活跃度每天减2
	 */
	$sql = $dsql->SetQuery("UPDATE `#@__zhaopin_resume` SET `activity` = activity - 2");
	$dsql->dsqlOper($sql, "update");

	/**
	 * 企业会员累计时长
	 */
	$now = GetMkTime(time());
	$sql = $dsql->SetQuery("UPDATE `#@__zhaopin_company` SET `levelDays` = levelDays + 1 WHERE `levelExpired` = 0 AND `time_levelEnd` >= $now");
	$dsql->dsqlOper($sql, "update");
	

	/**
	 * crm规则
	 */
	//先查询出所有分站的配置，然后循环执行每一个分站的逻辑，并记录下分站的ID合集，最后以默认配置执行不在这些分站的逻辑
	$now = GetMkTime(time());
	$default = array(); //默认配置
	$cityids = array(); //有配置的分站ID合集

	//查询所有配置
	$sql = $dsql->SetQuery("SELECT `id`, `cityid`, `crm_followLimit`, `crm_overLimit`, `crm_thresholdValue1`, `crm_thresholdValue2`, `crm_thresholdValue3`, `crm_thresholdValue4`, `crm_thresholdValue5` FROM `#@__zhaopin_config`"); //招聘配置参数
	$results = $dsql->dsqlOper($sql, "results");
	if(is_array($results) && count($results) > 0){
		foreach ($results as $item) {
			$cityid = (int)$item['cityid'];

			//如果cityid为0，就记录下来
			if ($cityid == 0) {
				$default = $item;
				continue;
			}

			//保存每次循环的cityid
			$cityids[] = $cityid;

			$config = $item;
	   
			//负责的客户如果X天未跟进，则客户将自动退回到公海（成交客户除外）（如果为0 则为永久）
			if($config['crm_followLimit']){
				$endTime = $now - ($config['crm_followLimit'] * 86400);//向前推
				$sql = $dsql->SetQuery("UPDATE `#@__zhaopin_company` SET `time_sea` = {$now}, `owner` = 0  WHERE `owner` != 0 AND `del` = 0 AND `time_lastFollow` <= {$endTime} AND `time_deal` = 0 AND `cityid` = ".$cityid);
				$dsql->dsqlOper($sql, "update");
			}
			
			//负责客户如X天未成交，则客户将自动退回到公海（成交客户除外）（如果为0 则为永久）
			if($config['crm_overLimit']){
				$endTime = $now - ($config['crm_overLimit'] * 86400);//向前推
				$sql = $dsql->SetQuery("UPDATE `#@__zhaopin_company` SET `time_sea` = {$now}, `owner` = 0  WHERE `owner` != 0 AND `del` = 0 AND `time_deal` <= {$endTime} AND `cityid` = ".$cityid);
				$dsql->dsqlOper($sql, "update");
			}
		
			$cids = array();
			//商机挖掘阈值设置（系统根据客户行为和阈值进行算法匹配；如果客户行为满足任何一项阈值即定义为需求评级：急迫）
			if($config['crm_thresholdValue1']){
				//7日全职发布数量
				$startTime = strtotime('-7 days');
				$sql = $dsql->SetQuery("SELECT `cid`, count(`id`) total FROM `#@__zhaopin_post` WHERE `category` = 1 AND `time_add` >= {$startTime} AND `cityid` = ".$cityid." GROUP BY `cid`"); //有效的数据
				$ret = $dsql->dsqlOper($sql, "results");
				if($ret){
					foreach ($ret as $key => $value) {
						if($value['total'] >= $config['crm_thresholdValue1']){
							$sql = $dsql->SetQuery("UPDATE `#@__zhaopin_company` SET `demandLevel` = 2 WHERE `id` = {$value['cid']} AND `cityid` = ".$cityid);
							$dsql->dsqlOper($sql, "update");
							array_push($cids, $value['cid']);
						}
					}
				}
			}
		
			if($config['crm_thresholdValue2']){
				//7日职位刷新次数
				$startTime = strtotime('-7 days');
				$sql = $dsql->SetQuery("SELECT `cid`, count(`id`) total FROM `#@__zhaopin_service_log` WHERE `type` IN (5, 6)  AND `addtime` >= {$startTime} AND `cityid` = ".$cityid." GROUP BY `cid`"); //有效的数据
				$ret = $dsql->dsqlOper($sql, "results");
				if($ret){
					foreach ($ret as $key => $value) {
						if($value['total'] >= $config['crm_thresholdValue2']){
							$sql = $dsql->SetQuery("UPDATE `#@__zhaopin_company` SET `demandLevel` = 2 WHERE `id` = {$value['cid']} AND `cityid` = ".$cityid);
							$dsql->dsqlOper($sql, "update");
							array_push($cids, $value['cid']);
						}
					}
				}
			}
		
			if($config['crm_thresholdValue3'] || $config['crm_thresholdValue4']){
				//7日简历下载次数 & 7日订单支付金额
				$sql = $dsql->SetQuery("SELECT `id` FROM `#@__zhaopin_company` where `del` = 0 AND `demandLevel` != 2  AND (`week_download` >= {$config['crm_thresholdValue3']} OR `week_amount` >= {$config['crm_thresholdValue4']}) AND `cityid` = ".$cityid); //有效的数据
				$ret = $dsql->dsqlOper($sql, "results");
				if($ret){
					foreach ($ret as $key => $value) {
						$sql = $dsql->SetQuery("UPDATE `#@__zhaopin_company` SET `demandLevel` = 2 WHERE `id` = {$value['id']} AND `cityid` = ".$cityid);
						$dsql->dsqlOper($sql, "update");
						array_push($cids, $value['id']);
					}
				}
			}
		
			if($config['crm_thresholdValue5']){
				//置顶推荐全职数量
				$sql = $dsql->SetQuery("SELECT `cid`, count(`id`) total FROM `#@__zhaopin_post` WHERE `category` = 1 AND `rec_status` = 1 AND `cityid` = ".$cityid." GROUP BY `cid`"); //有效的数据
				$ret = $dsql->dsqlOper($sql, "results");
				if($ret){
					foreach ($ret as $key => $value) {
						if($value['total'] >= $config['crm_thresholdValue5']){
							$sql = $dsql->SetQuery("UPDATE `#@__zhaopin_company` SET `demandLevel` = 2 WHERE `id` = {$value['cid']} AND `cityid` = ".$cityid);
							$dsql->dsqlOper($sql, "update");
							array_push($cids, $value['cid']);
						}
					}
				}
			}
		
			$cids = array_unique($cids);
			if(count($cids)){
				$cidStr = implode(",", $cids);
				$sql = $dsql->SetQuery("UPDATE `#@__zhaopin_company` SET `demandLevel` = 1 WHERE `id` NOT IN({$cidStr}) AND `cityid` = ".$cityid);
				$dsql->dsqlOper($sql, "update");
			}
		}
	}

	//根据默认配置，把其他分站的逻辑再执行一面
	if ($default != null) {
		//如果有已经执行的分站ID，则筛选没有执行的分站ID，否则就执行全部的分站
		$where = '';
		if ($cityids != null) {
			$where = " AND `cityid` NOT IN (".join(', ', $cityids).")";
		}

		$config = $default;
   
		//负责的客户如果X天未跟进，则客户将自动退回到公海（成交客户除外）（如果为0 则为永久）
		if($config['crm_followLimit']){
			$endTime = $now - ($config['crm_followLimit'] * 86400);//向前推
			$sql = $dsql->SetQuery("UPDATE `#@__zhaopin_company` SET `time_sea` = {$now}, `owner` = 0  WHERE `owner` != 0 AND `del` = 0 AND `time_lastFollow` <= {$endTime} AND `time_deal` = 0".$where);
			$dsql->dsqlOper($sql, "update");
		}
		
		//负责客户如X天未成交，则客户将自动退回到公海（成交客户除外）（如果为0 则为永久）
		if($config['crm_overLimit']){
			$endTime = $now - ($config['crm_overLimit'] * 86400);//向前推
			$sql = $dsql->SetQuery("UPDATE `#@__zhaopin_company` SET `time_sea` = {$now}, `owner` = 0  WHERE `owner` != 0 AND `del` = 0 AND `time_deal` <= {$endTime}".$where);
			$dsql->dsqlOper($sql, "update");
		}
	
		$cids = array();
		//商机挖掘阈值设置（系统根据客户行为和阈值进行算法匹配；如果客户行为满足任何一项阈值即定义为需求评级：急迫）
		if($config['crm_thresholdValue1']){
			//7日全职发布数量
			$startTime = strtotime('-7 days');
			$sql = $dsql->SetQuery("SELECT `cid`, count(`id`) total FROM `#@__zhaopin_post` WHERE `category` = 1 AND `time_add` >= {$startTime}".$where." GROUP BY `cid`"); //有效的数据
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				foreach ($ret as $key => $value) {
					if($value['total'] >= $config['crm_thresholdValue1']){
						$sql = $dsql->SetQuery("UPDATE `#@__zhaopin_company` SET `demandLevel` = 2 WHERE `id` = {$value['cid']}".$where);
						$dsql->dsqlOper($sql, "update");
						array_push($cids, $value['cid']);
					}
				}
			}
		}
	
		if($config['crm_thresholdValue2']){
			//7日职位刷新次数
			$startTime = strtotime('-7 days');
			$sql = $dsql->SetQuery("SELECT `cid`, count(`id`) total FROM `#@__zhaopin_service_log` WHERE `type` IN (5, 6)  AND `addtime` >= {$startTime}".$where." GROUP BY `cid`"); //有效的数据
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				foreach ($ret as $key => $value) {
					if($value['total'] >= $config['crm_thresholdValue2']){
						$sql = $dsql->SetQuery("UPDATE `#@__zhaopin_company` SET `demandLevel` = 2 WHERE `id` = {$value['cid']}".$where);
						$dsql->dsqlOper($sql, "update");
						array_push($cids, $value['cid']);
					}
				}
			}
		}
	
		if($config['crm_thresholdValue3'] || $config['crm_thresholdValue4']){
			//7日简历下载次数 & 7日订单支付金额
			$sql = $dsql->SetQuery("SELECT `id` FROM `#@__zhaopin_company` where `del` = 0 AND `demandLevel` != 2  AND (`week_download` >= {$config['crm_thresholdValue3']} OR `week_amount` >= {$config['crm_thresholdValue4']})".$where); //有效的数据
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				foreach ($ret as $key => $value) {
					$sql = $dsql->SetQuery("UPDATE `#@__zhaopin_company` SET `demandLevel` = 2 WHERE `id` = {$value['id']}".$where);
					$dsql->dsqlOper($sql, "update");
					array_push($cids, $value['id']);
				}
			}
		}
	
		if($config['crm_thresholdValue5']){
			//置顶推荐全职数量
			$sql = $dsql->SetQuery("SELECT `cid`, count(`id`) total FROM `#@__zhaopin_post` WHERE `category` = 1 AND `rec_status` = 1".$where." GROUP BY `cid`"); //有效的数据
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				foreach ($ret as $key => $value) {
					if($value['total'] >= $config['crm_thresholdValue5']){
						$sql = $dsql->SetQuery("UPDATE `#@__zhaopin_company` SET `demandLevel` = 2 WHERE `id` = {$value['cid']}".$where);
						$dsql->dsqlOper($sql, "update");
						array_push($cids, $value['cid']);
					}
				}
			}
		}
	
		$cids = array_unique($cids);
		if(count($cids)){
			$cidStr = implode(",", $cids);
			$sql = $dsql->SetQuery("UPDATE `#@__zhaopin_company` SET `demandLevel` = 1 WHERE `id` NOT IN({$cidStr})".$where);
			$dsql->dsqlOper($sql, "update");
		}
	}

}

