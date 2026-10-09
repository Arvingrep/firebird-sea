<?php
/**
 * 配送员提现记录
 *
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("waimaiTixianLog");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/waimai";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "waimaiTixianLog.html";

$leimuallarr = array(
    '0'       =>   '银行卡',
    '1'       =>   '支付宝',
    '2'       =>   '微信'
);



$action = "member_withdraw";

if($dopost == "getList"){

    // 页面大小 $pageSize
    $pagestep = $pagestep == "" ? 10 : $pagestep;
    // 当前页数 $page
    $page     = $page == "" ? 1 : $page;

    $where = " and l.usertype=1";  // 固定值

    //搜索关键字
    $sKeyword = trim($sKeyword);
    if($sKeyword!=""){
        $where .= " and (1=2";
        $where .= " or m.`name` like  '%$sKeyword%'"; // 姓名
        $where .= ")";
    }
    // 城市ID
    if($userType == 3){
        $where .= " AND m.`cityid` in ('$adminCityIds')";
    }
    if($cityid!=""){
        $cityid = (int)$cityid;
        $where .= " AND m.`cityid` = $cityid";
    }
    // 开始时间和结束时间
    if($start != ""){
        $where .= " AND l.`tdate` >= ". GetMkTime($start." 00:00:00");
    }
    if($end != ""){
        $where .= " AND l.`tdate` <= ". GetMkTime($end." 23:59:59");
    }
    //账号类型
    if($leimutype!=""){
        if($leimutype==0){
            $where .= " AND l.`bank` not in('alipay','weixin')";
        }
        elseif($leimutype==1){
            $where .= " AND l.`bank`='alipay'";
        }
        elseif($leimutype==2){
            $where .= " AND l.`bank`='weixin'";
        }
    }
    // 基础sql
    $baseSql = $dsql->SetQuery("select l.`id`,l.`uid`,a.`typename`,m.name,l.`bank`,l.`cardnum`,l.`cardname`,l.`amount`,l.`tdate`,l.`state`,l.`auditstate`,l.`type`,l.`proportion`,l.`price`,l.`note`,l.`usertype`,l.`shouxuprice` from `#@__member_withdraw` l LEFT JOIN `#@__waimai_courier` m ON l.`uid`=m.`id` LEFT JOIN `#@__site_area` a ON m.`cityid`=a.`id` WHERE 1=1 ".$where);

    //未审核
    $info1 = $dsql->count($baseSql." and l.`state` = 0");
    //审核通过
    $info2 = $dsql->count($baseSql." and l.`state` = 1");
    //审核失败
    $info3 = $dsql->count($baseSql." and l.`state`=2");
    // 类型
    if ($type!=""){
        //审核状态
        $baseSql .= " AND l.`state` = $type";
        $where .= " AND l.`state` = $type";
    }
    // 默认排序
    $baseSql .= " order by `tdate` desc";

    //总金额
    $sumSql = $dsql->SetQuery("select sum(l.`price`) from `#@__member_withdraw` l LEFT JOIN `#@__waimai_courier` m ON l.`uid`=m.`id` LEFT JOIN `#@__site_area` a ON m.`cityid`=a.`id` WHERE 1=1 ".$where);
    $totalMoney = (float)$dsql->getOne($sumSql);


    $pageObj =  $dsql->getPage($page,$pagestep,$baseSql);

    $results = & $pageObj['list'];
    $pageInfo = json_encode($pageObj['pageInfo']);

    $list = array();

    if(count($results) > 0){
        foreach ($results as $key=>$value) {
            $list[$key]["id"] = $value["id"];

            // 城市信息
            $list[$key]["addrname"] = $value["typename"] ?: "未知";

            // 用户信息
            $list[$key]["userid"] = $value["uid"];
            $list[$key]["username"] = $value['name'] ?: "未知";

            // 提现账号
            if ($value['bank'] == 'alipay'){
                $value['bank'] = '支付宝';
            }elseif($value['bank'] == 'weixin'){
                $value['bank'] = '微信';
            }
            $list[$key]["bank"] = $value['bank'];
            $list[$key]["cardname"] = $value['cardname'];
            $list[$key]["cardnum"] = $value['cardnum'];

            // 金额
            $list[$key]["price"] = $value['price'];


            $list[$key]["type"] = $value["state"];
            $list[$key]["auditstate"] = $value["auditstate"];
            $list[$key]["date"] = date('Y-m-d H:i:s', $value["tdate"]);
            // 状态
            $list[$key]["state"] = $value['state'];
        }

        if(count($list) > 0){
            if($do != "export") {
                echo '{"state": 100, "info": ' . json_encode("获取成功") . ', "pageInfo": ' . $pageInfo . ', "info1": ' . $info1 . ',"info2":' . $info2 .',"info3":'.$info3.',"money":'.$totalMoney. ',"list":' . json_encode($list) . '}';
            }
        }else{
            if($do != "export"){
                echo '{"state": 200, "info": ' . json_encode("暂无相关信息") . ', "pageInfo": ' . $pageInfo . ', "info1": ' . $info1 . ',"info2":' . $info2 .',"info3":'.$info3.',"money":'.$totalMoney. ',"list":' . json_encode($list) . '}';
            }
        }

    }else{
        if($do != "export"){
            echo '{"state": 200, "info": ' . json_encode("暂无相关信息") . ', "pageInfo": ' . $pageInfo . ', "info1": ' . $info1 . ',"info2":' . $info2 .',"info3":'.$info3.',"money":'.$totalMoney. ',"list":' . json_encode($list) . '}';
        }
    }
    //导出数据
    $fileName = "配送员提现记录.csv";
    if($do == "export"){

        $tit = array();
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '城市'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '姓名'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '申请时间'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '提现账号'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '金额'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '状态'));


        $folder = HUONIAOROOT . "/uploads/siteConfig/file/";
        $filePath = $folder.$fileName;
        MkdirAll($folder);
        $file = fopen($filePath, "w");

        //表头
        fputcsv($file, $tit);

        foreach($list as $data){
            $arr = array();
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['addrname']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['username']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['date']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['cardname'].$data['bank']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['price']));
            $showState = "";
            if($data['state']==1){
                $showState = "成功";
            }
            elseif($data['state']==2){
                $showState = "失败";
            }
            elseif($data['state']==0){
                if($data['auditstate']==1){
                    $showState = "审核通过，待打款";
                }else{
                    $showState = "审核中";
                }
            }
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $showState));

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
//验证模板文件
$huoniaoTag->assign("leimuallarr",$leimuallarr);
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
        'admin/waimai/waimaiTixianLog.js'
    );
    $huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

    $huoniaoTag->assign('cityArr', $userLogin->getAdminCity());
    $huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/member";  //设置编译目录
    $huoniaoTag->display($templates);
}else{
    echo $templates."模板文件未找到！";
}
