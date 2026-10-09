<?php
/**
 * 管理课程安排信息
 *
 * @version        $Id: educationclass.php 2019-7-11 上午00:07:12 $
 * @package        HuoNiao.education
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("educationcoursesList");
$dsql  = new dsql($dbo);
$tpl   = dirname(__FILE__)."/../templates/education";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "educationclass.html";

$tab = "education_class";

if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

	$where = "";

	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__".$tab."` WHERE  `coursesid` = ".$id);
	//总条数
	$totalCount = $dsql->dsqlOper($archives.$where, "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);

	$where .= " order by `weight` desc, `pubdate` desc, `id` asc";
	$atpage = $pagestep*($page-1);
	$where .= " LIMIT $atpage, $pagestep";
	$archives = $dsql->SetQuery("SELECT `id`, `classname`, `coursesid`, `typeid`, `price`, `pubdate`, `weight`, `sale`,`manyclass` FROM `#@__".$tab."` WHERE `coursesid` = ".$id.$where);
	$results = $dsql->dsqlOper($archives, "results");
	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[$key]["id"] = $value["id"];
			$list[$key]["classname"] = $value["classname"];
			$list[$key]["coursesid"] = $value["coursesid"];
			$list[$key]["sale"] = $value["sale"];
			$list[$key]["price"] = $value["price"];
			$list[$key]["pubdate"] = $value["pubdate"] ? date("Y-m-d H:i:s", $value["pubdate"]) : '';
			$list[$key]["weight"] = $value["weight"];
            $list[$key]["cid"] = $value["id"];

            if ($value["manyclass"]){
                $class  = unserialize($value["manyclass"]);
                foreach ($class as $kk=>$v){
                    $typename = '';
                    if($v['typeid']){
                        $sql = $dsql->SetQuery("SELECT `typename` FROM `#@__education_item` WHERE `id` = " . $v['typeid']);
                        $Res = $dsql->dsqlOper($sql, "results");
                        $typename = $Res[0]['typename'];
                    }
                    $class[$kk]['typename']= $typename;
                    $class[$kk]['id']= $kk;
                    $class[$kk]['cid']= $value["id"];
                    $class[$kk]["sale"] = $value["sale"];
                    $class[$kk]["weight"] = $value["weight"];
                    $class[$kk]["pubdate"] = $value["pubdate"] ? date("Y-m-d H:i:s", $value["pubdate"]) : '';

                }
                $list[$key]["manyclass"]  = $class;

            }


            $itemSql    = $dsql->SetQuery("SELECT `typename` FROM `#@__education_item` WHERE `id` = ". $value['typeid']);
			$itemResult = $dsql->getTypeName($itemSql);
			$list[$key]["typename"] = $itemResult[0]["typename"];
		}

		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}, "educationclass": '.json_encode($list).'}';
		}else{
			echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}}';
		}

	}else{
		echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}}';
	}
	die;

//删除
}elseif($dopost == "del"){
	if(!testPurview("educationcoursesDel")){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};
	if($id != ""){

        $archives = $dsql->SetQuery("SELECT `id`, `classname`, `coursesid`, `typeid`, `price`, `pubdate`, `weight`, `sale`,`manyclass` FROM `#@__".$tab."` WHERE `id`= $cid");
        $results = $dsql->dsqlOper($archives, "results");
        $classarr =[];
        foreach ( $results as $k => $v) {
            $classarr[] = $v['manyclass'];
        }
        if (unserialize($classarr[0])){
            $arr = array_filter(unserialize($classarr[0]));
        }
       if ($arr){

           $claid = '';
           $treach = [];
            foreach ($arr as $kk =>$vv){
                    $kk = $id;
                $claid   = $kk;
                $treach = $vv['teacherid'];

            }
            $cla = explode(',',$claid);
            foreach ($cla as $ky =>$value){

                $uncid = explode(",", $value);
                   unset($arr[$uncid[0]]);
            }
            $manyclass = serialize($arr);
           //更新manyclass
           $sql = $dsql->SetQuery("UPDATE `#@__education_class` SET `manyclass` = '$manyclass',`teacherid`='$teacch' WHERE `id` = '$cid'");
           $dsql->dsqlOper($sql, "update");
            if ($dsql){
                echo '{"state": 100, "info": '.json_encode("删除成功！").'}';

            }
           die;
       }else{
           $each = explode(",", $cid);
           $error = array();
           $title = array();
           foreach($each as $val){
               $archives = $dsql->SetQuery("SELECT `classname` FROM `#@__".$tab."` WHERE `id` = ".$val);
               $results = $dsql->dsqlOper($archives, "results");

               //删除缩略图
               array_push($title, $results[0]['classname']);

               $archives = $dsql->SetQuery("DELETE FROM `#@__".$tab."` WHERE `id` = ".$val);
               $results = $dsql->dsqlOper($archives, "update");
               if($results != "ok"){
                   $error[] = $val;
               }
           }
           if(!empty($error)){
               echo '{"state": 200, "info": '.json_encode($error).'}';
           }else{
               adminLog("删除课程安排信息", join(", ", $title));
               echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
           }
           die;
       }


	}
	die;

}

//验证模板文件
if(file_exists($tpl."/".$templates)){

	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'ui/jquery-ui-selectable.js',
		'admin/education/educationclass.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	require_once(HUONIAOINC."/config/education.inc.php");
	global $customUpload;
	if($customUpload == 1){
		global $custom_thumbSize;
		global $custom_thumbType;
		global $custom_atlasSize;
		global $custom_atlasType;
		$huoniaoTag->assign('thumbSize', $custom_thumbSize);
		$huoniaoTag->assign('thumbType', "*.".str_replace("|", ";*.", $custom_thumbType));
		$huoniaoTag->assign('atlasSize', $custom_atlasSize);
		$huoniaoTag->assign('atlasType', "*.".str_replace("|", ";*.", $custom_atlasType));
	}
	$huoniaoTag->assign('action', $action);

	if($action == "educationclass"){
		//楼盘信息
		$videoSql = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__education_courses` WHERE `id` = ". $id);
		$videoResult = $dsql->getTypeName($videoSql);
		if(!$videoResult)die('课程不存在！');
		$huoniaoTag->assign('coursesid', $videoResult[0]['id']);
		$huoniaoTag->assign('coursesname', $videoResult[0]['title']);
        $classid = $dsql->SetQuery("SELECT `id` FROM `#@__education_class` WHERE `coursesid` = ". $id);
        $results = $dsql->dsqlOper($classid, "results");
            if ($results){
                $huoniaoTag->assign('id', $results[0]['id']);
            }

    }
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/education";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
