<?php if (!defined('HUONIAOINC')) exit('Request Error!');
/**
 * 商家会员自动提现
 *
 *
 * @version        $Id: member_autoWithdraw.php 2023-2-15 下午14:08:26 $
 * @package        HuoNiao.cron
 * @copyright      Copyright (c) 2013, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

global $userLogin;

global $cfg_businessAutoWithdrawState;  //功能状态  0关闭  1开启
global $cfg_businessAutoWithdrawCycle;  //提现时间类型  0每周几  1每月几日
global $cfg_businessAutoWithdrawCycleWeek;  //周几
global $cfg_businessAutoWithdrawCycleDay;  //几日
global $cfg_businessAutoWithdrawAmount;  //最小金额

global $cfg_withdrawFee;  //手续费
global $cfg_withdrawJfFee;  //提现扣积分比例
$cfg_withdrawFee = (int)$cfg_withdrawFee;
$cfg_withdrawJfFee = (int)$cfg_withdrawJfFee;

$businessAutoWithdrawState = (int)$cfg_businessAutoWithdrawState;
$businessAutoWithdrawCycle = (int)$cfg_businessAutoWithdrawCycle;
$businessAutoWithdrawCycleWeek = (int)$cfg_businessAutoWithdrawCycleWeek;
$businessAutoWithdrawCycleDay = (int)$cfg_businessAutoWithdrawCycleDay;
$businessAutoWithdrawAmount = (float)$cfg_businessAutoWithdrawAmount;

global $cfg_withdrawWxVersion; //微信支付版本，如果是4.0版本，则需要校验金额是否大于每笔限额
global $cfg_businessAutoWithdrawMaxV4; //单笔限额

if (!$businessAutoWithdrawState) return false;

//周几
if ($businessAutoWithdrawCycle == 1) {

    $week = date("w", time());
    if ($week != $businessAutoWithdrawCycleWeek) {
        return false;
    }
}
//几日
elseif ($businessAutoWithdrawCycle == 2) {

    $day = date("d", time());
    if ($day != $businessAutoWithdrawCycleDay) {
        return false;
    }
}

//查询所有符合条件的企业会员
$where = "";

if ($businessAutoWithdrawAmount > 0) {
    $where = " AND `money` >= $businessAutoWithdrawAmount";
} else {
    $where = " AND `money` > 0";
}

//如果是微信转账4.0版本，就只提现有外卖商家端微信openid的商家账号
if ((int)$cfg_withdrawWxVersion == 4) {
    $where .= " AND `wechat_wmsj_openid` != ''";
}

//每次操作1000个会员
$sql = $dsql->SetQuery("SELECT `id`, `realname`, `money`, `point`, `wechat_openid`, `wechat_mini_openid` FROM `#@__member` WHERE `mtype` = 2 AND `certifyState` = 1 AND `realname` != '' AND (`wechat_openid` != '' OR `wechat_mini_openid` != '')" . $where . " ORDER BY `id` ASC");
$ret = $dsql->dsqlOper($sql, "results");
if ($ret) {
    foreach ($ret as $key => $value) {

        $userid = $value['id'];
        $realname = $value['realname'];
        $wechat_openid = $value['wechat_openid'];
        $wechat_mini_openid = $value['wechat_mini_openid'];
        $amount = (float)$value['money'];
        $point = $value['point'];

        $source = 3;

        //如果是微信转账4.0版本，就判断单笔金额是否超出了限额
        if ((int)$cfg_withdrawWxVersion == 4) {
            if ($amount > (float)$cfg_businessAutoWithdrawMaxV4) {
                $amount = (float)$cfg_businessAutoWithdrawMaxV4;
            }
        }

        $shouxu  = (float)sprintf("%.2f", $amount * $cfg_withdrawFee / 100);   //手续费
        $amount_ = $cfg_withdrawFee ? $amount * (100 - $cfg_withdrawFee) / 100 : $amount;
        $amount_ = (float)sprintf("%.2f", $amount_);

        //提现扣积分
        $tixianJifen = $amount * $cfg_withdrawJfFee / 100;
        if ($point >= $tixianJifen) {


            //生成提现记录
            $date = GetMkTime(time());
            $sql = $dsql->SetQuery("INSERT INTO `#@__member_withdraw` (`uid`, `bank`, `cardnum`, `cardname`, `amount`, `tdate`, `state`,`proportion`,`price`,`shouxuprice`,`pointRate`,`point`,`isauto`,`source`) VALUES ('$userid', 'weixin', '', '', '$amount', '$date', 0,'$cfg_withdrawFee','$amount_','$shouxu','$cfg_withdrawJfFee',$tixianJifen,1,'$source')");
            $wid = $dsql->dsqlOper($sql, "lastid");

            if (is_numeric($wid)) {

                $archives = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` - '$amount', `freeze` = `freeze` + '$amount' WHERE `id` = '$userid'");
                $dsql->dsqlOper($archives, "update");

                //记录用户行为日志
                memberLog($userid, 'member', 'withdraw', $wid, 'insert', '账户自动提现(' . $amount . '元)', '', $sql);

                //生成交易日志，针对不自动到账的情况，后台审核通过后，再更新此条记录
                $user  = $userLogin->getMemberInfo($userid);
                $usermoney = $user['money'];
                $money = sprintf('%.2f', $usermoney);
                $title = '余额提现';
                $ordernum = create_ordernum();
                $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`title`,`ordernum`,`balance`,`pid`) VALUES ('$userid', '0', '$amount', '$title', '$date','member','tixian','$title','$ordernum','$money','$wid')");
                $dsql->dsqlOper($archives, "update");

                //扣除积分
                if ($tixianJifen > 0) {
                    $archives = $dsql->SetQuery("UPDATE `#@__member` SET `point` = `point` - $tixianJifen WHERE `id` = '$userid'");
                    $dsql->dsqlOper($archives, "update");

                    //积分日志
                    $user  = $userLogin->getMemberInfo($userid);
                    $userpoint = $user['point'];
                    $archives = $dsql->SetQuery("INSERT INTO `#@__member_point` (`userid`, `type`, `amount`, `info`, `date`,`ctype`,`balance`) VALUES ('$userid', '0', '$tixianJifen', '提现扣除', '$date','tixian','$userpoint')");
                    $dsql->dsqlOper($archives, "update");
                }
            }
        }
    }
}
