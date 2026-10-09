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
// checkPurview("adminIndex");
if($userType != 3) {
    checkPurview("commissionCount?gettype=substation");
}
$dsql                     = new dsql($dbo);
$tpl                      = dirname(__FILE__) . "/../templates/member";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates                = "commissioncount.html";

$action = "member_commission";

$leimuallarr = array(
    'chongzhi'         => '充值',
    'tixian'           => '提现',
    'huiyuanshengji'   => '会员升级',
    'shangjiaruzhu'    => '商家入驻',
    'jingjirentaocan'  => '经纪人套餐',
    'shuaxin'          => '刷新',
    'zhiding'          => '置顶',
    'dashang'          => '打赏',
    'liwu'             => '礼物',
    // 'baozhangjin'      => '保障金',
    'hehuorenruzhu'    => '合伙人入驻',
    'jiacu'            => '加粗',
    'jiahong'          => '加红',
    'fabuxinxi'        => '发布信息',
    // 'maidan'           => '买单',
    'xiaofei'          => '消费',
    'yongjin'          => '佣金',
    'fufeiyuedu'       => '付费阅读',
    'jifenduihuan'     => '积分兑换',
    'peifu'            => '赔付',
    'tuikuan'          => '退款',
    'shangpinxiaoshou' => '商品销售',
    'yonghujili'       => '用户激励',
    'payPhone'          =>'付费查看电话'

);

