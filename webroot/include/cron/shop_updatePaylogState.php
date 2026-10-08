<?php   if(!defined('HUONIAOINC')) exit('Request Error!');
/**
 * 定时删除半个小时内未付款的记录
 *
 * 如果超过半个小时还未付款成功，则删除这条记录
 *
 * @version        $Id: shop_updatePaylogState.php 2019-4-16 晚上22:38:20 $
 * @package        HuoNiao.cron
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

$time = GetMkTime(time()) - 1800;

$sql = $dsql->SetQuery("SELECT `id` FROM `#@__shop_order` WHERE `orderstate` = 0 AND `orderdate` < $time");
$ret = $dsql->dsqlOper($sql, "results");

//查询订单涉及的商品
if($ret){
	foreach ($ret as $key => $value) {
		$oid = $value['id'];
		$sql = $dsql->SetQuery("SELECT o.`proid`, o.`speid`, o.`count`, p.`specification`, p.`inventoryCount` FROM `#@__shop_order_product` o LEFT JOIN `#@__shop_product` p ON p.`id` = o.`proid` WHERE o.`orderid` = " . $oid);
		$ret = $dsql->dsqlOper($sql, "results");
		if($ret){
			foreach ($ret as $k => $v) {
				$proid = $v['proid'];
				$speid = $v['speid'];
				$count = $v['count'];
				$specification = $v['specification'];
				$inventoryCount = (int)$v['inventoryCount'];

				//拍下减库存的商品，删除超时订单时恢复库存
				if($inventoryCount == 0){
					//更新已购买数量
					$sql = $dsql->SetQuery("UPDATE `#@__shop_product` SET `sales` = `sales` - $count, `inventory` = `inventory` + $count WHERE `id` = '$proid' AND `sales` > 0");
					$dsql->dsqlOper($sql, "update");

					if(!empty($specification)){
						$nSpec = array();
						$specification = explode("|", $specification);
						foreach ($specification as $k_ => $v_) {
							$specArr = explode(",", $v_);
								if($specArr[0] == $speid){
								$spec = explode("#", $v_);
								$nCount = $spec[2] + $count;
								$nCount = $nCount < 0 ? 0 : $nCount;
								array_push($nSpec, $spec[0]."#".$spec[1]."#".$nCount);
							}else{
								array_push($nSpec, $v_);
							}
						}

						$sql = $dsql->SetQuery("UPDATE `#@__shop_product` SET `specification` = '".join("|", $nSpec)."' WHERE `id` = '$proid'");
						$dsql->dsqlOper($sql, "update");
					}
				}
			}
		}
	}
}

$sql = $dsql->SetQuery("UPDATE `#@__shop_order` SET `orderstate` = 10 WHERE `orderstate` = 0 AND `orderdate` < $time");
$dsql->dsqlOper($sql, "update");
