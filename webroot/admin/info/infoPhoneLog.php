<?php
/**
 * 拨打电话记录
 *
 * @version        $Id: infoPhoneLog.php 2014-11-15 上午10:03:17 $
 * @package        HuoNiao.Info
 * @copyright      Copyright (c) 2013, HuoNiao, Inc.
 * @link           http://www.huoniao.co/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("infoPhoneLog");
$dsql = new dsql($dbo);
$userLogin = new userLogin($dbo);
$tpl = dirname(__FILE__)."/../templates/info";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录

$db = "info_phone_log";

$templates = "infoPhoneLog.html";

//js
$jsFile = array(
	'ui/bootstrap.min.js',
	'ui/bootstrap-datetimepicker.min.js',
	'ui/jquery-ui-selectable.js',
	'admin/info/infoPhoneLog.js'
);
$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));


// 获取充值记录
if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

    $where = getCityFilter('`cityid`');

    if ($adminCity) {
        $where .= getWrongCityFilter('`cityid`', $adminCity);
    }

	if($sKeyword != ""){

        $sKeyword = trim($sKeyword);

        //用户查看记录
		if(substr($sKeyword, 0, 1) == '@'){
			$id = (int)substr($sKeyword, 1);
			if(is_numeric($id)){
				$isId = true;
				$where .= " AND l.`fuid` = $id";
			}
		}
        //用户被查看记录
        elseif(substr($sKeyword, 0, 1) == '#'){
			$id = (int)substr($sKeyword, 1);
			if(is_numeric($id)){
				$isId = true;
				$where .= " AND l.`tuid` = $id";
			}
		}
        //指定信息
        elseif(substr($sKeyword, 0, 1) == '$'){
			$id = (int)substr($sKeyword, 1);
			if(is_numeric($id)){
				$isId = true;
				$where .= " AND l.`aid` = $id";
			}
		}
        //其他
        else{
            $where .= " AND 2 = 3";
        }

	}

	if($start != ""){
		$where .= " AND l.`pubdate` >= ". GetMkTime($start);
	}

	if($end != ""){
		$where .= " AND l.`pubdate` <= ". GetMkTime($end." 23:59:59");
	}

	$archives = $dsql->SetQuery("SELECT l.`id` FROM `#@__".$db."` l WHERE 1 = 1");

	//总条数
	$totalCount = $dsql->dsqlOper($archives.$where, "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);

	$where .= " order by l.`id` desc";

	$atpage = $pagestep*($page-1);
    $where .= " LIMIT $atpage, $pagestep";

	$archives = $dsql->SetQuery("SELECT l.* FROM `#@__".$db."` l WHERE 1 = 1".$where);
	$results = $dsql->dsqlOper($archives, "results");

	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[$key]["id"] = $value["id"];

            $cityname = getSiteCityName($value['cityid']);
            $list[$key]['cityname'] = $cityname;

			$list[$key]["fuid"] = $value["fuid"];
            $userinfo = $userLogin->getMemberInfo($value['fuid'], 1);
            $nickname = is_array($userinfo) ? $userinfo['nickname'] : '未知';
			$list[$key]["fname"] = $nickname;
            
			$list[$key]["tuid"] = $value["tuid"];
            $userinfo = $userLogin->getMemberInfo($value['tuid'], 1);
            $nickname = is_array($userinfo) ? $userinfo['nickname'] : '未知';
			$list[$key]["tname"] = $nickname;

			$list[$key]["aid"] = $value["aid"];
			$list[$key]["phone"] = $value["phone"];

            //获取信息标题
            $title = '--';
            $sql = $dsql->SetQuery("SELECT `title` FROM `#@__infolist` WHERE `id` = " . $value['aid']);
            $ret = $dsql->getOne($sql);
            if($ret){
                $title = $ret;
            }
			$list[$key]["title"] = cn_substrR(strip_tags($title), 20);

            $list[$key]["url"] = getUrlPath(array('service' => 'info', 'template' => 'detail', 'id' => $value['aid']));
            
			$list[$key]["pubdate"] = date("Y-m-d H:i:s", $value["pubdate"]);

		}

		if(count($list) > 0){
            echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}, "infoPhoneLog": '.json_encode($list).'}';
		}else{
            echo '{"state": 101, "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}, "info": '.json_encode("暂无相关信息").'}';
		}
	}else{
        echo '{"state": 101, "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}, "info": '.json_encode("暂无相关信息").'}';
	}
	die;

}

//验证模板文件
if(file_exists($tpl."/".$templates)){

    $huoniaoTag->assign('cityList', json_encode($adminCityArr));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/info";  //设置编译目录
	$huoniaoTag->display($templates);

}else{
	echo $templates."模板文件未找到！";
}
