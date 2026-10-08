<?php   if(!defined('HUONIAOINC')) exit('Request Error!');
/**
 * 新房产计划任务，每分钟执行一次
 * 
 * 1、经纪公司邀请码过期状态更新
 * 2、经纪公司分享码过期状态更新
 * 3、在线约看30分钟后自动失效
 * 4、400线索和IM5小时后自动失效
 * 5、客户轨迹3天后自动失效
 * 6、抢客、分配3天后自动失效
 * 7、在线约看标记为已看房后，48小时内未录带看，自动失效
 */

$nowTime = GetMkTime(time()); //现在时间

//经纪公司邀请码过期状态更新
$sql = $dsql->SetQuery("UPDATE `#@__house_distributor_company_invite_code` SET `status` = 1 WHERE `status` = 0 AND `expiretime` < ".$nowTime);
$ret = $dsql->dsqlOper($sql, "update");

//经纪公司分享码过期状态更新
$sql = $dsql->SetQuery("UPDATE `#@__house_distributor_company_share_code` SET `status` = 2 WHERE `status` = 1 AND `expiretime` < ".$nowTime);
$ret = $dsql->dsqlOper($sql, "update");

//在线约看30分钟后自动失效
$timeMinute30 = $nowTime - 1800;
//查询客户，在线约看新增后，30分钟内没有更新过就自动失效
$sql = $dsql->SetQuery("SELECT `id`,`dcoid`,`follow_uid` FROM `#@__house_distributor_company_customer` WHERE `del` = 0 AND `follow_status` = 2 AND `main` = 1 AND `transform` = 0 AND `type` = 4 AND `update_time` <= `create_time` AND `create_time` < ".$timeMinute30);
$result = $dsql->dsqlOper($sql, "results");
if ($result != null && is_array($result)) {
    //经纪人信息数组
    $userArr = array();
    foreach ($result as $value) {
        //查询跟进经纪人gid
        if (!isset($userArr[$value['follow_uid']])) {
            $sql = $dsql->SetQuery("SELECT `gid` FROM `#@__house_distributor_company_user` WHERE `uid` = ".$value['follow_uid']." AND `status` = 1 AND `gid` > 0 AND `dcoid` = ".$value['dcoid']);
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret != null && is_array($ret)) {
                $userArr[$value['follow_uid']] = $ret[0];
            } else {
                $userArr[$value['follow_uid']] = array();
            }
        }

        //将在线约看更新为失效掉落
        $sqlArr = array();
        $sqlArr[] = "`follow_status` = 1";
        $sqlArr[] = "`reason` = '未及时处理，已失效'";
        $sqlArr[] = "`update_time` = ".$nowTime;
        //如果跟进人有gid，就掉落到组里，否则就掉落到门店
        if ($userArr[$value['follow_uid']] != null) {
            $sqlArr[] = "`gid` = ".$userArr[$value['follow_uid']]['gid'];
        } else {
            $sqlArr[] = "`share` = 1";
        }

        $sql = $dsql->SetQuery("UPDATE `#@__house_distributor_company_customer` SET ".join(',',$sqlArr)." WHERE `id` = ".$value['id']);
        $ret = $dsql->dsqlOper($sql, "update");

        //如果更新成功，就继续下一步操作
        if ($ret == "ok") {
            //更新认领记录的状态
            $sql = $dsql->SetQuery("UPDATE `#@__house_distributor_company_customer_follow_log` SET `status` = 2,`update_time` = ".$nowTime.",`reason` = '未及时处理，已失效' WHERE `follow_uid` = ".$value['follow_uid']." AND `dccid` = ".$value['id']." AND `status` = 1");
            $ret = $dsql->dsqlOper($sql, "update");

            //掉落池子的客户删除除开上个认领人的所有已读记录
            $sql = $dsql->SetQuery("DELETE FROM `#@__house_distributor_company_customer_read` WHERE `dccid` = ".$value['id']." AND `follow_uid` != ".$value['follow_uid']);
            $ret = $dsql->dsqlOper($sql, "update");
        }
    }
}

