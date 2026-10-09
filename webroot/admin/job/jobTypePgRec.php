<?php
/**
 * 管理招聘职位
 *
 * @version        $Id: jobSentence.php 2014-3-18 上午11:05:08 $
 * @package        HuoNiao.Job
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("jobSentence" . $type);
$dsql  = new dsql($dbo);
$tpl   = dirname(__FILE__)."/../templates/job";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "jobTypePgRec.html";

$tab = "job_type_pg_rec";

if($dopost == "getList"){
    $pagestep = $pagestep == "" ? 10 : $pagestep;
    $page     = $page == "" ? 1 : $page;

    $where = getCityFilter('`cityid`');

    if ($cityid) {
        $where .= getWrongCityFilter('`cityid`', $cityid);
    }

    if($sKeyword != ""){
        $where .= " AND (`title` like '%".$sKeyword."%')";
    }

    if($start != ""){
        $where .= " AND `pubdate` >= ". GetMkTime($start);
    }

    if($end != ""){
        $where .= " AND `pubdate` <= ". GetMkTime($end . " 23:59:59");
    }

    $archives = $dsql->SetQuery("SELECT `id` FROM `#@__".$tab."` WHERE 1=1");

    //总条数
    $totalCount = $dsql->dsqlOper($archives.$where, "totalCount");
    //总分页数
    $totalPage = ceil($totalCount/$pagestep);

    $where .= " order by `pubdate` desc";

    $atpage = $pagestep*($page-1);
    $where .= " LIMIT $atpage, $pagestep";
    $archives = $dsql->SetQuery("SELECT `id`, `uid`,`title`,`pubdate`,`cityid` FROM `#@__".$tab."` WHERE 1 = 1".$where);
    $results = $dsql->dsqlOper($archives, "results");

    if(count($results) > 0){
        $list = array();
        foreach ($results as $key=>$value) {
            $list[$key]["id"] = $value["id"];

            $cityname = getSiteCityName($value['cityid']);
            $list[$key]['cityname'] = $cityname ?: "未知";

            $list[$key]["title"] = $value["title"];

            $sql = $dsql::SetQuery("select `nickname` from `#@__member` where `id`=".$value['uid']);
            $nickname = $dsql->getOne($sql);

            $list[$key]["nickname"] = $nickname;
            $list[$key]["uid"] = $value['uid'];
            $list[$key]["pubdate"] = date('Y-m-d H:i:s', $value["pubdate"]);
        }

        if(count($list) > 0){
            echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}, "jobSentence": '.json_encode($list).'}';
        }else{
            echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}}';
        }

    }else{
        echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}}';
    }
    die;

//删除
}elseif($dopost == "del"){
    if(!testPurview("jobSentencephptype".$type."Del")){
        die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
    };
    if($id != ""){

        $each = explode(",", $id);
        $error = array();
        $title = array();
        foreach($each as $val){
            $archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."` WHERE `id` = ".$val);
            $results = $dsql->dsqlOper($archives, "results");

            array_push($title, $results[0]['title']);

            //删除表
            $archives = $dsql->SetQuery("DELETE FROM `#@__".$tab."` WHERE `id` = ".$val);
            $results = $dsql->dsqlOper($archives, "update");
            if($results != "ok"){
                $error[] = $val;
            }else{
                // 清除缓存
                clearCache("job_sentence_total", "key");
            }
        }
        if(!empty($error)){
            echo '{"state": 200, "info": '.json_encode($error).'}';
        }else{
            adminLog("删除普工职位建议", join(", ", $title));
            echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
        }
        die;

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
        'ui/bootstrap-datetimepicker.min.js',
        'ui/bootstrap.min.js',
        'ui/jquery-ui-selectable.js',
        'ui/chosen.jquery.min.js',
        'admin/job/jobTypePgRec.js'
    );
    $huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
    $huoniaoTag->assign('type', $type);
    $huoniaoTag->assign('notice', $notice);

    $huoniaoTag->assign('cityList', json_encode($adminCityArr));
    $huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/job";  //设置编译目录
    $huoniaoTag->display($templates);
}else{
    echo $templates."模板文件未找到！";
}
