<?php
/**
 * 全景模块JSON
 *
 * @version        $Id: quanjingJson.php 2018-6-6 下午16:48:10 $
 * @package        HuoNiao.Image
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql  = new dsql($dbo);

$dotitle = "全景";

//列表
if($action == ""){

	if(!testPurview("quanjingList")){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};

	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

	$del = 0;
	if($aType != ""){
		$del = 1;
	}

    $where = getCityFilter('`cityid`');

    if ($adminCity) {
        $where .= getWrongCityFilter('`cityid`', $adminCity);
    }

	if($sKeyword != ""){
		$where .= " AND `title` like '%$sKeyword%'";
	}
	if($sType != ""){
		if($dsql->getTypeList($sType, $dopost."type")){
			$lower = arr_foreach($dsql->getTypeList($sType, $dopost."type"));
			$lower = $sType.",".join(',',$lower);
		}else{
			$lower = $sType;
		}
		$where .= " AND `typeid` in ($lower)";
	}
	if($property != ""){
		$where .= " AND `flag` LIKE '%$property%'";
	}

	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__".$dopost."list` WHERE `del` = $del");

	//总条数
	$totalCount = $dsql->dsqlOper($archives.$where, "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);
	//待审核
	$totalGray = $dsql->dsqlOper($archives." AND `arcrank` = 0".$where, "totalCount");
	//已审核
	$totalAudit = $dsql->dsqlOper($archives." AND `arcrank` = 1".$where, "totalCount");
	//拒绝审核
	$totalRefuse = $dsql->dsqlOper($archives." AND `arcrank` = 2".$where, "totalCount");

	if($state != ""){
		$where .= " AND `arcrank` = $state";

		if($state == 0){
			$totalPage = ceil($totalGray/$pagestep);
		}elseif($state == 1){
			$totalPage = ceil($totalAudit/$pagestep);
		}elseif($state == 2){
			$totalPage = ceil($totalRefuse/$pagestep);
		}

	}
	$where .= " order by `id` desc";

	$atpage = $pagestep*($page-1);
	$where .= " LIMIT $atpage, $pagestep";
	if($dopost == "pic"){
		$archives = $dsql->SetQuery("SELECT `id`, `cityid`, `title`, `litpic`, `color`, `flag`, `redirecturl`, `typeid`, `weight`, `admin`, `arcrank`, `pubdate` FROM `#@__".$dopost."list` WHERE `del` = $del".$where);
	}else{
		$archives = $dsql->SetQuery("SELECT `id`, `cityid`, `title`, `color`, `flag`, `redirecturl`, `typeid`, `weight`, `admin`, `arcrank`, `pubdate` FROM `#@__".$dopost."list` WHERE `del` = $del".$where);
	}
	$results = $dsql->dsqlOper($archives, "results");

	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[$key]["id"] = $value["id"];
			$list[$key]["title"] = htmlentities($value["title"], ENT_NOQUOTES, "utf-8");
			if($dopost == "pic"){
				$list[$key]["litpic"] = $value["litpic"];
			}
			$list[$key]["color"] = $value["color"];

			$append = $value["flag"];
			$append = str_replace("h", "头", $append);
			$append = str_replace("r", "推", $append);
			$append = str_replace("b", "粗", $append);
			$append = str_replace("t", "跳", $append);
			$append = str_replace("p", "图", $append);

			$list[$key]["append"] = $append;
			$list[$key]["typeid"] = $value["typeid"];

			$typeSql = $dsql->SetQuery("SELECT `typename` FROM `#@__".$dopost."type` WHERE `id` = ". $value["typeid"]);
			$typename = $dsql->getTypeName($typeSql);

			$list[$key]["type"] = $typename[0]['typename'];
			$list[$key]["sort"] = $value["weight"];

			$state = "";
			switch($value["arcrank"]){
				case "0":
					$state = "等待审核";
					break;
				case "1":
					$state = "审核通过";
					break;
				case "2":
					$state = "审核拒绝";
					break;
			}

			$list[$key]["state"] = $state;
			$list[$key]["date"] = date('y-m-d H:i:s', $value["pubdate"]);

            $cityname = getSiteCityName($value['cityid']);
            $list[$key]['cityname'] = $cityname;

			$admin = $value['admin'];
			$adminame = "";
			$sql = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = $admin");
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				$adminame = $ret[0]['username'];
			}
			$list[$key]['admin'] = $admin;
			$list[$key]['adminame'] = $adminame;

			$param = array(
				"service"     => $dopost,
				"template"    => "detail",
				"id"          => $value['id'],
			);
			$list[$key]['url']        = getUrlPath($param);
		}

		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}, "articleList": '.json_encode($list).'}';
		}else{
			echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}}';
		}

	}else{
		echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}}';
	}

//删除
}else if($action == "del"){

	if(!testPurview("del".$dopost)){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};

	$each = explode(",", $id);
	$error = array();
	$async = array();
	if($id != ""){
		foreach($each as $val){
			$archives = $dsql->SetQuery("UPDATE `#@__".$dopost."list` SET `del` = 1 WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				$error[] = $val;
			}else{
			    $async[] = $val;
            }
		}
        dataAsync("quanjing",$async);  // 全景、删除
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			adminLog("转移".$dowtitle."信息至回收站", $id);
			echo '{"state": 100, "info": '.json_encode("所选信息已转移至回收站！").'}';
		}
	}

//彻底删除
}else if($action == "fullyDel"){
	if(!testPurview("del".$dopost)){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};
	if($id != ""){

		$each = explode(",", $id);
		$error = array();
		$async = array();
		$title = array();
		foreach($each as $val){

			$archives = $dsql->SetQuery("SELECT * FROM `#@__".$dopost."list` WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "results");

			array_push($title, $results[0]['title']);

			//删除缩略图
			delPicFile($results[0]['litpic'], "delThumb", $dopost);

			$file = $results[0]['file'];
			if($file){
				if(strpos($file, "http") === false){
					$file_ = HUONIAOROOT.$file;
					if(file_exists($file_)) {
						// 遍历解压包
						$filePath = dirname($file_);
			       		removeDir($filePath);
					}else{
						delPicFile($file, "delFlash", $dopost);
					}
				}
			}

			//删除表
			$archives = $dsql->SetQuery("DELETE FROM `#@__".$dopost."list` WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				$error[] = $val;
			}else{
			    $async[] = $val;
            }
		}
		dataAsync("quanjing",$async);  // 全景、彻底删除
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			adminLog("删除".$dotitle."信息", join(", ", $title));
			echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
		}
		die;
	}
	die;

//还原
}else if($action == "revert"){
	if(!testPurview("del".$dopost)){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};
	$each = explode(",", $id);
	$error = array();
	$async = array();
	if($id != ""){
		foreach($each as $val){
			$archives = $dsql->SetQuery("UPDATE `#@__".$dopost."list` SET `del` = 0 WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				$error[] = $val;
			}else{
			    $async[] = $val;
            }
		}
		dataAsync("quanjing",$async);  // 全景、还原
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			adminLog("还原".$dowtitle."信息", $id);
			echo '{"state": 100, "info": '.json_encode("所选信息还原成功！").'}';
		}
	}

//添加属性
}else if($action == "addProperty"){
	if(!testPurview("edit".$dopost)){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};
	$each = explode(",", $id);
	$error = array();
	if($id != ""){
		foreach($each as $val){
			$archives = $dsql->SetQuery("SELECT `flag` FROM `#@__".$dopost."list` WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "results");

			$flag = $results[0]["flag"] == "" ? $attr : $results[0]["flag"] . "," . $attr;

			if(strpos($results[0]["flag"], "p") !== false){
				$flag .= ",p";
			}

			$archives = $dsql->SetQuery("UPDATE `#@__".$dopost."list` SET `flag` = '$flag' WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");

			if($results != "ok"){
				$error[] = $val;
			}
		}
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			adminLog("添加".$dowtitle."信息属性", $attr);
			echo '{"state": 100, "info": '.json_encode("属性添加成功！").'}';
		}
	}

//删除属性
}else if($action == "delProperty"){
	if(!testPurview("edit".$dopost)){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};
	$each = explode(",", $id);
	$error = array();
	if($id != ""){
		foreach($each as $val){
			$archives = $dsql->SetQuery("SELECT `flag` FROM `#@__".$dopost."list` WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "results");

			$flag = $results[0]["flag"];

			if(trim($flag) != ''){
				$flags  = explode(',', $flag);
				$okflags = array();
				foreach($flags as $f){
					if(!strstr($attr, $f)) $okflags[] = $f;
				}

				$flag = trim(join(',', $okflags));

				$archives = $dsql->SetQuery("UPDATE `#@__".$dopost."list` SET `flag` = '$flag' WHERE `id` = ".$val);
				$results = $dsql->dsqlOper($archives, "update");

				if($results != "ok"){
					$error[] = $val;
				}
			}
		}
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			adminLog("删除".$dowtitle."信息属性", $attr);
			echo '{"state": 100, "info": '.json_encode("属性删除成功！").'}';
		}
	}

//移动分类
}else if($action == "move"){
	if(!testPurview("edit".$dopost)){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};
	$each = explode(",", $id);
	$error = array();
	if($id != ""){
		foreach($each as $val){
			$archives = $dsql->SetQuery("UPDATE `#@__".$dopost."list` SET `typeid` = $typeid WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				$error[] = $val;
			}
		}
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			adminLog("转移".$dowtitle."信息", $id."=>".$typeid);
			echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
		}
	}

//更新状态
}else if($action == "updateState"){
	if(!testPurview("edit".$dopost)){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};
	$each = explode(",", $id);
	$error = array();
	$async = array();

	global $handler;
	$handler = true;

	if($id != ""){
		foreach($each as $val){

			//更新记录状态
			$archives = $dsql->SetQuery("UPDATE `#@__".$dopost."list` SET `arcrank` = $arcrank WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				$error[] = $val;
			}else{
			    $async[] = $val;
            }
		}
		dataAsync("quanjing",$async);  // 全景、更新
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			adminLog("更新".$dowtitle."信息状态", $id."=>".$arcrank);
			echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
		}
	}

//获取指定ID信息详情
}else if($action == "getArticleDetail"){
	if($id != ""){
		$archives = $dsql->SetQuery("SELECT `typeid`, `title`, `subtitle`, `flag`, `arcrank` FROM `#@__".$dopost."list` WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "results");
		echo json_encode($results);
	}

//更新快速编辑信息
}else if($action == "updateDetail"){
	if(!testPurview("edit".$dopost)){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};
	$flags    = isset($flags) ? join(',',$flags) : '';

	if($id == "") die('要修改的信息ID传递失败！');
	//对字符进行处理
	$title       = cn_substrR($title,60);
	$subtitle    = cn_substrR($subtitle,36);

	//表单二次验证
	if(trim($title) == ''){
		echo '{"state": 101, "info": '.json_encode("标题不能为空！").'}';
		exit();
	}

	if($typeid == ''){
		echo '{"state": 101, "info": '.json_encode("请选择文章分类！").'}';
		exit();
	}

	$archives = $dsql->SetQuery("UPDATE `#@__".$dopost."list` SET `typeid` = $typeid, `title` = '$title', `subtitle` = '$subtitle', `flag` = '$flags', `arcrank` = $arcrank WHERE `id` = ".$id);
	$results = $dsql->dsqlOper($archives, "update");
	if($results != "ok"){
		echo $results;
	}else{
		adminLog("快速编辑".$dowtitle."信息", $id);
		echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
	}

//更新文章分类
}else if($action == "typeAjax"){
	if(!testPurview("quanjingType")){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};
	$data = str_replace("\\", '', $_POST['data']);
	if($data != ""){
		$json = json_decode($data);

		$json = objtoarr($json);
		$json = typeAjax($json, 0, $dopost."type");
		echo $json;
	}

//选择来源、作者
}elseif ($action == "chooseData"){
	if($type != ""){
		$m_file = HUONIAODATA."/admin/".$type.".txt";
		$list = array();
		if(filesize($m_file)>0){
			$fp = fopen($m_file,'r');
			$str = fread($fp,filesize($m_file));
			fclose($fp);
			$strs = explode(',',$str);
			foreach($strs as $str){
				$str = trim($str);
				if($str!=""){
					array_push($list, $str);
				}
			}
		}
		echo json_encode($list);
	}

//保存来源、作者
}elseif ($action == "saveChooseData"){
	if($type != ""){
		$m_file = HUONIAODATA."/admin/".$type.".txt";
		adminLog("更新".$type."信息", $type.".txt");

		$fp = fopen($m_file, "w") or die("写入文件 $m_file 失败，请检查权限！");
		fwrite($fp, $val);
		fclose($fp);
	}

//配置站内链接
}elseif ($action == "allowurl"){
	$m_file = HUONIAODATA."/admin/allowurl.txt";
	$list = array();
	if(filesize($m_file)>0){
		$fp = fopen($m_file,'r');
		$str = fread($fp,filesize($m_file));
		fclose($fp);
	}
	echo $str;

//保存站内链接
}elseif ($action == "saveAllowurl"){
	$m_file = HUONIAODATA."/admin/allowurl.txt";
	adminLog("更新站内允许链接", "allowurl.txt");

	$fp = fopen($m_file, "w") or die("写入文件 $m_file 失败，请检查权限！");
	fwrite($fp, $val);
	fclose($fp);

}else{
	echo '{"state": 200, "info": '.json_encode("操作失败，参数错误！").'}';
}



// 删除非空目录的解决方案
function removeDir($dirName)
{
    if(! is_dir($dirName))
    {
        return false;
    }
    $handle = @opendir($dirName);
    while(($file = @readdir($handle)) !== false)
    {
        if($file != '.' && $file != '..')
        {
            $dir = $dirName . '/' . $file;
            is_dir($dir) ? removeDir($dir) : unlinkFile($dir);
        }
    }
    closedir($handle);

    return rmdir($dirName) ;
}
