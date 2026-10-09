<?php
/**
 * 执行SQL语句
 *
 * @version        $Id: dbQuery.php 2013-11-27 上午11:19:28 $
 * @package        HuoNiao.DB
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("dbQuery");
$dsql = new dsql($dbo);
$tpl  = dirname(__FILE__)."/../templates/siteConfig";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "dbQuery.html";

$action = $_GET['action'];

if($action == "query"){
	if($_POST['token'] == "") die('token传递失败！');
	$sqlquery = trim($_POST['sqlquery']);
    if(preg_match("#drop(.*)table#i", $sqlquery) || preg_match("#drop(.*)database#", $sqlquery)){
		echo '{"state": 200, "info": '.json_encode("删除'数据表'或'数据库'的语句不允许在这里执行。").'}';die;
    }
    //运行查询语句
    if(preg_match("#^select #i", $sqlquery)){
		$return = "";
		$totalCount = $dsql->dsqlOper($sqlquery, "totalCount");
		if($totalCount <= 0){
			$return = "无返回记录！";
		}else{
			$return = "<fieldset><legend>共有".$totalCount."条记录，最大返回100条！</legend>";
		}

        $j = 0;
        while($row = $dsql->dsqlOper($sqlquery, "results")){
            if($j > 100 || $j >= $totalCount){
                break;
            }
            $return .= "<strong>记录：".($j+1)."</strong><br />";
            foreach($row[$j] as $k=>$v){
                $return .= "<font color='red'>{$k}：</font>$v<br />";
            }
			$return .= "<hr />";
			$j++;
        }
		$return .= "</fieldset>";
		echo '{"state": 100, "info": '.json_encode($return).'}';
		adminLog("执行SQL语句", $sqlquery);
		die;
    }

	//普通的SQL语句
	$sqlquery = str_replace("\r","",$sqlquery);
	$sqls = preg_split("#;[ \t]{0,}\r\n#",$sqlquery);
	$nerrCode = ""; $i=0;;
	foreach($sqls as $q){
		$q = trim($q);
		if($q==""){
			continue;
		}

		$results = $dsql->dsqlOper($q, "update");
		if($results != "ok"){
            $_ret = json_decode($results, true);
            $_error = is_array($_ret) ? $_ret['info'] : $results;
            $_error = $_error == '操作失败！' ? '执行失败，如需查看错误详情，请开启系统基本参数中的Debug模式！' : $_error;
			$nerrCode .= "执行：<font color='blue'>$q</font> 出错：<font color='red'>".$_error."</font><br />";
		}else{
			$i++;
		}
	}

	if($nerrCode != ""){
		echo '{"state": 100, "info": '.json_encode('成功执行 '.$i.' 个SQL语句！<br /><br />'.$nerrCode).'}';
	}else{
		echo '{"state": 100, "info": '.json_encode('成功执行输入的SQL语句！').'}';
	}
	adminLog("执行SQL语句", $sqlquery);
	die;

}

//验证模板文件
if(file_exists($tpl."/".$templates)){

	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'admin/siteConfig/dbQuery.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/siteConfig";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
