<?php
/**
 * 管理报名
 *
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("huodongReg");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/huodong";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "huodongReg.html";

//城市管理员，只能管理管辖城市的会员
$adminAreaIDs = '';
$ids = array();
if($userType == 3){
    //查询分类信息
    $sql = $dsql->SetQuery("SELECT `id` FROM `#@__huodong_list` WHERE `state` = 1" . getCityFilter('`cityid`'));
    $ret = $dsql->dsqlOper($sql, "results");
    if($ret){
        foreach ($ret as $key => $value) {
            array_push($ids, $value['id']);
        }
        if($ids){
            $ids = join(',', $ids);
        }
    }
}


global $handler;
$handler = true;

//获取评论列表
if($dopost == "getList"){
    $pagestep = $pagestep == "" ? 10 : $pagestep;
    $page     = $page == "" ? 1 : $page;

    $where = " ";

    if ($adminCity){
        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__huodong_list`  WHERE 1 = 1" . getWrongCityFilter('`cityid`', $adminCity));
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            $ids = array();
            foreach ($ret as $key => $value) {
                array_push($ids, $value['id']);
            }
            if($ids){
                $ids = join(',', $ids);
            }

            $where .= " AND r.`hid` in ($ids)";
        }
    }
    if($start != ""){
        $where .= " AND `date` >= ". GetMkTime($start." 00:00:00");
    }
    if($sKeyword != ""){

            $archives = $dsql->SetQuery("SELECT `id` FROM `#@__member`  WHERE  `nickname` like '%$sKeyword%'");
            $results = $dsql->dsqlOper($archives, "results");
            if(count($results) > 0){
                $list = array();
                foreach ($results as $key=>$value) {
                    $list[] = $value["id"];
                }
                $idList = join(",", $list);
                $where .= " AND (l.`title` like '%$sKeyword%' or r.`code` like '%$sKeyword%'  or r.`ordernum` like '%$sKeyword%' or  r.`uid` in ($idList))";
            }else{
                $archives = $dsql->SetQuery("SELECT `id`,`property` FROM `#@__huodong_reg`  WHERE  1 = 1");
                $results = $dsql->dsqlOper($archives, "results");
                $list = array();
                foreach ($results as $key=>$value) {
                    $uns = unserialize($value['property']);
                    if(is_array($uns)){
                        foreach ($uns as $kk=>$vv){
                            if (in_array($sKeyword,$vv)){
                                $list[] = $value["id"];
                            }
                        }
                    }

                }
                    if ($list){
                        $idList = join(",", $list);
                        $where .= " AND (l.`title` like '%$sKeyword%' or r.`code` like '%$sKeyword%' or r.`ordernum` like '%$sKeyword%' or  r.`id` in ($idList))";
                    }else{
                        $where .= " AND (l.`title` like '%$sKeyword%' or r.`code` like '%$sKeyword%' or r.`ordernum` like '%$sKeyword%')";

                    }
            }

    }

    $archives = $dsql->SetQuery("SELECT  r.`id`,l.`title`,l.`feetype`,r.`fid`,r.`uid`,r.`date`,r.`property`,r.`state`,r.`code`,r.`usedate`,r.`ordernum`,l.`id`lid FROM `#@__huodong_reg` r RIGHT JOIN `#@__huodong_list` l ON r.`hid` = l.`id`");

    //总条数
    $totalCount = $dsql->dsqlOper($archives." WHERE 1 = 1".$where." GROUP BY r.`id` ORDER BY r.`id` DESC", "totalCount");
    //总分页数
    $totalPage = ceil($totalCount/$pagestep);
    //带参与
    $totalCan= $dsql->dsqlOper($archives." WHERE r.`state` = 1".$where, "totalCount");
    //已完成
    $totalWan = $dsql->dsqlOper($archives." WHERE r.`state` = 2".$where, "totalCount");
    //已取消
    $totalQuxiao = $dsql->dsqlOper($archives." WHERE r.`state` = 3".$where, "totalCount");
    //已退款
    $totalRefund = $dsql->dsqlOper($archives." WHERE r.`state` = 4".$where, "totalCount");


    if($state != ""){
        $where .= " AND r.`state` = $state";

        if($state == 1){
            $totalPage = ceil($totalCan/$pagestep);
        }elseif($state == 2){
            $totalPage = ceil($totalWan/$pagestep);
        }elseif($state == 3){
            $totalPage = ceil($totalQuxiao/$pagestep);
        }elseif($state == 4){
            $totalPage = ceil($totalRefund/$pagestep);
        }
    }
    $where .= " GROUP BY r.`id` order by r.`id` desc";

    $atpage = $pagestep*($page-1);
    $where .= " LIMIT $atpage, $pagestep";
    $archives = $dsql->SetQuery("SELECT  r.`id`,l.`title`,l.`feetype`,r.`fid`,r.`uid`,r.`date`,r.`property`,r.`state`,r.`code`,r.`usedate`,r.`ordernum`,l.`id`lid FROM `#@__huodong_reg` r RIGHT JOIN `#@__huodong_list` l ON r.`hid` = l.`id` WHERE 1 = 1".$where);
    $results = $dsql->dsqlOper($archives, "results");

    if(count($results) > 0){
        $list = array();
        foreach ($results as $key=>$value) {
            $list[$key]["piaotitle"]    = '免费';
            $list[$key]["piaoprice"]    = '0';

            if ($value['fid']){
                $archives = $dsql->SetQuery("SELECT `title`,`price` FROM `#@__huodong_fee` WHERE `id` = ".$value['fid']);
                $results = $dsql->dsqlOper($archives, "results");
                $list[$key]["piaotitle"]    = $results[0]['title'];
                $list[$key]["piaoprice"]    = $results[0]['price'];
            }

            $list[$key]["id"]    = $value["id"];
            $list[$key]["title"] = $value["title"] ? $value["title"] : '';
            $list[$key]["feetype"] = $value["feetype"];
            $list[$key]["uid"] = $value["uid"];
            $username = "未知";
            if ($value["uid"]){
                $sql      = $dsql->SetQuery("SELECT `username`, `nickname` FROM `#@__member` WHERE `id` =".$value["uid"]);
                $ret      = $dsql->dsqlOper($sql, "results");
                if ($ret[0]['nickname']) {
                    $username = $ret[0]['nickname'] ? $ret[0]['nickname'] : $ret[0]['username'];
                }
            }

            $list[$key]["nickname"] =$username;
            $param = array(
                "service"  => "huodong",
                "template" => "detail",
                "id"       => $value['lid']
            );
            $urlParam = getUrlPath($param);
            $list[$key]["urlparam"] = $urlParam;
            $list[$key]["date"] = date('Y-m-d H:i:s',$value["date"]);
            $list[$key]["property"]    = $value['property'] ? unserialize($value['property']) : array();
            $Str = array();
            if (is_array($list[$key]["property"])){
                foreach ($list[$key]["property"] as $kk=>$vv){
                    $_kk = array_keys($vv)[0];
                    $_vv = $vv[$_kk];
                    if($_kk == 'areaCode'){
                        $_kk = '区号';
                    }
                    $Str[]= $_kk . '：' . $_vv;
                }
            }

            $list[$key]["propertyStr"]    = implode("\r\n", $Str);
            switch ($value["state"]) {
                case "1":
                    $state = "<span class='gray'>待参与</span>";
                    break;
                case "2":
                    $state = "<span style='color:#00aa00;'>已完成</span>";
                    break;
                case "3":
                    $state = "<span class='refuse'>已取消</span>";
                    break;
                case "4":
                    $state = "<span style='color:#faa732;'>已退款</span>";
                    break;
            }

            $list[$key]["_state"] = (int)$value["state"];
            $list[$key]["state"] = $state;
            $list[$key]["code"] = $value["code"];
            $list[$key]["ordernum"] = $value["ordernum"];

            $paytype = '';
            $refrunddate = 0;
            $refrundno = '';
            if($value["ordernum"]){
                $archives = $dsql->SetQuery("SELECT `paytype`, `refrundno`, `refrunddate`, `price` FROM `#@__huodong_order` WHERE `ordernum` = '".$value['ordernum']."'");
                $results = $dsql->dsqlOper($archives, "results");
                if($results){
                    $paytype = $results[0]['paytype'];
                    $refrunddate = $results[0]['refrunddate'] ? date('Y-m-d H:i:s',$results[0]['refrunddate']) : '';
                    $refrundno = $results[0]['refrundno'];
                    $list[$key]["piaoprice"] = (float)$results[0]['price'];
                }
            }
            $list[$key]["paytype"] = getPaymentName($paytype);
            $list[$key]["refrunddate"] = $refrunddate;
            $list[$key]["refrundno"] = $refrundno;

            $list[$key]["usedate"] = $value["usedate"] ? date('Y-m-d H:i:s',$value["usedate"]) : '';

        }
        if(count($list) > 0){
            if($do != "export") {
                echo '{"state": 100, "info": ' . json_encode("获取成功") . ', "pageInfo": {"totalPage": ' . $totalPage . ', "totalCount": ' . $totalCount . ', "totalCan": ' . $totalCan . ', "totalWan": ' . $totalWan . ', "totalQuxiao": ' . $totalQuxiao . ', "totalRefund": ' . $totalRefund . '},"commonList": ' . json_encode($list) . '}';
                die;
            }
        }else{
            if($do != "export") {
                echo '{"state": 101, "info": ' . json_encode("暂无相关信息") . ', "pageInfo": {"totalPage": ' . $totalPage . '}}';
                die;
            }

        }
    }else{
        if($do != "export") {
            echo '{"state": 101, "info": ' . json_encode("暂无相关信息") . ', "pageInfo": {"totalPage": ' . $totalPage . '}}';
            die;
        }
    }
    //导出数据
    $fileName = "活动报名记录.csv";
    if ($do = 'export'){
        $tit = array();
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '活动标题'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '活动票型'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '活动金额'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '支付方式'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '报名会员'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '报名资料'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '报名时间'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '状态'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '票号'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '订单号'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '验票时间'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '退款时间'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '退款单号'));


        $folder = HUONIAOROOT . "/uploads/siteConfig/file/";
        $filePath = $folder.$fileName;
        MkdirAll($folder);
        $file = fopen($filePath, "w");

        //表头
        fputcsv($file, $tit);

        foreach($list as $data){
            $arr = array();
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['title']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['piaotitle']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['piaoprice']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['paytype']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['nickname']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['propertyStr']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['date']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".strip_tags($data['state'])));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['code']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['ordernum']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['usedate']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['refrunddate']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['refrundno']));
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
        'ui/jquery-ui-selectable.js',
        'ui/bootstrap-datetimepicker.min.js',
        'ui/chosen.jquery.min.js',
        'admin/huodong/huodongReg.js'
    );
    $huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
    $huoniaoTag->assign('cityList', json_encode($adminCityArr));
    $huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/huodong";  //设置编译目录
    $huoniaoTag->display($templates);
}else{
    echo $templates."模板文件未找到！";
}
