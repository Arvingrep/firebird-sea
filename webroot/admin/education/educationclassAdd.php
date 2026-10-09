<?php
/**
 * 添加课程安排
 *
 * @version        $Id: educationclassAdd.php 2019-5-14 上午08:49:02 $
 * @package        HuoNiao.education
 * @copyright      Copyright (c) 2013 - 2019, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/education";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "educationclassAdd.html";

$tab = "education_class";
$dopost = $dopost ? $dopost : "save";        //操作类型 save添加 edit修改
$ptitle = $action == "educationclass" ? "课程" : "";
if($dopost == "edit"){
	$pagetitle = "修改".$ptitle."班级";
	checkPurview("educationcoursesEdit");
}else{
	$pagetitle = "添加".$ptitle."搬家";
	checkPurview("educationcoursesAdd");
}

if(!isset($coursesid)) $coursesid = 0;
$typeid = $typeid ? $typeid : 0;
$weight = (int)$weight;
$click  = (int)$click;
if(!empty($teacherid)) $teacherid = join(",", $teacherid);
$pubdate   = GetMkTime(time());
$openStart = GetMkTime($openStart);
$openEnd   = GetMkTime($openEnd);
$state = 1;

if($_POST['submit'] == "提交"){

	if($token == "") die('token传递失败！');
	//二次验证
	if(empty($coursesid)){
		echo '{"state": 200, "info": "".$ptitle."ID传递错误！"}';
		exit();
	}

	/* if(trim($classname) == ""){
		echo '{"state": 200, "info": "请输入班级名"}';
		exit();
	} */

}

if($dopost == "save" && $submit == "提交"){
    if ($classname && !empty($id)){
        $manyclass = [
            'openStart' =>$openStart,
            'classname' =>$classname,
            'openEnd' =>$openEnd,
            'address' =>$address,
            'teacherid' =>$teacherid,
            'typeid' =>$typeid,
            'price' =>$price,
            'desc' =>$desc,
            'classhour' =>$classhour,
            'openStart' =>$openStart,
        ];
        $teacher = explode(',',$manyclass['teacherid']);
        $cla = $dsql->SetQuery("SELECT `manyclass`,`teacherid`FROM `#@__education_class` WHERE `id` = ". $id);
        $resul = $dsql->dsqlOper($cla, "results");
        $man = unserialize($resul[0]['manyclass']);
        $tea =explode(',',$resul[0]['teacherid']);
        array_push($man,$manyclass);
        array_push($tea,$teacher);
        $many = serialize($man);
        $teacheridAr = implode(',',$tea);
        //保存到表
        $sql = $dsql->SetQuery("UPDATE `#@__education_class` SET `coursesid`='$coursesid',`manyclass` ='$many',`pubdate`='$pubdate',`state`='$state',`classtype` = '1',`teacherid` = '$teacheridAr' WHERE `id` = '$id' ");
        $aid = $dsql->dsqlOper($sql, "lastid");
        if(is_numeric($aid)){
            adminLog("添加".$ptitle."班级信息", $title);

            echo '{"state": 100}';
        }else{
            echo '{"state": 200, "info": '.json_encode("保存到数据库失败！").'}';
        }
        die;

    }else{
        //保存到表
        $archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."` (`classname`, `openStart`, `openEnd`, `coursesid`, `address`, `price`, `teacherid`, `typeid`, `desc`, `click`, `pubdate`, `weight`, `state`, `classhour`) VALUES ('$classname', '$openStart', '$openEnd', '$coursesid', '$address', '$price', '$teacherid', '$typeid', '$desc', '$click', '$pubdate', '$weight', '$state', '$classhour')");
        $aid = $dsql->dsqlOper($archives, "lastid");

        if(is_numeric($aid)){
            adminLog("添加".$ptitle."班级信息", $title);

            echo '{"state": 100}';
        }else{
            echo '{"state": 200, "info": '.json_encode("保存到数据库失败！").'}';
        }
        die;
    }
}elseif($dopost == "edit"){

	if($submit == "提交"){
        $archives = $dsql->SetQuery("SELECT `id`, `classname`, `coursesid`, `typeid`, `price`, `pubdate`, `weight`, `sale`,`manyclass` FROM `#@__".$tab."` WHERE `id`= $cid");
        $results = $dsql->dsqlOper($archives, "results");
        foreach ( $results as $k => $v){
            if ($v['manyclass']){
                $class = unserialize($v['manyclass']);
                $class[$id]['classname'] = $classname;
                $class[$id]['openStart']=$openStart;
                $class[$id]['openEnd'] =$openEnd;
                $class[$id]['address']=$address;
                $class[$id]['teacherid']=$teacherid;
                $class[$id]['typeid']=$typeid;
                $class[$id]['price'] =$price;
                $class[$id]['desc'] = $desc;
                $class[$id]['classhour'] =$classhour;
                    $manycl = serialize($class);

                //更新manyclass
                $sql = $dsql->SetQuery("UPDATE `#@__education_class` SET `manyclass` = '$manycl' WHERE `id` = '$cid'");
                $results=$dsql->dsqlOper($sql, "update");
                if($results == "ok"){
                    echo '{"state": 100, "info": '.json_encode('修改成功！').'}';
                }else{
                    echo '{"state": 200, "info": '.json_encode('修改失败！').'}';
                }
                die;
            }else{
                //保存到表
                $archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `classname` = '$classname', `openStart` = '$openStart', `openEnd` = '$openEnd', `coursesid` = '$coursesid', `address` = '$address', `price` = '$price', `teacherid` = '$teacherid', `typeid` = '$typeid', `desc` = '$desc', `click` = '$click', `weight` = '$weight', `state` = '$state', `classhour` = '$classhour' WHERE `id` = ".$id);
                $results = $dsql->dsqlOper($archives, "update");
                if($results == "ok"){
                    adminLog("修改".$ptitle."班级信息", $title);

                    echo '{"state": 100, "info": '.json_encode('修改成功！').'}';
                }else{
                    echo '{"state": 200, "info": '.json_encode('修改失败！').'}';
                }
                die;
            }
        }

	}

	if(!empty($id)){
                $archives = $dsql->SetQuery("SELECT `id`, `classname`, `coursesid`, `typeid`, `price`, `pubdate`, `weight`, `sale`,`manyclass` FROM `#@__".$tab."` WHERE `id`= $cid");
                $results = $dsql->dsqlOper($archives, "results");
                $classarr =[];
        foreach ( $results as $k => $v) {
            $classarr[] = $v['manyclass'];
        }
        if ($classarr[0]){
            $arr = array_filter(unserialize($classarr[0]));
        }
            if ($arr){
                foreach ($arr[$id] as $key=>$vv){
                    ${$key} = $vv;
                }

            }else{
                //主表信息
                $archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."` WHERE `id` = ".$id);
                $results = $dsql->dsqlOper($archives, "results");
                if(!empty($results)){
                    foreach ($results[0] as $key => $value) {
                        ${$key} = $value;
                    }
                }else{
                    ShowMsg('要修改的信息不存在或已删除！', "-1");
                    die;
                }
            }


	}else{
		ShowMsg('要修改的信息参数传递失败，请联系管理员！', "-1");
		die;
	}

}

