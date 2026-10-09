<?php
/**
 * 现金消费记录
 *
 * @version        $Id: commissioncount.php 2015-11-11 上午09:37:12 $
 * @package        HuoNiao.Member
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__) . "/../inc/config.inc.php");
checkPurview("fenxiaoList");
$dsql                     = new dsql($dbo);
$tpl                      = dirname(__FILE__) . "/../templates/member";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates                = "fenxiaoList.html";

$action = "member_fenxiao";

if ($dopost == "getList" || $do == "export") {

    $pagestep = $pagestep == "" ? 10 : $pagestep;
    $page     = $page == "" ? 1 : $page;
    $where    = $wheretype = "";
    //城市管理员，只能管理管辖城市的会员
    $where = "";
    if (strtotime($start) > strtotime($end)) {
        echo '{"state": 101, "info": ' . json_encode("开始时间不得小于结束时间") . ', "pageInfo": {"totalPage": 0,"totalCount0": 0, "totalCount": 0,"totalMoney": 0}}';
        die;
    }

    //今日统计
    $twhere = " AND f.`pubdate` >= '" . GetMkTime(date("Y-m-d") . " 00:00:00") . "' AND f.`pubdate` <= '" . GetMkTime(date("Y-m-d") . " 23:59:59") . "'";

    if ($sKeyword != '') {

        $where1 = array();
		$where1[] = "ordernum like '%$sKeyword%'";

		$userSql = $dsql->SetQuery("SELECT `id`, `username` FROM `#@__member` WHERE `username` like '%$sKeyword%' OR `nickname` like '%$sKeyword%' OR `company` like '%$sKeyword%'");
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			$userid = array();
			foreach($userResult as $key => $user){
				array_push($userid, $user['id']);
			}
			if(!empty($userid)){
				$where1[] = "f.`uid` in (".join(",", $userid).")";
			}
		}

		$where .= " AND (".join(" OR ", $where1).")";
		$twhere .= " AND (".join(" OR ", $where1).")";
    }

    if ($start != "") {
        $where .= " AND f.`pubdate` >= '" . GetMkTime($start . " 00:00:00") . "'";
    }

    if ($end != "") {
        $where .= " AND f.`pubdate` >= '" . GetMkTime($start . " 00:00:00") . "'";
        $where .= " AND f.`pubdate` <= '" . GetMkTime($end . " 23:59:59") . "'";
    }

    if ($cityid) {
        $where .= getWrongCityFilter('m.`cityid`', $cityid);
        $twhere .= getWrongCityFilter('m.`cityid`', $cityid);
    }

    if(!empty($fenxiaouid)){
        $where .= " AND f.`uid` = $fenxiaouid";
        $twhere .= " AND f.`uid` = $fenxiaouid";
    }

    $sql = $dsql->SetQuery("SELECT  f.* FROM `#@__".$action."` f LEFT JOIN `#@__member` m ON m.`id` = f.`uid` WHERE 1 =1 ");

    //总条数
    $totalCount  = $dsql->dsqlOper($sql . $where . $wheretype . ' ORDER BY f.`id` DESC ', "totalCount");
    $totalCount0 = $dsql->dsqlOper($sql, "totalCount");
    //总分页数
    $totalPage = ceil($totalCount / $pagestep);

    //总佣金
    $_sql = $dsql->SetQuery("SELECT  sum(f.`amount`) totalFee FROM `#@__".$action."` f LEFT JOIN `#@__member` m ON m.`id` = f.`uid` WHERE 1 =1 " . $where . $wheretype);
    $_ret = $dsql->dsqlOper($_sql, "results");
    $totalFee = sprintf("%.2f", $_ret[0]['totalFee']);

    //今日总佣金
    $_sql = $dsql->SetQuery("SELECT  sum(f.`amount`) totalFee FROM `#@__".$action."` f LEFT JOIN `#@__member` m ON m.`id` = f.`uid` WHERE 1 =1 " . $twhere . $wheretype);
    $_ret = $dsql->dsqlOper($_sql, "results");
    $todayFee = sprintf("%.2f", $_ret[0]['totalFee']);

    $atpage = $pagestep * ($page - 1);
    $where1 = "";
    if ($do != "export") {
        $where1 = " LIMIT $atpage, $pagestep";
    }
    $res = $dsql->dsqlOper($sql . $where . $wheretype . ' ORDER BY f.`id` DESC' . $where1, "results");
    $fenxiaoLevel = $cfg_fenxiaoLevel ? unserialize($cfg_fenxiaoLevel) : array();


    if (count($res) > 0) {

        foreach ($res as $key => $value) {

            $list[$key]["id"] = $value["id"];
            $list[$key]["userid"] = $value["uid"];
            $list[$key]["module"] = $value["module"];

            if($value['module'] == 'business'){
                $list[$key]["modulename"] = '商家';
            }elseif($value['module'] == 'member'){
                $list[$key]["modulename"] = '会员';
            }elseif($value['module'] == 'payPhone'){
                $list[$key]["modulename"] = '付费查看电话';
            }else{
                $list[$key]["modulename"] = getModuleTitle(array('name'=>$value["module"]));
            }

            /*用户*/
            $uidsql = $dsql->SetQuery("SELECt `nickname`,`cityid` FROM `#@__member` WHERE `id` = ".$value["uid"]);
            $uidres = $dsql->dsqlOper($uidsql,"results");
            $list[$key]["unickname"]        = $uidres && is_array($uidres) ? $uidres[0]['nickname'] : '未知' ;
            $list[$key]["cityidname"]       = $uidres && is_array($uidres) ? getSiteCityName($uidres[0]['cityid']) : '未知' ;

            /*上级*/
            $byuidres = array();
            if($value['by']){
                $byuidsql = $dsql->SetQuery("SELECt `nickname` FROM `#@__member` WHERE `id` = ".$value["by"]);
                $byuidres = $dsql->dsqlOper($byuidsql,"results");
            }
            $list[$key]["bynickname"]        = $byuidres && is_array($byuidres) ? $byuidres[0]['nickname'] : '未知' ;
            $list[$key]["byuid"]             = $value["by"];

            /*下级*/
            $childuidsql = $dsql->SetQuery("SELECt `nickname` FROM `#@__member` WHERE `id` = ".$value["child"]);
            $childuidres = $dsql->dsqlOper($childuidsql,"results");
            $list[$key]["childnickname"]        = $childuidres && is_array($childuidres) ? $childuidres[0]['nickname'] : '未知' ;
            $list[$key]["childuid"]             = $value["child"];
            $list[$key]["ordernum"]             = $value["ordernum"];
            $list[$key]["amount"]               = $value["amount"];
            $list[$key]["fee"]                  = $value["fee"];
