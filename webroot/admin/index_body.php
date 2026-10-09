<?php
/**
 * 管理后台首页主体
 *
 * @version        $Id: index_body.php 2013-7-13 下午12:52:05 $
 * @package        HuoNiao.Administrator
 * @copyright      Copyright (c) 2013 - 2015, HuoNiao, Inc.
 * @link           http://www.huoniao.co/
 */
define('HUONIAOADMIN', "." );
require_once(dirname(__FILE__)."/inc/config.inc.php");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/templates";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录

if (testPurview("adminIndex")) {
    $huoniaoTag->assign('pruview', 1);
};

include_once(HUONIAOINC.'/config/siteConfig.inc.php');
include_once(HUONIAOINC.'/dbinfo.inc.php');

//获取数据库尺寸
if($dopost == "getMysqlSize"){

    $connection = @mysqli_connect($GLOBALS['DB_HOST'], $GLOBALS['DB_USER'], $GLOBALS['DB_PASS']);
    if($connection === false){
        echo '{"state": 200, "mysqlSize": "无法连接数据库！' . mysqli_connect_error() . '"}';
        die;
    }
    $serverset = 'character_set_connection=utf8, character_set_results=utf8, character_set_client=binary';
    $serverset .= @mysqli_get_server_info($connection) > '5.0.1' ? ', sql_mode=\'\'' : '';
    @mysqli_query($connection, "SET $serverset");
    if(!@mysqli_select_db($connection, $GLOBALS['DB_NAME'])){
        @mysqli_close($connection);
        echo '{"state": 200, "mysqlSize": "无法使用数据库！"}';
        die;
    }

    $dbsize = 0;
    $tables = $dsql->query($connection, "show table status");
    foreach($tables as $table) {
        $dbsize += $table['Data_length'] + $table['Index_length'];
    }
    $dbsize = $dbsize ? _sizecount($dbsize) : '未知';

	echo '{"state": 100, "mysqlSize": "'.$dbsize.'"}';
	die;
}

//获取最新版本
if($dopost == "checkUpdate"){
    $ret = checkSystemUpdate();
    if($ret){
        die(json_encode($ret));
    }
    die;
}

if($dopost == "realtimedata"){
    //在线总人数 ,总人数
    $realtimedata = array();
    $time = time();
    $sql = $dsql->SetQuery("SELECT count(`id`) total, (SELECT count(`id`) FROM `#@__member` WHERE `state` = 1 AND (`mtype` = 1 OR `mtype` = 2) AND $time - `online` <= 300) online FROM `#@__member` WHERE `state` = 1 AND (`mtype` = 1 OR `mtype` = 2)");
    $ret = $dsql->dsqlOper($sql, "results");
    if($ret){
        $realtimedata['total'] = $ret[0]['total'];
        $realtimedata['online'] = $ret[0]['online'];
    }
    //查询今日总收益
    $start_time=strtotime(date("Y-m-d",time()));
    $end_time=$start_time+3600*24;

    $profitsql = $dsql->SetQuery("SELECT SUM( case when `montype` = 1 then `amount` else 0 end) as czamount , SUM(`platform`) as platform   FROM `#@__member_money` WHERE `date` >= $start_time AND `date` <= $end_time");
    $allprofit = $dsql->dsqlOper($profitsql, "results");
    $allincome = $allprofit[0]['czamount'] + $allprofit[0]['platform'];
    $realtimedata['allincome'] = $allincome;

    //今日新增会员 regtime
    $newaddsql = $dsql->SetQuery("SELECT count(`id`) allnew FROM `#@__member` WHERE `regtime` > $start_time");
    $newadd = $dsql->dsqlOper($newaddsql, "results");
    $realtimedata['newadd'] = $newadd[0]['allnew'];

    $return = [
            'state' => '100',
            'info' =>	$realtimedata
        ];
        echo json_encode($return);die;
}