if ($dopost == "getList" || $do == "export") {

    $pagestep = $pagestep == "" ? 10 : $pagestep;
    $page = $page == "" ? 1 : $page;
    $where = $wheretype = "";
    //城市管理员，只能管理管辖城市的会员
    // if (empty($cityid)) {
    //     $userid = $userLogin->getUserID();
    //     $cityid = $userLogin->getAdminCityIds($userid);
    // }

    $where = "";
    if (strtotime($start) > strtotime($end)) {
        echo '{"state": 101, "info": ' . json_encode("开始时间不得小于结束时间") . ', "pageInfo": {"totalPage": 0,"totalCount0": 0, "totalCount": 0,"totalMoney": 0}}';
        die;
    }

    //指定城市
    if($userType == 3){
        $where .= " AND `cityid` in ('$adminCityIds')";
    }
    if($cityid != ""){
        $cityid = (int)$cityid;
        $where .= " AND `cityid` = $cityid";
    }

    if ($sKeyword != '') {
        $where1 = array();
        $where1[] = "info like '%$sKeyword%'";

        $userSql = $dsql->SetQuery("SELECT `id`, `username` FROM `#@__member` WHERE `username` like '%$sKeyword%' OR `nickname` like '%$sKeyword%' OR `company` like '%$sKeyword%'");
        $userResult = $dsql->dsqlOper($userSql, "results");
        if ($userResult) {
            $userid = array();
            foreach ($userResult as $key => $user) {
                array_push($userid, $user['id']);
            }
            if (!empty($userid)) {
                $where1[] = "`userid` in (" . join(",", $userid) . ")";
            }
        }

        $where .= " AND (" . join(" OR ", $where1) . ")";

    }

    if ($start != "") {
        $where .= " AND `date` >= '" . GetMkTime($start . " 00:00:00") . "'";
    }

    if ($end != "") {
        $where .= " AND `date` <= '" . GetMkTime($end . " 23:59:59") . "'";
    }
    if ($type != '' && $type != 'all') {

        if ($type == 'member') {
            $type = '';
        }
        $wheretype .= " AND `ordertype` = '" . $type . "'";
    }

    if ($leimutype != '') {
        $where .= " AND `ctype` = '" . $leimutype . "'";
    }

    $wherecityid = '';

    if (!empty($cityid)) {
        $wherecityid .= getWrongCityFilter('`cityid`', $cityid);
    }

    $sql = $dsql->SetQuery("SELECT  `ordertype`,`commission` ,`info`,`userid`,`date`,`ctype`,`cityid`,`substation`,`type` FROM `#@__member_money` WHERE 1 =1 $wherecityid AND `showtype`  = 1 AND `commission` != '0.00'");
    //总条数
    $totalCount = $dsql->dsqlOper($sql . $where . $wheretype . ' ORDER BY `id` DESC ', "totalCount");
    $totalCount0 = $dsql->dsqlOper($sql . $where . $wheretype, "totalCount");

    //佣金
    $totalMoneysql = $dsql->SetQuery("SELECT SUM(`commission`) as totalMoney  FROM `#@__member_money` WHERE 1=1 $wherecityid AND `showtype`  = 1 AND `type` = 1 AND ctype != 'tixian' " . $where . $wheretype);
    $totalMoneyres = $dsql->dsqlOper($totalMoneysql, "results");
    // $typesql = $dsql->SetQuery("SELECT SUM(`commission`) as totalMoney  FROM `#@__member_money` WHERE 1=1 $wherecityid AND `showtype`  = 1 AND `type` = 0 AND ctype != 'tixian' " . $where . $wheretype);
    // $typesqlres = $dsql->dsqlOper($typesql, "results");
    // $totalMoney = (float)$totalMoneyres[0]['totalMoney'] - (float)$typesqlres[0]['totalMoney'] ;
    $totalMoney = (float)$totalMoneyres[0]['totalMoney'];
    //总分页数
    $totalPage = ceil($totalCount / $pagestep);

    $atpage = $pagestep * ($page - 1);
    $where1 = "";
    if ($do != "export") {
        $where1 = " LIMIT $atpage, $pagestep";
    }
    $res = $dsql->dsqlOper($sql . $where . $wheretype . ' ORDER BY `id` DESC' . $where1, "results");

    //分站余额
    if (is_numeric($cityid)) {

        $fzsql = $dsql->SetQuery("SELECT  `money` FROM `#@__site_city` WHERE cid = " . $cityid);
        $fzres = $dsql->dsqlOper($fzsql, "results");
        $fzmoney = $fzres[0]['money'];
    } else {

        //获取所有分站管理员
        $ids = array();
        $sql = $dsql->SetQuery("SELECT `mgroupid` FROM `#@__member` WHERE `mtype` = 3");
        $ret = $dsql->dsqlOper($sql, "results");
        if ($ret) {
            foreach ($ret as $key => $value) {
                array_push($ids, $value['mgroupid']);
            }
        }

        $fzmoney = 0;
        
        if($ids){
            $ids = join(',', $ids);
    
            $fzsql = $dsql->SetQuery("SELECT  sum(`money`) money FROM `#@__site_city` WHERE `cid` in ($ids)");
            $fzres = $dsql->dsqlOper($fzsql, "results");
            $fzmoney = $fzres[0]['money'];
        }
    }

    //模块名称
    $mosql = $dsql->SetQuery("SELECT  `name` , `subject`  FROM `#@__site_module`");
    $mores = $dsql->dsqlOper($mosql, "results");
    $modulearr = array_column($mores, 'subject', 'name');

    $module = '';
    $modulemoneyarr = array();
    foreach ($mores as $k => $v) {

        if (strstr($v['subject'], '商家')) {
            $module = 'business';
        } else {
            $module = $v['name'];
        }

        $sql1 = $dsql->SetQuery("SELECT  SUM(`commission`) as allcommission,count(`id`) as allcount FROM `#@__member_money` WHERE `ordertype` = '" . $module . "' $wherecityid AND `showtype`  = 1 " . $where);

        $res1 = $dsql->dsqlOper($sql1, "results");

        $modulemoneyarr[$k]['subject'] = $v['subject'];
        $modulemoneyarr[$k]['name'] = $v['name'];
        $modulemoneyarr[$k]['allcount'] = $res1[0]['allcount'];
        $modulemoneyarr[$k]['allcommission'] = (float)$res1[0]['allcommission'];
    }
    /*会员升级以及置顶等相关*/
    $msql = $dsql->SetQuery("SELECT  SUM(`commission`) as allcommission ,count(`id`) as allcount FROM `#@__member_money` WHERE `ordertype` = '' $wherecityid AND `showtype`  = 1" . $where);
    $mres = $dsql->dsqlOper($msql, "results");
    $mamber = array();
    $mamber['subject'] = '会员升级';
    $mamber['name'] = 'member';
    $mamber['allcommission'] = (float)$mres[0]['allcommission'];
    $mamber['allcount'] = $mres[0]['allcount'];

    array_push($modulemoneyarr, $mamber);
    /*系统*/
    $ssql = $dsql->SetQuery("SELECT  SUM(`commission`) as allcommission ,count(`id`) as allcount FROM `#@__member_money` WHERE `ordertype` = 'siteConfig' $wherecityid AND `showtype`  = 1" . $where);
    $sres = $dsql->dsqlOper($ssql, "results");
    $site = array();
    $site['subject'] = '系统相关';
    $site['name'] = 'siteConfig';
    $site['allcommission'] = (float)$sres[0]['allcommission'];
    $site['allcount'] = $sres[0]['allcount'];
    array_push($modulemoneyarr, $site);

    $list = array();
    if (count($res) > 0) {
        foreach ($res as $key => $value) {
            $list[$key]["allcommission"] = $value["allcommission"];
            $list[$key]["info"] = $value["info"];
            $list[$key]["userid"] = $value["userid"];

            $usersql = $dsql->SetQuery("SELECT `nickname` FROM `#@__member` WHERE `id` = '" . $value["userid"] . "'");
            $userres = $dsql->dsqlOper($usersql, "results");

            $username = '';
            if ($userres && is_array($userres)) {
                $username = $userres[0]['nickname'];
            }
            $list[$key]["username"] = $username;
            $list[$key]["date"] = date("Y-m-d H:i:s", $value["date"]);
            $list[$key]["commission"] = $value["commission"];
            $list[$key]["type"] = $value["type"];
            $list[$key]["count"] = $value["count"];
            $list[$key]["ctype"] = $value["ctype"];
            $list[$key]["ctypename"] = $value["ctype"] != '' ? $leimuallarr[$value["ctype"]] : '';
            $list[$key]["substation"] = $value["substation"];
            $list[$key]["cityname"] = getSiteCityName($value['cityid']);

            if ($value["ordertype"] == 'business') {

                $ordertype = '商家入驻';

            } elseif ($value["ordertype"] != '') {

                $ordertype = $modulearr[$value["ordertype"]];
            } else {
                $ordertype = '';
            }

            $list[$key]["ordertype"] = $ordertype;
        }

        if (count($list) > 0) {
            if ($do != "export") {
                echo '{"state": 100, "info": ' . json_encode("获取成功") . ', "pageInfo": {"totalPage": ' . $totalPage . ',"totalCount0": ' . $totalCount0 . ', "totalCount": ' . $totalCount . ',"totalCount": ' . $totalCount . ',"totalMoney": ' . sprintf("%.2f", $totalMoney) . '},"list":' . json_encode($list) . ',"fzmoney":' . sprintf("%.2f",$fzmoney) . ',"modulemoneyarr":' . json_encode($modulemoneyarr) . '}';
            }
        } else {
            if ($do != "export") {
                echo '{"state": 101, "info": ' . json_encode("暂无相关信息") . ', "pageInfo": {"totalPage": ' . $totalPage . ',"totalCount0": ' . $totalCount0 . ', "totalCount": ' . $totalCount . ',"totalMoney": ' . sprintf("%.2f",$totalMoney) . '},"fzmoney":' . sprintf("%.2f",$fzmoney) . ',"modulemoneyarr":' . json_encode($modulemoneyarr) . '}';
            }
        }

    } else {
        if ($do != "export") {
            echo '{"state": 101, "info": ' . json_encode("暂无相关信息") . ', "pageInfo": {"totalPage": ' . $totalPage . ',"totalCount0": ' . $totalCount0 . ', "totalCount": ' . $totalCount . ',"totalMoney": ' . sprintf("%.2f",$totalMoney) . '},"fzmoney":' . sprintf("%.2f",$fzmoney) . ',"modulemoneyarr":' . json_encode($modulemoneyarr) . '}';
        }
    }
    if ($do == "export") {

        $tit = array();
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '模块'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '会员'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '佣金'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '信息'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '时间'));

        $folder = HUONIAOROOT . "/uploads/siteConfig/file/";
        $filePath = $folder . iconv("utf-8", "gbk//IGNORE", "分站收入.csv");
        MkdirAll($folder);
        $file = fopen($filePath, "w");

        //表头
        fputcsv($file, $tit);
        foreach ($list as $data) {

            $arr = array();
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['ordertype']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['username']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['commission']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['info']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['date']));

            //写入文件
            fputcsv($file, $arr);
        }

        header("Content-type:application/octet-stream");
        header("Content-Disposition:attachment;filename = 分站收入.csv");
        header("Accept-ranges:bytes");
        header("Accept-length:" . filesize($filePath));
        readfile($filePath);

    }
    die;