//            $list[$key]["product"]              = $value["product"];
            $list[$key]["pubdate"]              = date('Y-m-d H:i:s',$value["pubdate"]);

            $sql = $dsql->SetQuery("SELECT `level` FROM `#@__member_fenxiao_user` WHERE `uid` = " . $value['uid']);
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $list[$key]["levelname"] = $fenxiaoLevel ? ($cfg_fenxiaoType ? $fenxiaoLevel[$ret[0]["level"]]['name'] : $fenxiaoLevel[$value["level"]-1]['name']) : '未知';
            }else{
                $list[$key]["levelname"] = '未知';
            }

        }
        if (count($list) > 0) {
            if ($do != "export") {
                echo '{"state": 100, "info": ' . json_encode("获取成功") . ', "pageInfo": {"totalPage": ' . $totalPage . ',"totalCount0": ' . $totalCount0 . ', "totalCount": ' . $totalCount . ',"totalCount": ' . $totalCount . ',"totalFee": ' . $totalFee . ',"todayFee": ' . $todayFee . '},"list":' . json_encode($list) . '}';
            }
        } else {
            if ($do != "export") {
                echo '{"state": 101, "info": ' . json_encode("暂无相关信息") . ', "pageInfo": {"totalPage": ' . $totalPage . ',"totalCount0": ' . $totalCount0 . ', "totalCount": ' . $totalCount . ',"totalFee": ' . $totalFee . ',"todayFee": ' . $todayFee . '}}';
            }
        }

    } else {
        if ($do != "export") {
            echo '{"state": 101, "info": ' . json_encode("暂无相关信息") . ', "pageInfo": {"totalPage": ' . $totalPage . ',"totalCount0": ' . $totalCount0 . ', "totalCount": ' . $totalCount . ',"totalFee": ' . $totalFee . ',"todayFee": ' . $todayFee . '}}';
        }
    }
    if ($do == "export") {

        $tit = array();
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '模块'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '用户'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '等级'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '佣金'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '比例'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '订单号'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '时间'));

        $folder   = HUONIAOROOT . "/uploads/siteConfig/file/";
        $filePath = $folder . iconv("utf-8", "gbk//IGNORE", "分销商收入.csv");
        MkdirAll($folder);
        $file = fopen($filePath, "w");

        //表头
        fputcsv($file, $tit);
        foreach ($list as $data) {

            $arr = array();
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['modulename']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['unickname']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['levelname']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['amount']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['fee']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['ordernum']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['pubdate']));

            //写入文件
            fputcsv($file, $arr);
        }

        header("Content-type:application/octet-stream");
        header("Content-Disposition:attachment;filename = 分销商收入.csv");
        header("Accept-ranges:bytes");
        header("Accept-length:" . filesize($filePath));
        readfile($filePath);

    }
    die;

//删除
} elseif ($dopost == "del") {
    if ($id == "") die;
    $each  = explode(",", $id);
    $error = array();
    foreach ($each as $val) {
        $archives = $dsql->SetQuery("DELETE FROM `#@__" . $action . "` WHERE `id` = " . $val);
        $results  = $dsql->dsqlOper($archives, "update");
        if ($results != "ok") {
            $error[] = $val;
        }
    }
    if (!empty($error)) {
        echo '{"state": 200, "info": ' . json_encode($error) . '}';
    } else {
        adminLog("删除现金消费记录", $id);
        echo '{"state": 100, "info": ' . json_encode("删除成功！") . '}';
    }
    die;
//佣金提现
}
//验证模板文件
if (file_exists($tpl . "/" . $templates)) {
    $userid   = $userLogin->getUserID();
    $archives = $dsql->SetQuery("SELECT `mtype`  FROM `#@__member` WHERE `id` = " . $userid);
    $results  = $dsql->dsqlOper($archives, "results");
    $huoniaoTag->assign('mtype', $results[0]['mtype']);
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
        'admin/member/fenxiaoList.js'
    );
    if ($fenxiaouid) {
        $huoniaoTag->assign('fenxiaouid', $fenxiaouid);
    }
    $huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

    $huoniaoTag->assign('cityArr', $userLogin->getAdminCity());
    $huoniaoTag->compile_dir = HUONIAOROOT . "/templates_c/admin/member";  //设置编译目录
    $huoniaoTag->display($templates);
} else {
    echo $templates . "模板文件未找到！";
}