//400线索和IM线索5小时后自动失效
$timeHour5 = $nowTime - 5*3600;
//查询客户，400线索和IM线索新增后，5小时内没有更新过就自动失效
$sql = $dsql->SetQuery("SELECT `id`,`dcoid`,`follow_uid` FROM `#@__house_distributor_company_customer` WHERE `del` = 0 AND `follow_status` = 2 AND `main` = 1 AND `transform` = 0 AND `type` IN (5,6) AND `update_time` <= `create_time` AND `create_time` < ".$timeHour5);
$result = $dsql->dsqlOper($sql, "results");
if ($result != null && is_array($result)) {
    //经纪人信息数组
    $userArr = array();
    foreach ($result as $value) {
        //查询跟进经纪人gid
        if (!isset($userArr[$value['follow_uid']])) {
            $sql = $dsql->SetQuery("SELECT `gid` FROM `#@__house_distributor_company_user` WHERE `uid` = ".$value['follow_uid']." AND `status` = 1 AND `gid` > 0 AND `dcoid` = ".$value['dcoid']);
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret != null && is_array($ret)) {
                $userArr[$value['follow_uid']] = $ret[0];
            } else {
                $userArr[$value['follow_uid']] = array();
            }
        }

        //将线索更新为失效掉落
        $sqlArr = array();
        $sqlArr[] = "`follow_status` = 1";
        $sqlArr[] = "`reason` = '未及时处理，已失效'";
        $sqlArr[] = "`update_time` = ".$nowTime;
        //如果跟进人有gid，就掉落到组里，否则就掉落到门店
        if ($userArr[$value['follow_uid']] != null) {
            $sqlArr[] = "`gid` = ".$userArr[$value['follow_uid']]['gid'];
        } else {
            $sqlArr[] = "`share` = 1";
        }

        $sql = $dsql->SetQuery("UPDATE `#@__house_distributor_company_customer` SET ".join(',',$sqlArr)." WHERE `id` = ".$value['id']);
        $ret = $dsql->dsqlOper($sql, "update");

        //如果更新成功，就继续下一步操作
        if ($ret == "ok") {
            //更新认领记录的状态
            $sql = $dsql->SetQuery("UPDATE `#@__house_distributor_company_customer_follow_log` SET `status` = 2,`update_time` = ".$nowTime.",`reason` = '未及时处理，已失效' WHERE `follow_uid` = ".$value['follow_uid']." AND `dccid` = ".$value['id']." AND `status` = 1");
            $ret = $dsql->dsqlOper($sql, "update");

            //掉落池子的客户删除除开上个认领人的所有已读记录
            $sql = $dsql->SetQuery("DELETE FROM `#@__house_distributor_company_customer_read` WHERE `dccid` = ".$value['id']." AND `follow_uid` != ".$value['follow_uid']);
            $ret = $dsql->dsqlOper($sql, "update");
        }
    }
}

