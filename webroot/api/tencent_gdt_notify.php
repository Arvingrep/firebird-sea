<?php
//优量汇安卓激励广告奖励发放服务端回调验证
//用于付费查询电话的看广告解锁电话功能
//广告id、媒体id和密钥(secret)在后台-系统-付费查看电话的基本设置中配置
//客户端需要配置extrainfo字段，值为调用payPhoneDeal接口后返回的ordernum订单号
//例：/include/ajax.php?action=tencentGdtRewardVideoNotify&pid=广告位ID&appid=媒体ID&transid=交易id&userid=用户id&extrainfo=订单号&sig=签名
//sig = sha256(transid:secret)

require_once(dirname(__FILE__).'/../include/common.inc.php');

global $cfg_tencentGDT_secret;  //在优量汇媒体平台输入服务端URL时获取到的密钥

$secret = $cfg_tencentGDT_secret;
$sign = hash('sha256', $transid.':'.$secret);

$extrainfo = $_REQUEST['extrainfo'];
$extrainfo = json_decode($extrainfo, true);
$ordernum = $extrainfo['ordernum'];

//验证签名
if($sign == $sig){
    
    //验证订单
    $sql = $dsql->SetQuery("SELECT * FROM `#@__pay_log` WHERE `ordernum` = '$ordernum'");
    $ret = $dsql->dsqlOper($sql, "results");
    if($ret){

        $_id = (int)$ret[0]['id'];
        
        //更新订单状态
        $sql = $dsql->SetQuery("UPDATE `#@__pay_log` SET `state` = 1 WHERE `id` = '$_id'");
        $dsql->dsqlOper($sql, "update");

        $uid = $ret[0]['uid'];
        $body = $ret[0]['body'];
        $amount = $ret[0]['amount'];
        $paytype = $ret[0]['paytype'];
        $pubdate = $ret[0]['pubdate'];

        $bodyArr = unserialize($body);

        $cityid = $bodyArr['cityid'];
        $module = $bodyArr['module'];
        $temp   = $bodyArr['temp'];
        $aid    = $bodyArr['aid'];
        $title  = $bodyArr['title'];
        $url    = serialize($bodyArr['url']);

        //增加订单记录
        $sql = $dsql->SetQuery("INSERT INTO `#@__site_pay_phone` (`ordernum`, `cityid`, `uid`, `module`, `temp`, `aid`, `title`, `url`, `paytype`, `amount`, `pubdate`) VALUES ('$ordernum', '$cityid', '$uid', '$module', '$temp', '$aid', '$title', '$url', '', '$amount', '$pubdate')");
        $dsql->dsqlOper($sql, "update");

        //记录用户行为日志
        memberLog($uid, 'siteConfig', 'payPhone', 0, 'insert', '看广告查看电话_APP('.$module.'=>'.$temp.'=>'.$aid.')', '', $sql);            

        //删除5分钟之前的看广告解锁电话订单记录
        $_time = GetMkTime(time()) - 300;
        $sql = $dsql->SetQuery("DELETE FROM `#@__site_pay_phone` WHERE `paytype` = '' AND `pubdate` < " . $_time);
        $dsql->dsqlOper($sql, "update");


        die('success');

    }
    else{
        header('HTTP/1.1 401 Unauthorized');
        die;
    }

}
else{
    header('HTTP/1.1 401 Unauthorized');
    die;
}