<?php
/**
 * 资金沉淀记录
 *
 * @version        $Id: moneyLogs.php 2022-03-29 下午 13:29:12 $
 * @package        HuoNiao.Member
 * @copyright      Copyright (c) 2013 - 2022, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("rewardLogs");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/member";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "moneyPrecipitate.html";

$moduleList = getModuleList(true);

$hasModule = array("tuan","shop","travel","awardlegou","education","homemaking","info","article","circle","tieba","huodong","waimai");

$leimuallarr = array(
    'business'              =>'商家'
);
foreach ($moduleList as $moduleListI){
    if(in_array($moduleListI['name'],$hasModule)){
        $leimuallarr[$moduleListI['name']] = $moduleListI['title'];
    }
}


if($dopost == "getList"){
    // 页面大小 $pageSize
    $pagestep = $pagestep == "" ? 10 : $pagestep;
    // 当前页数 $page
    $page     = $page == "" ? 1 : $page;

    // 条件判断
    $wherekey = $wherecity = $wheretype = $wheretime = $wheresoure =  '';

    // 收入类型
    if($type == 1){
        $wheretype = " AND r.`gift_id` > 0 ";
    }
    elseif($type == 2){
        $wheretype = " AND r.`gift_id` = 0 ";
    }
    // 条件指定模块
    if($source!=""){
        $wheresoure  = " AND p.`module` = '".$source."'";
    }

    // 指定时间条件
    if($start != ""){
        $wheretime .= " AND p.`pubdate` >= ". GetMkTime($start." 00:00:00");
    }
    if($end != ""){
        $wheretime .= " AND p.`pubdate` <= ". GetMkTime($end." 23:59:59");
    }

    //指定城市分站
    if($cityid!=""){
        $cityid = (int)$cityid;
        $wherecity = " AND p.`cityid` = $cityid";
    }
    //城市管理员，只能管理管辖城市的会员
    if($userType == 3){
        $wherecity = " AND p.`cityid` in ('$adminCityIds')";
    }

    // 搜索关键字
    if($sKeyword!=""){
        $sKeyword = trim($sKeyword);
        $like_name = "%".$sKeyword."%";
        $wherekey = " AND (m.`nickname` like '$like_name' or p.`ordernum` like '$like_name' or p.`title` like '$like_name')";
    }
    $allsql = $dsql::SetQuery("select p.*,a.`typename` 'cityname',m.`nickname` from `#@__money_precipitate` p left join `#@__site_area` a on p.`cityid`=a.`id` left join `#@__member` m on p.`uid`=m.`id` WHERE 1 = 1 $wheresoure $wheretime $wherecity $wherekey");

    //总条数
    $totalCount = $dsql->dsqlOper($allsql, "totalCount");
    //总页数
    $totalPage = ceil($totalCount/$pagestep);

    // 计算分页 limit，并查询数据
    $atpage = $pagestep*($page-1);
    $listSql = $allsql." ORDER BY `pubdate` DESC LIMIT $atpage, $pagestep";
    $results = $dsql->dsqlOper($listSql, "results");

    //总金额
    $allsqlmm     = $dsql->SetQuery("select sum(p.`amount`) 'allamount' from `#@__money_precipitate` p left join `#@__site_area` a on p.`cityid`=a.`id` left join `#@__member` m on p.`uid`=m.`id` WHERE 1 = 1 $wheresoure $wheretime $wherecity $wherekey");
    $totalMoney   = $dsql->dsqlOper($allsqlmm, "results");

    $totalMoney = sprintf('%.2f', $totalMoney[0]['allamount']);

    // 数据封装处理
    if($results){
        include HUONIAOROOT . '/include/config/settlement.inc.php';
        global $cfg_liveFee;
        foreach($results as $key => $val){
            // 1.封装城市名
            $cityname = $val["cityname"]=="" ? '未知' : $val["cityname"];
            $list[$key]["addrname"] = $cityname;

            $list[$key]['module']   = $leimuallarr[$val['module']];

            // 5.（title)
            $list[$key]['title'] = $val['title'];

            // 6.金额
            $list[$key]['amount'] = sprintf('%.2f',$val['amount']);

            // 7.用户
            $list[$key]['uid'] = $val['uid'];
            $list[$key]['nickname'] = $val['nickname'] ?: "未知";


            // 8.时间
            $list[$key]['pubdate'] = date("Y-m-d H:i:s", $val['pubdate']);

            // 9.订单号
            $list[$key]['ordernum'] = $val['ordernum'];
        }

        if(count($list) > 0){
            if($do != "export"){
                echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalMoney": '.$totalMoney.'},"list": '.json_encode($list).'}';
            }
        }else{
            if($do != "export"){
                echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalMoney": '.$totalMoney.'}}';
            }
        }
    }else{
        if($do != "export"){
            echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalMoney": '.$totalMoney.'}}';
        }
    }
    //导出数据
    $fileName = "资金沉淀记录数据.csv";
    if($do == "export"){

        $tit = array();
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '分站'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '模块'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '订单号'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '用户ID'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '用户昵称'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '标题'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '金额'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '时间'));


        $folder = HUONIAOROOT . "/uploads/siteConfig/file/";
        $filePath = $folder.$fileName;
        MkdirAll($folder);
        $file = fopen($filePath, "w");

        //表头
        fputcsv($file, $tit);

        foreach($list as $data){
            $arr = array();
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['addrname']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['module']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['ordernum']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['uid']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['nickname']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['title']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['amount']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['pubdate']));
            fputcsv($file, $arr);
        }

        header("Content-type:application/octet-stream");
        header("Content-Disposition:attachment;filename = $fileName");
        header("Accept-ranges:bytes");
        header("Accept-length:".filesize($filePath));
        readfile($filePath);
    }

    die;

}


$huoniaoTag->assign('leimuallarr',$leimuallarr);
//验证模板文件
if(file_exists($tpl."/".$templates)){

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
        'admin/member/moneyPrecipitate.js'
    );
    $huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

    $huoniaoTag->assign('cityArr', $userLogin->getAdminCity());
    $huoniaoTag->assign('source', $source);
    $huoniaoTag->assign('sKeyword', $sKeyword);
    $huoniaoTag->assign('type', $type);
    $huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/member";  //设置编译目录
    $huoniaoTag->display($templates);
}else{
    echo $templates."模板文件未找到！";
}