//验证模板文件
$templates = "index_body.html";
if(file_exists($tpl."/".$templates)){

	//js
	$huoniaoTag->assign('jsFile', includeFile('js'));

	$huoniaoTag->assign("cfg_basehost", $cfg_secureAccess.$cfg_basehost);
	$huoniaoTag->assign("server_port", $_SERVER['SERVER_PORT']);

	$softVersion = getSoftVersion();
	$siteVersion  = explode("\n", $softVersion);  // 0：版本号  1：升级时间
	$version = trim($siteVersion[0]);

	$huoniaoTag->assign("update_version", $version);
	$huoniaoTag->assign("php_uname_s", php_uname('s'));
	$huoniaoTag->assign("php_uname_r", php_uname('r'));
	$huoniaoTag->assign("server_software", $_SERVER["SERVER_SOFTWARE"]);
	$huoniaoTag->assign("PHP_VERSION", PHP_VERSION);

	$huoniaoTag->assign("mysqlinfo", $dsql->getDriverVersion());

	$max_upload = ini_get("file_uploads") ? ini_get("upload_max_filesize") : "Disabled";
	$huoniaoTag->assign("max_upload", $max_upload);

	$huoniaoTag->assign("DB_CHARSET", $DB_CHARSET);

	$huoniaoTag->assign("cfg_bbsState", $cfg_bbsState);
	$huoniaoTag->assign("cfg_bbsType", $cfg_bbsType);

	// 服务器信息
	$huoniaoTag->assign("server_ip", get_server_ip());
	$huoniaoTag->assign("server_time", date("Y-m-d H:i:s", time()));
	$huoniaoTag->assign("server_dir", HUONIAOROOT);

	//在线支付接口接入情况
	//查询数据库中启用的支付方式
    $pay_list = array();
	$archives = $dsql->SetQuery("SELECT * FROM `#@__site_payment` ORDER BY `weight`, `id`");
	$results  = $dsql->dsqlOper($archives, "results");
	foreach($results as $key => $val){
		$pay_list[$val['pay_code']] = $results[$key];
	}

    //取得文件中的支付方式
	$payPath = '../api/payment/';
	$paydir = @opendir($payPath);
    $set_modules = true;
    $payment = $installArr = $uninstallArr = array();

    while(false !== ($subdir = @readdir($paydir))){
		if(is_dir($payPath.$subdir) && $subdir != ".." && $subdir != "."){
            @include_once($payPath . $subdir. '/' . $subdir. '.php');
        }
    }
    @closedir($paydir);

    foreach ($payment as $key => $value){
        ksort($payment[$key]);
    }
    ksort($payment);

    for($i = 0; $i < count($payment); $i++){
        $code = $payment[$i]['pay_code'];
        /* 如果数据库中有，取数据库中的名称和描述 */
        if(isset($pay_list[$code])){
			$in = isset($installArr) ? count($installArr) : 0;
            $installArr[] = $pay_list[$code]['pay_name'];
        }else{
			$un = isset($uninstallArr) ? count($uninstallArr) : 0;
            $uninstallArr[] = $payment[$i]['pay_name'];
        }
    }

	$install = join("<span style='color:#2672ec;'>[已集成]</span>、", $installArr);
	$install = !empty($install) ? $install."<span style='color:#2672ec;'>[已集成]</span>" : "";

	$uninstall = join("<span>[NO]</span>、", $uninstallArr);
	$uninstall = !empty($uninstall) ? $uninstall."<span>[NO]</span>" : "";
	$uninstall = !empty($install) && !empty($uninstall) ? "、".$uninstall : "";

	$huoniaoTag->assign('installPayment', $install);
	$huoniaoTag->assign('uninstallPayment', $uninstall);

	//第三方登录接口接入情况
	//查询数据库中启用的登录方式
    $login_list = array();
	$archives = $dsql->SetQuery("SELECT * FROM `#@__site_loginconnect` ORDER BY `weight`, `id`");
	$results  = $dsql->dsqlOper($archives, "results");
	foreach($results as $key => $val){
		$login_list[$val['code']] = $results[$key];
	}

    //取得文件中的支付方式
	$loginPath = '../api/login/';
	$paydir = @opendir($loginPath);
    $set_modules = true;
    $login = $installArr = $uninstallArr = array();

    while(false !== ($subdir = @readdir($paydir))){
		if(is_dir($loginPath.$subdir) && $subdir != ".." && $subdir != "."){
            @include_once($loginPath . $subdir. '/' . $subdir. '.php');
        }
    }
    @closedir($paydir);

    foreach ($login as $key => $value){
        ksort($login[$key]);
    }
    ksort($login);

    for($i = 0; $i < count($login); $i++){
        $code = $login[$i]['code'];
        /* 如果数据库中有，取数据库中的名称和描述 */
        if(isset($login_list[$code])){
			$in = isset($installArr) ? count($installArr) : 0;
            $installArr[] = "<img src='".$loginPath.$code."/img/16.png' class='icon' />".$login_list[$code]['name'];
        }else{
			$un = isset($uninstallArr) ? count($uninstallArr) : 0;
            $uninstallArr[] = "<img src='".$loginPath.$code."/img/16.png' class='icon' />".$login[$i]['name'];
        }
    }

	$install = join("<span style='color:#2672ec;'>[已集成]</span>、", $installArr);
	$install = !empty($install) ? $install."<span style='color:#2672ec;'>[已集成]</span>" : "";

	$uninstall = join("<span>[NO]</span>、", $uninstallArr);
	$uninstall = !empty($uninstall) ? $uninstall."<span>[NO]</span>" : "";
	$uninstall = !empty($install) && !empty($uninstall) ? "、".$uninstall : "";

	$huoniaoTag->assign('installLogin', $install);
	$huoniaoTag->assign('uninstallLogin', $uninstall);

	if(testPurview("huoniaoOfficial")){
		$huoniaoTag->assign('huoniaoOfficial', 1);
	}

    //统计会员数量及在线人数
    $memberStatistics = array();
    $sql = $dsql->SetQuery("SELECT count(`id`) total, (SELECT count(`id`) FROM `#@__member` WHERE `state` = 1 AND (`mtype` = 1 OR `mtype` = 2) AND `online` > 0) online FROM `#@__member` WHERE `state` = 1 AND (`mtype` = 1 OR `mtype` = 2)");
    $ret = $dsql->dsqlOper($sql, "results");
    if($ret){
        $memberStatistics['total'] = $ret[0]['total'];
        $memberStatistics['online'] = $ret[0]['online'];
    }
    $huoniaoTag->assign('memberStatistics', $memberStatistics);


	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}


/**
* 获取服务器端IP地址
 * @return string
*/

function get_server_ip(){
	if(isset($_SERVER)){
		if($_SERVER['SERVER_ADDR']){
			$server_ip=$_SERVER['SERVER_ADDR'];
		}else{
			$server_ip=$_SERVER['LOCAL_ADDR'];
		}
	}else{
		$server_ip = getenv('SERVER_ADDR');
	}
	return $server_ip;
}


function _sizecount($filesize) {
    if($filesize >= 1073741824) {
        $filesize = round($filesize / 1073741824 * 100) / 100 . ' GB';
    } elseif($filesize >= 1048576) {
        $filesize = round($filesize / 1048576 * 100) / 100 . ' MB';
    } elseif($filesize >= 1024) {
        $filesize = round($filesize / 1024 * 100) / 100 . ' KB';
    } else {
        $filesize = $filesize . ' Bytes';
    }
    return $filesize;
}
