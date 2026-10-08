<?php   if(!defined('HUONIAOINC')) exit('Request Error!');
/**
 * 同步会员所在分站
 *
 * 根据用户设置的addr，自动更新cityid
 *
 * @version        $Id: member_updateCityid.php 2020-09-26 下午17:09:20 $
 * @package        HuoNiao.cron
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

$sql = $dsql->SetQuery("SELECT `id`, `addr` FROM `#@__member` WHERE `addr` != 0 AND `cityid` = 0 ORDER BY `id` ASC LIMIT 500"); //每次更新500条数据
$ret = $dsql->dsqlOper($sql, "results");
if($ret){
	foreach ($ret as $key => $value) {
		$id   = $value['id'];
		$addr = $value['addr'];

		$cityInfoArr = getPublicParentInfo(array('tab' => 'site_area', 'id' => $addr));
		$cityInfoArr = explode(',', $cityInfoArr);
		$_cityid      = (int)$cityInfoArr[0];

		if(is_numeric($_cityid) && $_cityid){
			$sql = $dsql->SetQuery("UPDATE `#@__member` SET `cityid` = '$_cityid' WHERE `id` = " . $id);
			$dsql->dsqlOper($sql, "update");
		}
	}
}
