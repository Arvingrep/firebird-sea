<?php
/**
 * 外卖函数存放文件
 *
 * @version        $Id: common.func.php 2013-7-7 上午10:33:36 $
 * @package        HuoNiao.Libraries
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

if(!defined('HUONIAOINC')) exit('Request Error!');



function checkManagePromise($shopid){
	global $manager;

	if(is_array($shopid)){
		foreach ($shopid as $key => $value) {
			if(!in_array($value['sid'], $manager)){
				return false;
			}
		}
		return true;
	}else{
		return in_array($shopid, $manager) ? true : false;
	}

}


// 检查登陆用户管理店铺的权限
function checkWaimaiShopManager($id, $type = "shop"){
	global $dsql;
	global $manager;
	if(empty($manager) || empty($id)) return false;

	if($type == "shop"){
		return checkManagePromise($id);

	}else{
		if($type == "common"){
			$sql = $dsql->SetQuery("SELECT `aid` sid FROM `#@__public_comment` WHERE `id` in ($id)");
		}elseif($type == "waimaicommon"){
			$sql = $dsql->SetQuery("SELECT `sid`  FROM `#@__waimai_common` WHERE `id` in ($id)");

		}else{
			if($type =="order"){
				$sql = $dsql->SetQuery("SELECT `sid` FROM `#@__waimai_$type".'_all'."` WHERE `id` in ($id)");
			}elseif ($type =="quan"){
                $sql = $dsql->SetQuery("SELECT `shopids` sid FROM `#@__waimai_$type` WHERE `id` in ($id)");
            }else{
				$sql = $dsql->SetQuery("SELECT `sid` FROM `#@__waimai_$type` WHERE `id` in ($id)");

			}
		}
		$sid = $dsql->dsqlOper($sql, "results");
		if($sid){
			return checkManagePromise($sid);
		}else{
			return false;
		}
	}

}
