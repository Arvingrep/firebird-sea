<?php
/**
 * 付费查看电话记录
 *
 * @version        $Id: payPhoneOrder.php 2022-07-23 下午 13:59:20 $
 * @package        HuoNiao.siteConfig
 * @copyright      Copyright (c) 2013 - 2022, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("payPhoneOrder");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/siteConfig";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "payPhoneOrder.html";

$leimuallarr = array(
    'business' => '商家',
    'info' => getModuleTitle(array('name' => 'info')),
    'sfcar' => getModuleTitle(array('name' => 'sfcar')),
);

$typeallarr = array('money'=>'余额支付');
$archives = $dsql->SetQuery("SELECT `id`, `pay_code`, `pay_name`, `pay_desc` FROM `#@__site_payment` WHERE `state` = 1 ORDER BY `weight`, `id` DESC");
$results = $dsql->dsqlOper($archives, "results");
if($results){
    foreach ($results as $key=>$val){
        $typeallarr[$val['pay_code']] = $val['pay_name'];
    }
}

if($dopost == "getList"){

    // 页面大小 $pageSize
    $pagestep = $pagestep == "" ? 10 : $pagestep;
    // 当前页数 $page
    $page     = $page == "" ? 1 : $page;

    $sql = "SELECT p.`id`, p.`ordernum`, p.`cityid`, p.`uid`, p.`module`, p.`temp`, p.`aid`, p.`title`, p.`url`, p.`paytype`, p.`amount`, p.`pubdate`, a.`typename` cityname, m.`username` username, m.`nickname` nickname FROM `#@__site_pay_phone` p LEFT JOIN `#@__site_area` a ON p.`cityid`=a.`id` LEFT JOIN `#@__member` m ON p.`uid` = m.`id`";

    // 增加条件
    $twhere = " WHERE `paytype` != ''";
    
    if($type){
        if($type == 'money'){
            $twhere .= " AND (p.`paytype`= '$type' OR p.`paytype`= 'balance')";
        }else{
            $twhere .= " AND p.`paytype`= '$type'";
        }        
    }
    // 模块
    if($source!=""){
        $twhere .= " AND p.`module`= '$source'";
    }
    //指定城市
    if($userType == 3){
        $twhere .= " AND p.`cityid` in ('$adminCityIds')";
    }
    if($cityid!=""){
        $cityid = (int)$cityid;
        $twhere .= " AND p.`cityid` = $cityid";
    }
    //指定开始时间和结束时间
    if($start != ""){
        $twhere .= " AND p.`pubdate` >= ". GetMkTime($start." 00:00:00");
    }
    if($end != ""){
        $twhere .= " AND p.`pubdate` <= ". GetMkTime($end." 23:59:59");
    }
    //搜索关键字
    $sKeyword = trim($sKeyword);
    if($sKeyword!=""){
        $length = strlen($sKeyword);
        // 查询订单号
        if($length==16){
            $twhere .= " AND p.`ordernum`= '$sKeyword'";
        }elseif(is_numeric($sKeyword)){
            $twhere .= " AND p.`uid` = $sKeyword";
        }else{
            $twhere .= " AND p.`title` LIKE '%$sKeyword%'";
        }
    }

    $sql .= $twhere;
    $sql = $dsql->SetQuery($sql);

    //总条数
    $totalCount = $dsql->dsqlOper($sql, "totalCount");
    //总页数
    $totalPage = ceil($totalCount/$pagestep);


    // 计算分页 limit，并查询数据
    $atpage = $pagestep*($page-1);
    $sql .= " ORDER BY p.`pubdate` DESC, p.`id` DESC limit $atpage, $pagestep";

    $listSql = $dsql->SetQuery($sql);
    $results = $dsql->dsqlOper($listSql, "results");
    $list = array();


    if($results){
        foreach ($results as $key => $val){
            // 调试
            $list[$key]['id'] = $val['id'];

            // 1.处理城市
            $list[$key]['cityname'] = $val['cityname'] ? $val['cityname'] :"未知";

            // 2.订单号
            $list[$key]['ordernum'] = $val['ordernum']?$val['ordernum']:"无";

            // 3.用户
            $list[$key]['uid']  = $val['uid'] ? $val['uid'] :"未知";
            $list[$key]['user'] = $val['nickname'] ? $val['nickname'] : ($val['username'] ? $val['username'] : "未知");

            // 4.标题
            $list[$key]['aid'] = $val['aid'];
            $list[$key]['title'] = trim(strip_tags($val['title']));

            // 5.模块
            $list[$key]['module'] = $val['module'];
            $list[$key]['moduleName'] = $val['module'] == 'business' ? '商家' : getModuleTitle(array('name' => $val['module']));
            $list[$key]['temp'] = $val['temp'];

            // 6.链接
            $list[$key]['url'] = getUrlPath(unserialize($val['url']));

            // 7.处理时间
            $list[$key]['pubdate'] = date("Y-m-d H:i:s",$val['pubdate']);

            // 8.支付方式
            $list[$key]['paytype'] = $val['paytype'] == 'balance' ? '余额支付' : $typeallarr[$val['paytype']];

            // 9.金额
            $list[$key]['amount'] = $val['amount'];

        }
        if(count($list) > 0){
            if($do != "export"){
                echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'},"list": '.json_encode($list).'}';
            }
        }else{
            if($do != "export"){
                echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}}';
            }
        }
    }else{
        if($do != "export"){
            echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}}';
        }
    }
    //导出数据
    $fileName = "付费查看电话数据记录.csv";
    if($do == "export"){

        $tit = array();
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '城市'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '订单号'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '模块'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '会员ID'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '会员信息'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '付款金额'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '支付方式'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '付费信息'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '链接地址'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '交易时间'));


        $folder = HUONIAOROOT . "/uploads/siteConfig/file/";
        $filePath = $folder.$fileName;
        MkdirAll($folder);
        $file = fopen($filePath, "w");

        //表头
        fputcsv($file, $tit);

        foreach($list as $data){
            $arr = array();
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['cityname']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['ordernum']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".getModuleTitle(array('name' => $data['module']))));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['uid']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['user']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['amount']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['paytype']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['title']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['url']));
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
$huoniaoTag->assign("typeallarr", $typeallarr);

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
        'admin/siteConfig/payPhoneOrder.js'
    );
    $huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

    $huoniaoTag->assign('cityArr', $userLogin->getAdminCity());
    $huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/siteConfig";  //设置编译目录
    $huoniaoTag->display($templates);
}else{
    echo $templates."模板文件未找到！";
}