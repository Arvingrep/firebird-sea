<?php
/**
 * 付费查看记录
 *
 * @version        $Id: videoList.php 2017-1-18 下午16:45:11 $
 * @package        HuoNiao.Image
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/video";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "videoPayLogs.html";
if($action == ""){
	$action = "video";
}
if($dopost == "getList"){

    $pagestep = $pagestep == "" ? 10 : $pagestep;
    $page     = $page == "" ? 1 : $page;

    $where = "";
    if($sKeyword!=""){
        $sKeyword = trim($sKeyword);
        $isId = substr($sKeyword,0,1)=="#";
        $searchId = substr($sKeyword,1);
        if(is_numeric($searchId)){
            $where .= " and o.`aid`=$searchId";
        }else{
            $where .= " and (o.`ordernum` like '%$sKeyword%' or m.`nickname` like '%$sKeyword%')";
        }
    }

    if($sType!=""){
        $where .= " and l.`typeid`=$sType";
    }

    if($adminCity){
        $where .= getWrongCityFilter('l.`cityid`', $adminCity);
    }

    //统计总金额
    $archives = $dsql->SetQuery("SELECT sum(o.`amount`) FROM `#@__video_order` o left join `#@__videolist` l on o.`aid`=l.`id` left join `#@__member` m on o.`uid`=m.`id` where o.`state`=1".$where);
    $allMoney = (float)$dsql->getOne($archives);


    $archives = $dsql->SetQuery("SELECT o.`id` FROM `#@__video_order` o left join `#@__videolist` l on o.`aid`=l.`id` left join `#@__member` m on o.`uid`=m.`id` WHERE o.`state`=1 ".$where);

    //总条数
    $totalCount = $dsql->dsqlOper($archives, "totalCount");
    //总分页数
    $totalPage = ceil($totalCount/$pagestep);

    $where .= " order by o.`id` desc";

    $atpage = $pagestep*($page-1);
    $where .= " LIMIT $atpage, $pagestep";
    $archives = $dsql->SetQuery("SELECT o.* FROM `#@__video_order` o left join `#@__videolist` l on o.`aid`=l.`id` left join `#@__member` m on o.`uid`=m.`id` WHERE o.`state`=1 ".$where);
    $results = $dsql->dsqlOper($archives, "results");

    if(count($results) > 0){
        $list = array();
        foreach ($results as $key=>$value) {
            $list[$key]["id"] = $value["id"];
            $list[$key]["ordernum"] = $value["ordernum"];
            $list[$key]["amount"] = $value["amount"];
            $admin = $value['uid'];
            $adminame = "";
            $sql = $dsql->SetQuery("SELECT `username`, `nickname` FROM `#@__member` WHERE `id` = $admin");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $adminame = $ret[0]['nickname'] ? $ret[0]['nickname'] : $ret[0]['username'];
            }
            $list[$key]['admin'] = $admin;
            $list[$key]['adminame'] = $adminame;
            $list[$key]["pubdate"] = date('Y-m-d H:i:s',$value["paydate"]);
            $list[$key]["paytype"] = getPaymentName($value["paytype"]);

            $aid = $value['aid'];  //视频id
            $list[$key]['aid'] = $aid;
            $sql = $dsql::SetQuery("SELECT `title`,`flag`,`redirecturl` FROM `#@__videolist` WHERE `id` = ".$aid);
            $videoDetail = $dsql->getArr($sql)?:"";

            $list[$key]["title"] = htmlentities($videoDetail['title'], ENT_NOQUOTES, "utf-8");

            $append = $videoDetail["flag"];
            $append = str_replace("h", "头", $append);
            $append = str_replace("r", "推", $append);
            $append = str_replace("b", "粗", $append);
            $append = str_replace("t", "跳", $append);
            $append = str_replace("p", "图", $append);

            $list[$key]["append"] = $append;

            $param = array(
                "service"     => 'video',
                "template"    => "detail",
                "id"          => $aid,
                "flag"        => $videoDetail['flag'],
                "redirecturl" => $videoDetail['redirecturl']
            );
            $list[$key]['url']        = getUrlPath($param);
        }

        if(count($list) > 0){
            if($do != "export"){
                echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.',"totalMoney":'.$allMoney.'}, "articleList": '.json_encode($list).'}';
            }
        }else{
            if($do != "export"){
                echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.',"totalMoney":'.$allMoney.'}}';
            }
        }

    }else{
        if($do != "export"){
            echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.',"totalMoney":'.$allMoney.'}}';
        }
    }
    //导出数据
    $fileName = $payname . "付费观看记录数据.csv";
    if($do == "export"){

        $tit = array();
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '视频标题'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '订单号'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '会员id'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '会员昵称'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '支付时间/支付方式'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '支付金额'));


        $folder = HUONIAOROOT . "/uploads/siteConfig/file/";
        $filePath = $folder.$fileName;
        MkdirAll($folder);
        $file = fopen($filePath, "w");

        //表头
        fputcsv($file, $tit);

        foreach($list as $data){
            $arr = array();
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['title']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['ordernum']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['admin']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['adminame']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['pubdate']."\t".$data['paytype']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['amount']));

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

checkPurview("videoPayLogs".$action);
//css
$cssFile = array(
    'ui/jquery.chosen.css',
    'admin/chosen.min.css'
);
$huoniaoTag->assign('cssFile', includeFile('css', $cssFile));
//验证模板文件
if(file_exists($tpl."/".$templates)){

	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'ui/jquery-ui-selectable.js',
		'ui/jquery-smartMenu.js',
        'ui/chosen.jquery.min.js',
		'admin/video/videoPayLogs.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
	$huoniaoTag->assign('action', $action);
	$huoniaoTag->assign('sKeyword', $sKeyword);
	$huoniaoTag->assign('recycle', $recycle);
    $huoniaoTag->assign('cityList', json_encode($adminCityArr));
	$huoniaoTag->assign('typeListArr', json_encode($dsql->getTypeList(0, $action."type")));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/video";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