//后台修改分站佣金
}elseif ($dopost == "editAdminCity"){
    global $dsql;
    if(!testPurview('updateCityAdminAmount')){
        die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
    }
    if(!$cityid){
        die('{"state": 200, "info": '.json_encode("请选择要更新的分站！").'}');
    }
//        $userid      = $userLogin->getUserID();
    $date = GetMkTime(time());
    $sql = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`,`type`,`amount`,`info`,`date`,`ordertype`,`montype`,`platform`,`cityid`,`commission`,`showtype`,`pid`,`ctype`,`urlParam`,`ordernum`,`title`,`tuikuanparam`,`tuikuantype`,`balance`,`substation`) VALUES ('','$type','0.00','$info','$date','siteConfig','0','0.00','$cityid','$money','1','0','xiaofei','','','','','','','')");
    $lastid = $dsql->dsqlOper($sql,"lastid");
    if ($type == 1){
        $fzarchives = $dsql->SetQuery("UPDATE `#@__site_city` SET `money` = `money` + '$money' WHERE `cid` = '$cityid'");
        $dsql->dsqlOper($fzarchives, "update");
    }else{
        $fzarchives = $dsql->SetQuery("UPDATE `#@__site_city` SET `money` = `money` - '$money' WHERE `cid` = '$cityid'");
        $dsql->dsqlOper($fzarchives, "update");
    }
    $site =  $dsql->SetQuery("SELECT `money` FROM `#@__site_city` WHERE `cid` = '$cityid'");
    $result = $dsql->dsqlOper($site,"results");
    $blance = $result[0]['money'];
    $fzarchives = $dsql->SetQuery("UPDATE `#@__member_money` SET `substation` = '$blance' WHERE `id` = '$lastid'");
    $dsql->dsqlOper($fzarchives, "update");

    adminLog("更新分站管理员余额", $cityid . "=>" . ($type == 1 ? '增加' : '减少') . '=>' . $money . '元');

    echo '{"state": 100, "info": ' . json_encode("更新成功！") . '}';
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
} elseif ($dopost == "withdraw") {
    $userid = $userLogin->getUserID();
    $cityid = $userLogin->getAdminCityIds($userid);

    $templates = "withdraw.html";
    $huoniaoTag->display($templates);
} elseif ($dopost == "getallmoney") {

    $field = '  SUM( case when `montype` = 1 then `amount` else 0 end) as czamount , SUM(CASE WHEN `showtype` = 1 THEN `platform` ELSE 0 END) AS platform';

    if ($gettype == 'substation') {

        $field = " SUM(CASE WHEN `showtype` = 1 AND `ctype` != 'tixian' THEN `commission` ELSE 0 END) AS platform";
    }
    //总平台收入(佣金+充值)
    $starttime = $start ? strtotime($start) : strtotime(date("Y-m-d", strtotime("-6 day")));
    $endtime   = $end ? strtotime($end) : strtotime(date('Y-m-d'));
    $coutinfo  = [];
    for ($start = $endtime; $start >= $starttime; $start -= 24 * 3600) {
        $time1 = $start;
        $time2 = $start + 86400;
        //总收入
        // $chongzhi = $dsql->SetQuery("SELECT SUM( case when `montype` = 1 then `amount` else 0 end) as czamount , SUM( case when `montype` = 2 then `amount` else 0 end) as withamount , SUM(`platform`) as platform   FROM `#@__member_money` WHERE `date` >= $time1 AND `date` <= $time2");
        $chongzhi = $dsql->SetQuery("SELECT $field FROM `#@__member_money` WHERE `date` >= $time1 AND `date` <= $time2");
        $cz       = $dsql->dsqlOper($chongzhi, "results");
        //提现
        // $withamount = $cz[0]['withamount'];

        $allincome                                    = $cz[0]['czamount'] + $cz[0]['platform'];
        $coutinfo[date('Y-m-d', $time1)]['allincome'] = sprintf("%.2f", $allincome);
        $coutinfo[date('Y-m-d', $time1)]['czamount']  = sprintf("%.2f", $cz[0]['czamount']);
        $coutinfo[date('Y-m-d', $time1)]['platform']  = sprintf("%.2f", $cz[0]['platform']);
        //总支出
        //平台总支出(member_withdraw用户提现表用户提现会插入这个表中提现是否成功提了多少钱等,__member_money后台管理员对用户金额的操作状态为2统一为提现)

        if ($gettype != 'substation') {
            $zhichusql = $dsql->SetQuery("SELECT SUM(`amount`) as txamount  FROM `#@__member_withdraw` WHERE `state` = 1 AND rdate >= $time1 AND rdate <= $time2");
            $zhichu    = $dsql->dsqlOper($zhichusql, "results");


            $txamount = $zhichu[0]['txamount'] ? $zhichu[0]['txamount'] : 0;
            // $expenditure = $txamount+$withamount;
            $expenditure                                    = $txamount;
            $coutinfo[date('Y-m-d', $time1)]['expenditure'] = $expenditure;
        }
    }
    foreach ($coutinfo as $k => $v) {
        $allshouru   += sprintf("%.2f", $v['allincome']);
        $allczamount += sprintf("%.2f", $v['czamount']);
        $allplatform += sprintf("%.2f", $v['platform']);

        if ($gettype != 'substation') {
            $allzhichu += sprintf("%.2f", $v['expenditure']);
        }
    }
    $return = [
        'state' => '100',
        'info'  => [
            'allshouru'   => sprintf("%.2f", $allshouru),
            'allczamount' => sprintf("%.2f", $allczamount),
            'allplatform' => sprintf("%.2f", $allplatform),
            'allzhichu'   => sprintf("%.2f", $allzhichu),
            'coutinfo'    => $coutinfo

        ]
    ];
    echo json_encode($return);
    die;
} elseif ($dopost == "getfxmoney") {

    $starttime = $start ? strtotime($start) : strtotime(date("Y-m-d", strtotime("-6 day")));
    $endtime   = $end ? strtotime($end) : strtotime(date('Y-m-d'));
    $coutinfo  = [];

    for ($start = $endtime; $start >= $starttime; $start -= 24 * 3600) {

        $time1 = $start;
        $time2 = $start + 86400;

        $chongzhi = $dsql->SetQuery("SELECT SUM(`amount`) commissionall FROM `#@__member_fenxiao` WHERE `pubdate` >= $time1 AND `pubdate` <= $time2");
        $cz       = $dsql->dsqlOper($chongzhi, "results");

        $coutinfo[date('Y-m-d', $time1)]['commissionall']  = sprintf("%.2f", $cz[0]['commissionall']);

    }
    foreach ($coutinfo as $k => $v) {

        $allczamount += sprintf("%.2f", $v['commissionall']);


    }
    $return = [
        'state' => '100',
        'info'  => [
            'allczamount' => sprintf("%.2f", $allczamount),
            'coutinfo'    => $coutinfo

        ]
    ];
    echo json_encode($return);
    die;

}
$huoniaoTag->assign('leimuallarr', $leimuallarr);
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
        'admin/member/commissionCount.js'
    );
    if ($cityid) {
        $huoniaoTag->assign('cityid', $cityid);
    }
    $huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
    $updateCityAdminAmount = testPurview('updateCityAdminAmount') ? 1 : 0;
    $huoniaoTag->assign('updateCityAdminAmount', $updateCityAdminAmount);
    $huoniaoTag->assign('cityArr', $userLogin->getAdminCity());
    $huoniaoTag->assign('cityList', json_encode($adminCityArr));
    $huoniaoTag->compile_dir = HUONIAOROOT . "/templates_c/admin/member";  //设置编译目录
    $huoniaoTag->display($templates);
} else {
    echo $templates . "模板文件未找到！";
}
