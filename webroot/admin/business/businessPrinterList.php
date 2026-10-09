<?php
/**
 * 打印机管理
 *
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql  = new dsql($dbo);
$tpl   = dirname(__FILE__)."/../templates/business";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "businessPrinterList.html";

checkPurview("businessPrinterList");

$action = 'business';
$dir = HUONIAOROOT."/templates/".$action;


global $userLogin;
if($dopost == "getList"){
    $pagestep = $pagestep == "" ? 10 : $pagestep;
    $page     = $page == "" ? 1 : $page;

    $where = "";

    if($sKeyword != ""){
        $where .= " AND (p.`title` like '%$sKeyword%' OR s.`title` like '%$sKeyword%')";
    }
    if($sType != ""){
        if(!$type){
            if($dsql->getTypeList($sType, $tab."type")){
                $lower = arr_foreach($dsql->getTypeList($sType, $tab."type"));
                $lower = $sType.",".join(',',$lower);
            }else{
                $lower = $sType;
            }
            $where .= " AND p.`typeid` in ($lower)";
        }else{
            $where .= " AND p.`template` = '$sType'";
        }
    }

    if(!empty($sCity)){
        $where .= " AND p.`cityid` = $sCity";
    }

    $where .= " order by  p.`id` desc";

    $archives = $dsql->SetQuery("SELECT p.`id` FROM `#@__business_print` p LEFT JOIN `#@__business_list` s ON s.`id` = p.`sid` WHERE s.`id` > 0");
    //总条数
    $totalCount = $dsql->dsqlOper($archives.$where, "totalCount");
    //总分页数
    $totalPage = ceil($totalCount/$pagestep);

    $atpage = $pagestep*($page-1);
    $where .= " LIMIT $atpage, $pagestep";
    $archives = $dsql->SetQuery("SELECT p.`id`, p.`title`, p.`sid`, p.`mcode`, p.`msign`, p.`type`, p.`pubdate`, s.`title` storename FROM `#@__business_print` p LEFT JOIN `#@__business_list` s ON s.`id` = p.`sid` WHERE s.`id` > 0".$where);
    $results = $dsql->dsqlOper($archives, "results");

    if(count($results) > 0){
        $list = array();
        foreach ($results as $key=>$value) {
            $list[$key]["id"] = $value["id"];
            $list[$key]["title"] = $value["title"];
            $nickname = $userLogin->getMemberInfo($value["sid"]);
            $list[$key]["nickname"] = $value['storename'];
            $list[$key]["mcode"] = $value["mcode"];
            $list[$key]["msign"] = $value["msign"];
            $printsql = $dsql->SetQuery("SELECT `print_name` FROM `#@__business_print_config` WHERE `print_code` = '".$value['type']."'");
            $printresults = $dsql->dsqlOper($printsql, "results");
            $list[$key]["type"] = $printresults[0]["print_name"];
            $list[$key]["pudate"] = date("Y-m-d,H:i:s",$value["pubdate"]);
            $list[$key]["dateArr"] = explode(' ', date('Y-m-d H:i:s', $value["pubdate"]));
        }
        if(count($list) > 0){
            echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}, "adList": '.json_encode($list).'}';
        }else{
            echo '{"state": 101, "info": '.json_encode("暂无相关信息").'}';
        }

    }else{
        echo '{"state": 101, "info": '.json_encode("暂无相关信息").'}';
    }
    die;

//预览
}elseif($dopost == "preview"){

    if(!empty($id)){
        include_once(HUONIAOINC."/class/myad.class.php");
        $param = array(
            'id' => $id
        );
        $handler = true;
        echo '<script type="text/javascript" src="'.$cfg_staticPath.'/js/core/jquery-1.8.3.min.js"></script>';
        $ad = getMyAd($param);
        echo $ad;die;
    }

//删除
}elseif($dopost == "del"){
    if($id != ""  && $userType != 3){

        $each = explode(",", $id);
        $error = array();
        $title = array();
        foreach($each as $val){

            $archives = $dsql->SetQuery("DELETE  FROM `#@__business_print` WHERE `id` = ".$val);
            $results = $dsql->dsqlOper($archives, "update");
        }
        if(!empty($error)){
            echo '{"state": 200, "info": '.json_encode($error).'}';
        }else{
            echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
        }
        die;
    }
    die;

}

//验证模板文件
if(file_exists($tpl."/".$templates)){

    //js
    $jsFile = array(
        'ui/bootstrap.min.js',
        'ui/bootstrap-datetimepicker.min.js',
        // 'ui/jquery-ui-selectable.js',
        'ui/clipboard.min.js',
        'ui/jquery-smartMenu.js',
        'admin/business/businessPrinterList.js'
    );
    $huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

    $huoniaoTag->assign('action', $action);
    $huoniaoTag->assign('type', (int)$type);

    $huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/business";  //设置编译目录
    $huoniaoTag->display($templates);
}else{
    echo $templates."模板文件未找到！";
}

