<?php
/**
 * 商家买单订单管理
 *
 * @version        $Id: moneyLogs.php 2022-04-02 上午 10:13:12 $
 * @package        HuoNiao.Member
 * @copyright      Copyright (c) 2013 - 2022, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__) . "/../inc/config.inc.php");
checkPurview("maiDanOrder");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/business";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "maiDanOrder.html";

$action = "business_maidan_order";

// 付款方式
$leimuallarr = array('money'=>'余额支付');
$archives = $dsql->SetQuery("SELECT `id`, `pay_code`, `pay_name`, `pay_desc` FROM `#@__site_payment` WHERE `state` = 1 ORDER BY `weight`, `id` DESC");
$results = $dsql->dsqlOper($archives, "results");
if($results){
    foreach ($results as $key=>$val){
        $leimuallarr[$val['pay_code']] = $val['pay_name'];
    }
}

// 获取列表
if($dopost == "getList"){
    // 页面大小 $pageSize
    $pagestep = $pagestep == "" ? 10 : $pagestep;
    // 当前页数 $page
    $page     = $page == "" ? 1 : $page;

    $sql     = $dsql->SetQuery("SELECT o.*, l.`id` bid,l.`title` bname, a.`typename` cityname, m.`id` userid, m.`username` uname, m.`nickname` unick FROM `#@__business_maidan_order` o LEFT JOIN `#@__business_list` l ON o.`sid`=l.`id` LEFT JOIN `#@__site_area` a ON l.`cityid`=a.`id` LEFT JOIN `#@__member` m ON o.`uid`=m.`id` WHERE 1 = 1");

    // 条件判断
    $wherekey = $wherecity = $wheretype = $wheretime  =  '';

    // 指定时间条件
    if($start != ""){
        $wheretime .= " AND `paydate` >= ". GetMkTime($start." 00:00:00");
    }
    if($end != ""){
        $wheretime .= " AND `paydate` <= ". GetMkTime($end." 23:59:59");
    }
    $sql .= $wheretime;
    //城市管理员，只能管理管辖城市的会员
    if($userType == 3){
        $wherecity = " AND l.`cityid` in ('$adminCityIds')";
    }
    //指定城市分站
    if($cityid!=""){
        $cityid = (int)$cityid;
        $wherecity = " AND l.`cityid` = $cityid";
    }
    $sql .= $wherecity;

    // 指定支付方式
    if($type!=""){
        $wheretype = " AND `paytype`= '$type'";
    }
    $sql .= $wheretype;

    // 搜索关键字
    if($sKeyword!=""){
        $sKeyword = trim($sKeyword);
        $like_key = "%".$sKeyword."%";
        $wherekey = " AND (`ordernum` like '$like_key' or m.`username` like '$like_key' or m.`nickname` like '$like_key' or l.`title` like '$like_key')";
    }
    $sql .= $wherekey;

    //总条数
    $totalCount = $dsql->dsqlOper($sql, "totalCount");
    //总页数
    $totalPage = ceil($totalCount/$pagestep);
    // 计算分页 limit，并查询数据
    $atpage = $pagestep*($page-1);
    $results   = $dsql->dsqlOper($sql." ORDER BY o.`paydate` DESC LIMIT $atpage, $pagestep", "results");

    //总金额
    $sqlm     = $dsql->SetQuery("SELECT SUM(`payamount`) allamount FROM (".$sql.") as alls");
    $totalMoney   = $dsql->dsqlOper($sqlm, "results");
    $totalMoney = sprintf('%.2f', $totalMoney[0]['allamount']);

    $list = array();
    //数据封装
    if($results){
        foreach($results as $key => $val){
            // 1.城市
            if(!$val['cityname']){
                $list[$key]['cityname'] = "未知";
            }else{
                $list[$key]['cityname'] = $val['cityname'];
            }
            // 2.订单号
            $list[$key]['ordernum'] = $val['ordernum'];
            // 3.订单金额
            $list[$key]['amount'] = $val['amount'];
            // 4.无优惠金额
            $list[$key]['amount_alone'] = $val['amount_alone'];
            // 5.实付金额
            $list[$key]['payamount'] = $val['payamount'];
            // 6.付款方式
            $list[$key]['paytype'] = getPaymentName($val['paytype']);
            // 7.付款时间
            $list[$key]['paydate'] = $val['paydate'];
            // 8.下单人名称与ID
            $nickname = $val['unick']==""? ($val['uname']==""? "未知": $val['uname']): $val['unick'];
            $list[$key]['nickname'] = $nickname;

            $userid = $val['userid']==""? -1 : $val['userid'];
            $list[$key]['userid'] = $userid;
            // 9.店铺名称与ID，以及URL
            $bname = $val['bname']==""? "未知": $val['bname'];
            $list[$key]['bname'] = $bname;

            $bid = $val['bid']==""? -1 : $val['bid'];
            $list[$key]['bid'] = $bid;

            $param = array(
                "service"     => "business",
                "template"    => "detail",
                "id"          => $val['sid']
            );
            $list[$key]["url"] = getUrlPath($param);

            //分销佣金
            $list[$key]['tg_yj'] = $val['tg_yj'];
            $list[$key]['yj_per'] = $val['yj_per'];
            $list[$key]['xinke'] = (int)$val['xinke'];
            //平台佣金
            $list[$key]['pt_yj_per'] = $val['pt_yj_per'];

            $pt_yj = 0;
            if($val['pt_yj_per'] > 0){
                $pt_yj = $val['pt_yj_per'] * $val['payamount'] / 100;
                $pt_yj = $pt_yj < 0.01 ? 0 : $pt_yj;
            }
            $list[$key]['pt_yj'] = sprintf("%.2f", $pt_yj);
            //实际到账
            $list[$key]['daozhang'] = $val['daozhang'];
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
    $fileName = "买单订单记录.csv";
    if($do == "export"){

        $tit = array();
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '城市'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '订单号'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '下单人ID'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '下单人'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '店铺ID'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '店铺名称'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '店铺地址'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '订单金额'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '不参与优惠金额'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '优惠金额'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '实付金额'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '分销佣金比例'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '分销佣金'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '客户类型'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '平台佣金比例'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '平台佣金'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '实际到账'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '付款方式'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '付款时间'));


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
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['userid']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['nickname']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['bid']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['bname']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['url']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['amount']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['amount_alone']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".sprintf("%.2f", $data['amount'] - $data['payamount'])));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['payamount']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['yj_per'] . "%"));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['tg_yj']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".($data['xinke'] == 1 ? "新客" : "老客")));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['pt_yj_per'] . "%"));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['pt_yj']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['daozhang']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['paytype']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".date('Y-m-d H:i:s', $data['paydate'])));


            //写入文件
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
        'admin/business/maiDanOrder.js'
    );
    $huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

    $huoniaoTag->assign('cityArr', $userLogin->getAdminCity());
    $huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/business";  //设置编译目录
    $huoniaoTag->display($templates);
}else{
    echo $templates."模板文件未找到！";
}
