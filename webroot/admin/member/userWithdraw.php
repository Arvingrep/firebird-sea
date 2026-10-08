<?php
/**
 * 分站佣金提现
 *
 * @version        $Id: commissioncount.php 2015-11-11 上午09:37:12
 * @package        HuoNiao.Member
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
// checkPurview("adminList");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/member";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "userwithdraw.html";

$action = "member_userwithdraw";
if($dopost == "withdraw"){
	global $dsql;
    global $userLogin;
    global $langData;

    $date     = GetMkTime(time());

    global $cfg_minWithdraw;  //起提金额
	global $cfg_maxWithdraw;  //最多提现
	global $cfg_withdrawFee;  //手续费
    global $cfg_maxCountWithdraw;  //每天最多提现次数
    global $cfg_maxAmountWithdraw;  //每天最多提现金额
	global $cfg_withdrawCycle;  //提现周期  0不限制  1每周  2每月
	global $cfg_withdrawCycleWeek;  //周几
	global $cfg_withdrawCycleDay;  //几日
	global $cfg_withdrawPlatform;  //提现平台
    global $cfg_fzwithdrawCheckType;  //付款方式
	global $cfg_withdrawNote;  //提现说明

    $cfg_minWithdraw = (float)$cfg_minWithdraw;
	$cfg_maxWithdraw = (float)$cfg_maxWithdraw;
	$cfg_withdrawFee = (float)$cfg_withdrawFee;
	$cfg_withdrawCycle = (int)$cfg_withdrawCycle;
    $cfg_fzwithdrawCheckType = (int)$cfg_fzwithdrawCheckType;
	$withdrawPlatform = $cfg_withdrawPlatform ? unserialize($cfg_withdrawPlatform) : array('weixin', 'alipay', 'bank');

    $userid = $userLogin->getUserID();
		//提现周期
		if($cfg_withdrawCycle){
			//周几
			if($cfg_withdrawCycle == 1){

				$week = date("w", time());
				if($week != $cfg_withdrawCycleWeek){
					$array = $langData['siteConfig'][34][5];  //array('周日', '周一', '周二', '周三', '周四', '周五', '周六')
                    echo json_encode(array("state" => 200, "info" => str_replace('1', $array[$cfg_withdrawCycleWeek], $langData['siteConfig'][36][0])));die; //当前不可提现，提现时间：每周一
				}

			//几日
			}elseif($cfg_withdrawCycle == 2){

				$day = date("d", time());
				if($day != $cfg_withdrawCycleDay){
                    echo json_encode(array("state" => 200, "info" => str_replace('1', $cfg_withdrawCycleDay, $langData['siteConfig'][36][1])));die;  //当前不可提现，提现时间：每月1日
				}

			}
		}
      if((($bank == 'weixin' || $bank == 'alipay') && !in_array($bank, $withdrawPlatform)) || ($bank != 'weixin' && $bank != 'alipay' && !in_array('bank', $withdrawPlatform))){
            echo json_encode( array("state" => 200, "info" => $langData['siteConfig'][36][2]));die;  //不支持的提现方式
        }

        if($userid == -1){echo json_encode(array("state" => 200, "info" => $langData['siteConfig'][20][262]));die;}  //登录超时，请重新登录！
        if(empty($bank) || ($bank != 'weixin' && (empty($cardnum) || empty($cardname))) || empty($amount)){echo json_encode(array("state" => 200, "info" => $langData['siteConfig'][33][30]));die;}//请填写完整！
        $archives = $dsql->SetQuery("SELECT * FROM `#@__member` WHERE `state` = 1 AND `mtype` != 0 AND `mtype` != 3 AND `id` = " . $userid);
        $detail = $dsql->dsqlOper($archives, "results");
        if(($detail[0]['userType'] == 2 && $detail[0]['licenseState'] != 1) || ($detail[0]['userType'] == 1 && $detail[0]['certifyState'] != 1)){
            echo  json_encode(array("state" => 200, "info" => $langData['siteConfig'][33][49]));die;  //请先进行实名认证
        }
        if($cfg_minWithdraw && $amount < $cfg_minWithdraw){
            echo json_encode( array("state" => 200, "info" => str_replace('1', $cfg_minWithdraw, $langData['siteConfig'][36][3])));die;  //起提金额：1元
        }

        if($cfg_maxWithdraw && $amount > $cfg_maxWithdraw){
           echo json_encode( array("state" => 200, "info" => str_replace('1', $cfg_maxWithdraw, $langData['siteConfig'][36][4])));die;;  //单次最多提现：1元
        }
        //统计当天交易量
        if($cfg_maxCountWithdraw || $cfg_maxAmountWithdraw){
            $start = GetMkTime(date("Y-m-d"));
            $end = $start + 86400;
            $sql = $dsql->SetQuery("SELECT SUM(`amount`) amount, COUNT(`id`) count FROM `#@__member_withdraw` WHERE `uid` = '$userid' AND `tdate` >= $start AND `tdate` < $end");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $todayAmount = $ret[0]['amount'];
                $todayCount = $ret[0]['count'];

                if($cfg_maxCountWithdraw && $todayCount > $cfg_maxCountWithdraw){
                    echo json_encode( array("state" => 200, "info" => str_replace('1', $cfg_maxCountWithdraw, $langData['siteConfig'][36][5])));die;;  //每天最多提现1次
                }

                if($cfg_maxAmountWithdraw && $todayAmount > $cfg_maxAmountWithdraw){
                    echo json_encode( array("state" => 200, "info" => str_replace('1', $cfg_maxAmountWithdraw, $langData['siteConfig'][36][6])));die;;  //每天最多提现1元
                }

            }
        }
        $cityid = $userLogin->getAdminCityIds($userid);
        //分站可提现余额
        $sql = $dsql->SetQuery("SELECT `money` FROM  `#@__site_city` where cid=".$cityid);
        $res = $dsql->dsqlOper($sql,"results");
        if($res[0]['money'] < $amount){echo json_encode( array("state" => 200, "info" => $langData['siteConfig'][21][84]));die;}  //帐户余额不足，提现失败！
        //验证类型
        $realname = $wechat_openid = $wechat_mini_openid = '';
        $sql = $dsql->SetQuery("SELECT `realname`, `wechat_openid`, `wechat_mini_openid` FROM `#@__member` WHERE `id` = " . $userid);
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            $realname = $ret[0]['realname'];
            $wechat_openid = $ret[0]['wechat_openid'];
            $wechat_mini_openid = $ret[0]['wechat_mini_openid'];

            if($bank == 'weixin' && !$wechat_openid && !$wechat_mini_openid){
                echo json_encode( array("state" => 2000, "info" => $langData['siteConfig'][36][7]));die;  //请先绑定微信账号
            }
        }

        $ordernum = create_ordernum();
        // 判断银行卡是否存在
        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__member_withdraw_card` WHERE `uid` = '$userid' AND `bank` = '$bank' AND `cardnum` = '$cardnum' AND `cardname` = '$cardname'");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            $cid = $ret[0]['id'];
        }else{
            //添加银行卡
            $sql = $dsql->SetQuery("INSERT INTO `#@__member_withdraw_card` (`uid`, `bank`, `cardnum`, `cardname`, `date`) VALUES ('$userid', '$bank', '$cardnum', '$cardname', '$date')");
            $cid = $dsql->dsqlOper($sql, "lastid");
        }
        if(is_numeric($cid)){
//            $shouxu  = $amount * $cfg_withdrawFee / 100 ;       //手续费
//            $shouxu  = sprintf("%.2f", $shouxu);
//            $amount_ = $cfg_withdrawFee ? $amount * (100 - $cfg_withdrawFee) / 100 : $amount;
            $shouxu = 0;
            $amount_ = $amount;
            $amount_ = sprintf("%.2f", $amount_);
            //会员申请后自动付款
            if(!$cfg_fzwithdrawCheckType && ($bank == 'weixin' || $bank == 'alipay')){

                //微信提现
                if($bank == "weixin"){
                    $order = array(
                        'ordernum' => $ordernum,
                        'openid' => $wechat_openid,
                        'wechat_mini_openid' => $wechat_mini_openid,
                        'name' => $realname,
                        'amount' => $amount_
                    );

                    require_once(HUONIAOROOT."/api/payment/wxpay/wxpayTransfers.php");
                    $wxpayTransfers = new wxpayTransfers();
                    $return = $wxpayTransfers->transfers($order);

					if($return['state'] != 100){

						// 加载支付方式操作函数
				        loadPlug("payment");
				        $payment = get_payment("wxpay");
                        //如果网页支付配置的账号失败了，使用APP支付配置的账号重试
					    if($payment['APP_APPID']){
							require_once(HUONIAOROOT."/api/payment/wxpay/wxpayTransfers.php");
							$wxpayTransfers = new wxpayTransfers();
							$return = $wxpayTransfers->transfers($order, true);

							if($return['state'] != 100){
								return json_encode($return);
							}
						}else{
							return json_encode($return);
						}

					}
                }else{
                    if($realname != $cardname){
                        echo json_encode( array("state" => 200, "info" => $langData['siteConfig'][36][8]));die;  //申请失败，提现到的账户真实姓名与实名认证信息不一致！
                    }
                    $order = array(
                        'ordernum' => $ordernum,
                        'account' => $cardnum,
                        'name' => $cardname,
                        'amount' => $amount_
                    );

                    require_once(HUONIAOROOT."/api/payment/alipay/alipayTransfers.php");
                    $alipayTransfers = new alipayTransfers();
                    $return = $alipayTransfers->transfers($order);

                    if($return['state'] != 100){
                        echo $return;die;
                    }
                }
                $rdate = $return['date'];
                $payment_no = $return['payment_no'];

                $note = '提现成功，付款单号：'. $payment_no;

                //扣除余额
                $archives = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` - '$amount' WHERE `id` = '$userid'");
                $dsql->dsqlOper($archives, "update");
                $user  = $userLogin->getMemberInfo($userid);
                $usermoney = $user['money'];
//                $money = sprintf('%.2f',($usermoney - $amount));
                //保存操作日志
        		$archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`balance`) VALUES ('$userid', '0', '$amount', '分站佣金提现：$payment_no', '$rdate','member','tixian','$usermoney')");
        		$dsql->dsqlOper($archives, "update");

                //生成提现记录
                $sql = $dsql->SetQuery("INSERT INTO `#@__member_withdraw` (`uid`, `bank`, `cardnum`, `cardname`, `amount`, `tdate`, `state`, `note`, `rdate`,`proportion`,`price`,`shouxuprice`, `type`, `usertype`) VALUES ('$userid', '$bank', '$cardnum', '$cardname', '$amount', '$date', 1, '$note', '$rdate','$cfg_withdrawFee','$amount_','$shouxu', 1,0)");
                $wid = $dsql->dsqlOper($sql, "lastid");

                if(is_numeric($wid)){

                    //自定义配置
                    $param = array(
            				"service"  => "member",
            				"type"     => "user",
            				"template" => "withdraw_log_detail",
            				"id"       => $wid
        			);

        			$config = array(
        				"username" => $realname,
        				"amount" => $amount,
        				"date" => date("Y-m-d H:i:s", $rdate),
        				"info" => $note,
        				"fields" => array(
        					'keyword1' => '提现金额',
        					'keyword2' => '提现时间',
        					'keyword3' => '提现状态'
        				)
        			);

                    updateAdminNotice($userid, "会员-提现申请审核通过", $param, $config);

                    return $wid;
                }else{
                    //如果数据库写入失败，返回字符串，前端跳到提现列表页
                    return 'error';
                }

            }

            //生成提现记录
            $sql = $dsql->SetQuery("INSERT INTO `#@__member_withdraw` (`uid`, `bank`, `cardnum`, `cardname`, `amount`, `tdate`, `state`,`type`,`proportion`,`price`,`shouxuprice`,`usertype`) VALUES ('$userid', '$bank', '$cardnum', '$cardname', '$amount', '$date', 0,1,'$cfg_withdrawFee','$amount_','$shouxu',0)");
            $wid = $dsql->dsqlOper($sql, "lastid");
            if(is_numeric($wid)){
                $time  = GetMktime(time());
                // 减去余额、
                $archives = $dsql->SetQuery("UPDATE `#@__site_city` SET `money` = `money` - '$amount' WHERE `cid` = '$cityid'");
                $dsql->dsqlOper($archives, "update");

                //增加操作日志
                $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`cityid`,`commission`,`ordertype`,`platform`,`showtype`,`ctype`,`balance`,`substation`) VALUES ('$userid', '0', '$amount', '提现', '$time','$cityid','$amount','member','','1','tixian','','')");
                $lastid = $dsql->dsqlOper($archives, "lastid");
                substationAmount($lastid,$cityid);

                echo json_encode(array("state" => 100, "info" => $langData['siteConfig'][33][41]));die;
            }else{

                echo json_encode(array("state" => 200, "info" => $langData['siteConfig'][21][85].'_201'));die;  //提交失败！
            }

        }else{
            echo json_encode( array("state" => 200, "info" => $langData['siteConfig'][21][85].'_200'));die;  //提交失败！
        }
}

//验证模板文件
if(file_exists($tpl."/".$templates)){
  $userid = $userLogin->getUserID();
  $sql = $dsql->SetQuery("SELECT `nickname` ,`alicard` ,`wechat_openid` FROM  `#@__member` where id=".$userid);
  $results = $dsql->dsqlOper($sql,"results");
  $cityid = (int)$userLogin->getAdminCityIds($userid);
  //可提现余额
  $sql = $dsql->SetQuery("SELECT `money` FROM  `#@__site_city` where cid=".$cityid);
  $res = $dsql->dsqlOper($sql,"results");
  if($res){
      $huoniaoTag->assign('fzmoney',$res);
  }else{
    $huoniaoTag->assign('fzmoney',array(
        array('money' => 0)
    ));
  }
  $huoniaoTag->assign('txinfo', $results);
  $huoniaoTag->assign('userid',$userid);
	//css
	$cssFile = array(
	  'ui/jquery.chosen.css',
	  'admin/chosen.min.css'
	);
	$huoniaoTag->assign('cssFile', includeFile('css', $cssFile));

	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'ui/bootstrap-datetimepicker.min.js',
		'ui/chosen.jquery.min.js',
		'admin/member/userwithdraw.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('cityArr', $userLogin->getAdminCity());
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/member";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