//客户轨迹3天后自动失效
$timeDay3 = $nowTime - 3*86400;
//查询客户，客户轨迹线索新增后，3天内没有更新过就自动失效
$sql = $dsql->SetQuery("SELECT `id`,`dcoid`,`follow_uid` FROM `#@__house_distributor_company_customer` WHERE `del` = 0 AND `follow_status` = 2 AND `main` = 1 AND `transform` = 0 AND `type` = 1 AND `update_time` <= `create_time` AND `create_time` < ".$timeDay3);
$result = $dsql->dsqlOper($sql, "results");
if ($result != null && is_array($result)) {
    //经纪人信息数组
    $userArr = array();
    foreach ($result as $value) {
        //查询跟进经纪人gid
        if (!isset($userArr[$value['follow_uid']])) {
            $sql = $dsql->SetQuery("SELECT `gid` FROM `#@__house_distributor_company_user` WHERE `uid` = ".$value['follow_uid']." AND `status` = 1 AND `gid` > 0 AND `dcoid` = ".$value['dcoid']);
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret != null && is_array($ret)) {
                $userArr[$value['follow_uid']] = $ret[0];
            } else {
                $userArr[$value['follow_uid']] = array();
            }
        }

        //将客户轨迹更新为失效掉落
        $sqlArr = array();
        $sqlArr[] = "`follow_status` = 1";
        $sqlArr[] = "`reason` = '未及时处理，已失效'";
        $sqlArr[] = "`update_time` = ".$nowTime;
        //如果跟进人有gid，就掉落到组里，否则就掉落到门店
        if ($userArr[$value['follow_uid']] != null) {
            $sqlArr[] = "`gid` = ".$userArr[$value['follow_uid']]['gid'];
        } else {
            $sqlArr[] = "`share` = 1";
        }

        $sql = $dsql->SetQuery("UPDATE `#@__house_distributor_company_customer` SET ".join(',',$sqlArr)." WHERE `id` = ".$value['id']);
        $ret = $dsql->dsqlOper($sql, "update");

        //如果更新成功，就继续下一步操作
        if ($ret == "ok") {
            //更新认领记录的状态
            $sql = $dsql->SetQuery("UPDATE `#@__house_distributor_company_customer_follow_log` SET `status` = 2,`update_time` = ".$nowTime.",`reason` = '未及时处理，已失效' WHERE `follow_uid` = ".$value['follow_uid']." AND `dccid` = ".$value['id']." AND `status` = 1");
            $ret = $dsql->dsqlOper($sql, "update");

            //掉落池子的客户删除除开上个认领人的所有已读记录
            $sql = $dsql->SetQuery("DELETE FROM `#@__house_distributor_company_customer_read` WHERE `dccid` = ".$value['id']." AND `follow_uid` != ".$value['follow_uid']);
            $ret = $dsql->dsqlOper($sql, "update");
        }
    }
}

//抢客、分配3天后自动失效
$timeDay3 = $nowTime - 3*86400;
//查询客户，抢客、分配后，3天内没有更新过就自动失效
$sql = $dsql->SetQuery("SELECT `id`,`dcoid`,`follow_uid`,`number` FROM `#@__house_distributor_company_customer` WHERE `del` = 0 AND `follow_status` = 2 AND `main` = 1 AND `transform` = 0 AND `create_time` < `claim_time` AND `update_time` <= `claim_time` AND `claim_time` < ".$timeDay3);
$result = $dsql->dsqlOper($sql, "results");
if ($result != null && is_array($result)) {
    //经纪人信息数组
    $userArr = array();
    foreach ($result as $value) {
        //查询跟进经纪人gid
        if (!isset($userArr[$value['follow_uid']])) {
            $sql = $dsql->SetQuery("SELECT `gid` FROM `#@__house_distributor_company_user` WHERE `uid` = ".$value['follow_uid']." AND `status` = 1 AND `gid` > 0 AND `dcoid` = ".$value['dcoid']);
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret != null && is_array($ret)) {
                $userArr[$value['follow_uid']] = $ret[0];
            } else {
                $userArr[$value['follow_uid']] = array();
            }
        }

        //将在线约看更新为失效掉落
        $sqlArr = array();
        $sqlArr[] = "`follow_status` = 1";
        $sqlArr[] = "`reason` = '3天未跟进，已失效'";
        $sqlArr[] = "`update_time` = ".$nowTime;
        //如果跟进人有gid，就掉落到组里，否则就掉落到门店
        if ($userArr[$value['follow_uid']] != null) {
            $sqlArr[] = "`gid` = ".$userArr[$value['follow_uid']]['gid'];
        } else {
            $sqlArr[] = "`share` = 1";
        }

        //更新掉落时，把可能存在的同一编号的隐藏副需求也一起掉落
        $sql = $dsql->SetQuery("UPDATE `#@__house_distributor_company_customer` SET ".join(',',$sqlArr)." WHERE `del` = 0 AND `follow_status` = 2 AND `transform` = 0 AND `follow_uid` = ".$value['follow_uid']." AND `number` = '".$value['number']."'");
        $ret = $dsql->dsqlOper($sql, "update");

        //如果更新成功，就继续下一步操作
        if ($ret == "ok") {
            //更新认领记录的状态
            $sql = $dsql->SetQuery("UPDATE `#@__house_distributor_company_customer_follow_log` SET `status` = 2,`update_time` = ".$nowTime.",`reason` = '3天未跟进，已失效' WHERE `follow_uid` = ".$value['follow_uid']." AND `dccid` = ".$value['id']." AND `status` = 1");
            $ret = $dsql->dsqlOper($sql, "update");

            //掉落池子的客户删除除开上个认领人的所有已读记录
            $sql = $dsql->SetQuery("DELETE FROM `#@__house_distributor_company_customer_read` WHERE `dccid` = ".$value['id']." AND `follow_uid` != ".$value['follow_uid']);
            $ret = $dsql->dsqlOper($sql, "update");
        }
    }
}