//验证模板文件
if(file_exists($tpl."/".$templates)){

	//js
	$jsFile = array(
		'ui/jquery.dragsort-0.5.1.min.js',
		'ui/bootstrap-datetimepicker.min.js',
		'ui/jquery.dragsort-0.5.1.min.js',
		'publicUpload.js',
		'admin/education/educationclassAdd.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('dopost', $dopost);
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

	$sql = $dsql->SetQuery("SELECT `id`, `typename` FROM `#@__education_item` WHERE `parentid` = '3'");
	$typenameret = $dsql->getTypeName($sql);
	$typeidArr = array();
	if($typenameret){
		foreach($typenameret as $key => $value){
			$typeidArr[$key]['id'] = $value['id'];
			$typeidArr[$key]['typename'] = $value['typename'];
		}
	}
	$huoniaoTag->assign('typeidOpt', array_column($typeidArr, "id"));
	$huoniaoTag->assign('typeidNames', array_column($typeidArr, "typename"));
	$huoniaoTag->assign('typeid', $typeid? $typeid : 0);

	$sql = $dsql->SetQuery("SELECT `usertype`, `userid` FROM `#@__education_courses` WHERE `id` = '$coursesid'");
	$res = $dsql->getTypeName($sql);
	$usertype = 0;
	if($res){
		$usertype = $res[0]['usertype'];
		$userid   = $res[0]['userid'];
		$sql = $dsql->SetQuery("SELECT `id`, `name` FROM `#@__education_teacher` WHERE `company` = '".$res[0]['userid']."'");
		$res = $dsql->getTypeName($sql);
		$teacheridArr = array();
		if($res){
			foreach($res as $k => $value){
				$teacheridArr[$k]['id'] = $value['id'];
				$teacheridArr[$k]['typename'] = $value['name'];
			}
		}
	}
	$huoniaoTag->assign('usertype', $usertype);
	$huoniaoTag->assign('teacherID', array_column($teacheridArr, "id"));
	$huoniaoTag->assign('teacheridList', array_column($teacheridArr, "typename"));
	$huoniaoTag->assign('teacherids', empty($teacherid) ? "" : explode(',', $teacherid));

	//显示状态
	$huoniaoTag->assign('stateopt', array('0', '1', '2'));
	$huoniaoTag->assign('statenames',array('待审核','已审核','审核拒绝'));
	$huoniaoTag->assign('state', $state == "" ? 1 : $state);

	$huoniaoTag->assign('coursesid', $coursesid);
	$huoniaoTag->assign('id', $id);
	$huoniaoTag->assign('classname', $classname);
	$huoniaoTag->assign('classhour', $classhour);
	$huoniaoTag->assign('openStart', $openStart ? date("Y-m-d", $openStart) : '');
	$huoniaoTag->assign('address', $address);
	$huoniaoTag->assign('desc', $desc);
    $huoniaoTag->assign('cid', $cid);

	$huoniaoTag->assign('price', $price);
	$huoniaoTag->assign('sale', $sale);
	$huoniaoTag->assign('openEnd', $openEnd ? date("Y-m-d", $openEnd) : '');
	$huoniaoTag->assign('weight', $weight == "" ? "50" : $weight);

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/education";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
