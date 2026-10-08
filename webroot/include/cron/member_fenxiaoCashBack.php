<?php   if(!defined('HUONIAOINC')) exit('Request Error!');
/**
 * 分销商固定上级模式每隔30天返现
 *
 *
 * @version        $Id: member_fenxiaoCashBack.php 2020-09-16 下午17:09:25 $
 * @package        HuoNiao.cron
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

global $cfg_fenxiaoType;
global $cfg_fenxiaoLevel;
global $userLogin;

$fenxiaoLevel = $cfg_fenxiaoLevel ? unserialize($cfg_fenxiaoLevel) : array();
$time = GetMkTime(time());

if($cfg_fenxiaoType && $fenxiaoLevel){

	$sql = $dsql->SetQuery("SELECT u.`id`, u.`uid`, u.`level`, u.`back`, u.`backtime`, u.`backcount`, u.`pubdate`, m.`nickname` FROM `#@__member_fenxiao_user` u LEFT JOIN `#@__member` m ON m.`id` = u.`uid` WHERE u.`state` = 1 AND m.`id` != ''");
	$ret = $dsql->dsqlOper($sql, "results");
	if($ret){
		foreach ($ret as $key => $value) {
			$id = $value['id'];   //分销商ID
			$uid = $value['uid'];   //会员ID
			$level = $value['level'];  //分销商等级
			$back = (int)$value['back'];  //剩余返现
			$backtime = (int)$value['backtime'];  //最后返现时间
			$nickname = $value['nickname'];  //用户昵称
			$backcount = $value['backcount'];  //已经返现次数
			$pubdate = $value['pubdate'];  //分销商入驻时间

			$fxCash = $fenxiaoLevel[$level]['back'];  //每月应返
			$fxCashCount = $fenxiaoLevel[$level]['count'];  //返现次数

			//是否有一个月
			if($backtime == 0){  //没有返过的，按入驻时间算
				$bt = strtotime("+1months", $pubdate);  //入驻时间的下个月

			}else{  //返过的，按上次返的时间算
				$bt = strtotime("+1months", $backtime);  //返现时间的下个月
			}

			$tian = $time >= $bt ? true : false;

			if($fxCash && $tian && $fxCashCount > $backcount){
				$_cash = $fxCash;

				//更新分销商信息
				$archives = $dsql->SetQuery("UPDATE `#@__member_fenxiao_user` SET `back` = `back` - $_cash, `backtime` = $time, `backcount` = `backcount` + 1 WHERE `id` = ".$id);
				$aid = $dsql->dsqlOper($archives, "lastid");
                $user  = $userLogin->getMemberInfo($uid);
                $usermoney = $user['money'];
                $money   = sprintf('%.2f',($usermoney+$_cash));
				//会员账户余额日志
				$archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`, `montype`, `ordertype`,`ctype`,`balance`) VALUES ('$uid', '1', '$_cash', '分销商每月返现', '$time', '1','member','chongzhi','$money')");
				$aid = $dsql->dsqlOper($archives, "lastid");

				//更新余额
				$archives = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` + $_cash WHERE `id` = ".$uid);
				$aid = $dsql->dsqlOper($archives, "lastid");

				//消息通知
				$param = array(
					"service"  => "member",
					"type"     => "user",
					"template" => "record"
				);

	            $config = array(
	                "username" => $nickname,
	                "amount" => "+".$_cash,
	                "money" => $_cash,
	                "date" => date("Y-m-d H:i:s", $time),
	                "info" => "分销商每月返现",
	                "fields" => array(
	                    'keyword1' => '变动类型',
	                    'keyword2' => '变动金额',
	                    'keyword3' => '变动时间',
	                    'keyword4' => '帐户余额'
	                )
	            );

				updateMemberNotice($uid, "会员-帐户资金变动提醒", $param, $config);
			}
		}
	}

}