//在线约看标记为已看房后，48小时内未录带看，自动失效
$timeHour48 = $nowTime - 48*3600;
//查询客户，在线约看标记为已看房后，48小时内未录带看，自动失效
$sql = $dsql->SetQuery("SELECT `id`,`dcoid`,`follow_uid` FROM `#@__house_distributor_company_customer` WHERE `del` = 0 AND `follow_status` = 2 AND `main` = 1 AND `transform` = 0 AND `type` = 4 AND `claim_time` = `create_time` AND `concat_status` = 2 AND `islooking` = 0 AND `update_time` < ".$timeHour48);
$result = $dsql->dsqlOper($sql, "results");
if ($result != null && is_array($result)) {
    //经纪人信息数组
    $userArr = array();
    foreach ($result as $value) {
        //查询跟进经纪人gid
        if (!isset($userArr[$value['follow_uid']])) {
            $sql = $dsql->SetQuery("SELECT `gid` FROM `#@__house_distributor_company_user` WHERE `uid` = ".$value['follow_uid']." AND `status` = 1 AND `gid` > 0 AND `dcoid` = ".$value['dcoid']);
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret != null && is_array($ret)) {
                $userArr[$value['follow_uid']] = $ret[0];
            } else {
                $userArr[$value['follow_uid']] = array();
            }
        }

        //将在线约看更新为失效掉落
        $sqlArr = array();
        $sqlArr[] = "`follow_status` = 1";
        $sqlArr[] = "`reason` = '未及时处理，已失效'";
        $sqlArr[] = "`update_time` = ".$nowTime;
        //如果跟进人有gid，就掉落到组里，否则就掉落到门店
        if ($userArr[$value['follow_uid']] != null) {
            $sqlArr[] = "`gid` = ".$userArr[$value['follow_uid']]['gid'];
        } else {
            $sqlArr[] = "`share` = 1";
        }

        $sql = $dsql->SetQuery("UPDATE `#@__house_distributor_company_customer` SET ".join(',',$sqlArr)." WHERE `id` = ".$value['id']);
        $ret = $dsql->dsqlOper($sql, "update");

        //如果更新成功，就继续下一步操作
        if ($ret == "ok") {
            //更新认领记录的状态
            $sql = $dsql->SetQuery("UPDATE `#@__house_distributor_company_customer_follow_log` SET `status` = 2,`update_time` = ".$nowTime.",`reason` = '未及时处理，已失效' WHERE `follow_uid` = ".$value['follow_uid']." AND `dccid` = ".$value['id']." AND `status` = 1");
            $ret = $dsql->dsqlOper($sql, "update");

            //掉落池子的客户删除除开上个认领人的所有已读记录
            $sql = $dsql->SetQuery("DELETE FROM `#@__house_distributor_company_customer_read` WHERE `dccid` = ".$value['id']." AND `follow_uid` != ".$value['follow_uid']);
            $ret = $dsql->dsqlOper($sql, "update");
        }
    }
}