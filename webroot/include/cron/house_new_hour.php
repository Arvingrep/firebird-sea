<?php   if(!defined('HUONIAOINC')) exit('Request Error!');
/**
 * 新房产计划任务，每小时执行一次
 * 
 * 1、被停用的经纪人，48小时后自动被删除，执行删除后的操作，将客源、房源角色、客户委托自动转交给上级，没有上级就直接转交给店长
 * 2、更新计算经纪人专业分
 * 3、成交合同平台驳回 超过48小时无法提交资料进入失效状态
 */

$nowTime = GetMkTime(time()); //现在时间

//被停用的经纪人，48小时后自动被删除，执行删除后的操作，将客源、房源角色、客户委托自动转交给上级，没有上级就直接转交给店长
//先查询停用超过48小时的经纪人
$timeHour48 = $nowTime - 48*3600;
$sql = $dsql->SetQuery("SELECT `id`,`gid`,`dcoid`,`uid` FROM `#@__house_distributor_company_user` WHERE `uid` > 0 AND `dcoid` > 0 AND `status` = 2 AND `update_time` < ".$timeHour48);
$result = $dsql->dsqlOper($sql, "results");
if ($result != null && is_array($result)) {
    //经纪公司数据数组，避免重复查询
    $companyArr = array();

    require(HUONIAOROOT."/api/handlers/house/distributor.config.php");

    foreach ($result as $value) {
        //查询经纪公司信息
        if (!isset($companyArr[$value['dcoid']])) {
            $sql = $dsql->SetQuery("SELECT `uid`,`name` FROM `#@__house_distributor_company` WHERE `id` = ".$value['dcoid']." AND `del` = 0");
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret != null && is_array($ret)) {
                $companyArr[$value['dcoid']] = $ret[0];
            } else {
                $companyArr[$value['dcoid']] = array();
            }
        }

        //不是店长才进行删除操作
        $companyInfo = $companyArr[$value['dcoid']];
        if ($companyInfo != null && $companyInfo['uid'] != $value['uid']) {
            //更新用户表
            $sql = $dsql->SetQuery("UPDATE `#@__house_distributor_company_user` SET `dcoid` = 0,`status` = 0,`update_time` = '".$nowTime."' WHERE `id` = ".$value['id']);
            $ret = $dsql->dsqlOper($sql, "update");
            if ($ret == 'ok') {
                //插入一条经纪人和公司的关联记录
                $sql = $dsql->SetQuery("INSERT INTO `#@__house_distributor_company_user_join` (`dcoid`, `uid`, `join_time`, `join_status`, `reject_reason`, `update_time`) VALUES ('".$value['dcoid']."', '".$value['uid']."', '".$nowTime."', '5', '经纪人被经纪公司停用超过48小时，自动删除', '".$nowTime."')");
                $lastid = $dsql->dsqlOper($sql, "lastid");

                //经纪人被删除后，客源、房源角色、客户委托自动转交给上级，没有上级就直接转交给店长
                handOverAfterDelBroker($value['uid'],$value['dcoid'],$value['gid']);
            }
        }
    }
}


//更新计算经纪人专业分，每次只计算最多2000人
$sql = $dsql->SetQuery("SELECT `id`, `dcoid`, `uid`, `create_time`, `goodRate` FROM `#@__house_distributor_company_user` WHERE `status` = 1 ORDER BY `execution_time` ASC LIMIT 2000");
$result = $dsql->dsqlOper($sql, "results");
if($result != null && is_array($result)){
    foreach ($result as $value) {
        $majorScore = 5;
        //入驻时间少于6月，扣除0.2
        if ($nowTime - (int)$value['create_time'] < 180 * 86400) {
            $majorScore -= 0.2;
        }
        //好评率小于100%，每1%扣除0.1
        $majorScore -= (100 - round($value['goodRate']))*0.1;

        //客户数量
        $sql = $dsql->SetQuery("SELECT count(`id`) FROM `#@__house_distributor_company_customer` WHERE `del` = 0 AND `transform` = 1 AND `follow_status` = 2 AND `tradeType` > 3 AND `main` = 1 AND `follow_uid` = ".$value['uid']." AND `dcoid` = ".$value['dcoid']);
        $customer = (int)$dsql->getOne($sql);

        //客户量每100+0.1
        $majorScore += round($customer/100)*0.1;
        $majorScore = round($majorScore,1);
        if ($majorScore < 0) {
            $majorScore = 0;
        }

        //更新用户表
        $sql = $dsql->SetQuery("UPDATE `#@__house_distributor_company_user` SET `majorScore` = ".$majorScore.",`execution_time` = '".$nowTime."' WHERE `id` = ".$value['id']);
        $ret = $dsql->dsqlOper($sql, "update");
    }
}


//成交合同平台驳回 超过48小时无法提交资料进入失效状态
$sql = $dsql->SetQuery("UPDATE `#@__house_property_deal_contract` SET `contract_status`=4, `invalid_status`=1, `invalid_reason`='平台驳回未操作已超48小时' WHERE `audit_performance`=5 AND  `reject_time`< $timeHour48");
$dsql->dsqlOper($sql, "update");
