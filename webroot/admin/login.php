<?php
/**
 * 后台登陆
 *
 * @version        $Id: login.php 2013-7-7 上午10:33:36 $
 * @package        HuoNiao.Administrator
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
require_once(dirname(__FILE__).'/../include/common.inc.php');
$tpl = dirname(__FILE__)."/templates";
$huoniaoTag->caching         = FALSE;
$huoniaoTag->compile_dir  = HUONIAOROOT."/templates_c/admin";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$dsql = new dsql($dbo);
$userLogin = new userLogin($dbo);
$rember = $rember != 1 ? 0 : 1;

//判断是否已登录（用于异步数据出错时判断是否登录，超时则刷新当前页面）
if($action == "checkLogin"){
	if($userLogin->getUserID()==-1){
		echo "0";
	}else{
		echo "1";
	}
	die;
}

//登录检测
if($dopost=='login'){

    $type = (int)$type;

    //用户名密码登录
	if($type == 0){
        if(!empty($userid) && !empty($pwd)){
            $res = $userLogin->checkUser($userid,$pwd,true);

            //success
            if($res == 1){
                //自动登录，有效期7天
                if($rember == 1){
                    $userLogin->keepUser();
                }

                $userid = $userLogin->getUserID();
                $archives = $dsql->SetQuery("INSERT INTO `#@__adminlogin` (`userid`, `logintime`, `loginip`, `ipaddr`, `type`) VALUES ($userid, ".GetMkTime(time()).", '".GetIP().':'.getRemotePort()."', '".getIpAddr(GetIP())."', 0)");
                $dsql->dsqlOper($archives, "update");

                echo '{"state": 100, "info": "登录成功！"}';
                die;

            //error
            }else if($res == -1 || $res == -2){

                $ip = GetIP();
                $archives = $dsql->SetQuery("SELECT * FROM `#@__failedlogin` WHERE `ip` = '$ip'");
                $results = $dsql->dsqlOper($archives, "results");

                //如果有记录则错误次数加1
                if($results){
                    $timedifference = GetMkTime(time()) - $results[0]['date'];
                    //计算最后一次错误是否是在15分钟之前，如果是则重置错误次数
                    if($timedifference/60 > 15){
                        $count = 1;
                    }else{
                        $count = $results[0]['count'];
                        $count++;
                    }
                    $archives = $dsql->SetQuery("UPDATE `#@__failedlogin` SET `count` = ".$count.", `date` = ".GetMkTime(time())." WHERE `ip` = '".$ip."'");
                    $results = $dsql->dsqlOper($archives, "update");

                //没有记录则新增一条
                }else{
                    $count = 1;
                    $archives = $dsql->SetQuery("INSERT INTO `#@__failedlogin` (`ip`, `count`, `date`) VALUES ('$ip', $count, ".GetMkTime(time()).")");
                    $results = $dsql->dsqlOper($archives, "update");
                }

                echo '{"state": 200, "info": "用户名或密码错误，请重试！", "count": '.$count.'}';
                die;

            }else if($res == -3){
                echo '{"state": 300, "info": "帐号处于锁定状态，暂时无法登录，请联系管理员!"}';
                die;

            }else if($res == -4){
                echo '{"state": 300, "info": "该帐号已过期，登录失败，如有疑问请联系管理员!"}';
                die;
            }
        }

        //password empty
        else{
            echo '{"state": 300, "info": "用户名和密码没有填写完整!"}';
            die;
        }
    }
    //短信
    elseif($type == 1){
        
        $phone = (int)$phone;
        $code = (int)$code;

        if(!empty($phone) && !empty($code)){

            $res = $userLogin->checkAdminUserByPhone($phone,$code);

            //success
            if($res == 1){
                //自动登录，有效期7天
                if($rember == 1){
                    $userLogin->keepUser();
                }

                $userid = $userLogin->getUserID();
                $archives = $dsql->SetQuery("INSERT INTO `#@__adminlogin` (`userid`, `logintime`, `loginip`, `ipaddr`, `type`) VALUES ($userid, ".GetMkTime(time()).", '".GetIP().':'.$_SERVER['REMOTE_PORT']."', '".getIpAddr(GetIP())."', 1)");
                $dsql->dsqlOper($archives, "update");

                echo '{"state": 100, "info": "登录成功！"}';
                die;

            //error
            }else if($res == -1){
                echo '{"state": 300, "info": "手机号码未绑定管理员！"}';
                die;

            }else if($res == -2){
                echo '{"state": 300, "info": "帐号处于锁定状态，暂时无法登录，请联系管理员!"}';
                die;
            }else{
                echo '{"state": 300, "info": "'.$res.'"}';
                die;
            }

        }else{
            echo '{"state": 300, "info": "手机号码和验证码没有填写完整!"}';
            die;
        }
        
    }

}

//检验用户登录状态
if($userLogin->getUserID()!=-1){
    header("location:index.php");
    exit();
}

//登录成功后跳转页面
if(!empty($gotopage)) {
	$gotopage = urlencode(htmlspecialchars(RemoveXSS($gotopage)));
}

//模板标签赋值
$huoniaoTag->assign("gotopage", $gotopage);

//验证模板文件
$templates = "login_2.0.html";
if(file_exists($tpl."/".$templates)){

	//js
	$jsFile = array(
		'admin/login.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$ip = GetIP();
	$archives = $dsql->SetQuery("SELECT * FROM `#@__failedlogin` WHERE `ip` = '$ip'");
	$results = $dsql->dsqlOper($archives, "results");
	if($results){
		//验证错误次数，并且上次登录错误是在15分钟之内
		if($results[0]['count'] >= 5){
			$timedifference = GetMkTime(time()) - $results[0]['date'];
			if($timedifference/60 < 15){
				$huoniaoTag->assign('failedlogin', 1);
			}
		}
	}

    $huoniaoTag->assign('cfg_weblogo', getFilePath($cfg_weblogo));  //网站LOGO
    $huoniaoTag->assign('cfg_adminlogo', getFilePath($cfg_adminlogo));  //后台LOGO

    //是否为手机端访问
    $huoniaoTag->assign('isMobile', isMobile() ? 1 : 0);

	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
