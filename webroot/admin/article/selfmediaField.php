<?php
/**
 * 自媒体领域
 *
 * @version        $Id: selfmediaField.php 2013-7-7 上午10:33:36 $
 * @package        HuoNiao.Article
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/article";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "selfmediaField.html";

$action = "article";

checkPurview("selfmediaField");

$title = "自媒体领域";
$dopost = $dopost ? $dopost : "";
if($dopost == "updateType"){
	if($id != ""){
		$archives = $dsql->SetQuery("SELECT * FROM `#@__".$action."_selfmedia_field` WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "results");

		if(!empty($results)){

			if($typename == "") die('{"state": 101, "info": '.json_encode('请输入分类名').'}');
			if($type == "single"){

				if($results[0]['typename'] != $typename){

					$pinyin = GetPinyin($typename);
					$py     = GetPinyin($typename, 1);

					//保存到主表
					$archives = $dsql->SetQuery("UPDATE `#@__".$action."_selfmedia_field` SET `typename` = '$typename' WHERE `id` = ".$id);
					$results = $dsql->dsqlOper($archives, "update");

				}else{
					//分类没有变化
					echo '{"state": 101, "info": '.json_encode('无变化！').'}';
					die;
				}

			}else{

				//对字符进行处理
				$typename    = cn_substrR($typename,30);

				//保存到主表
				$archives = $dsql->SetQuery("UPDATE `#@__".$action."_selfmedia_field` SET `parentid` = '$parentid', `typename` = '$typename' WHERE `id` = ".$id);
				$results = $dsql->dsqlOper($archives, "update");
			}

			if($results != "ok"){
				echo '{"state": 101, "info": '.json_encode('分类修改失败，请重试！').'}';
				exit();
			}else{
				adminLog("修改".$title."分类", $typename);


				echo '{"state": 100, "info": '.json_encode('修改成功！').'}';
				exit();
			}

		}else{
			echo '{"state": 101, "info": '.json_encode('要修改的信息不存在或已删除！').'}';
			die;
		}
	}
	die;

//删除分类
}else if($dopost == "del"){
	if($id != ""){

		$idsArr = array();

		$idexp = explode(",", $id);

		//获取所有子级
		foreach ($idexp as $k => $id) {
			$childArr = $dsql->getTypeList($id, $action."_field", 1);
			if(is_array($childArr)){
				global $data;
				$data = "";
				$idsArr = array_merge($idsArr, array_reverse(parent_foreach($childArr, "id")));
			}
			$idsArr[] = $id;
		}

		foreach ($idsArr as $kk => $id) {

			//查询此分类下所有信息ID
			$archives = $dsql->SetQuery("SELECT `id` FROM `#@__".$action."list` WHERE `media_arctype` = ".$id);
			$results = $dsql->dsqlOper($archives, "results");

			if(count($results) > 0){
				$idList = array();
				foreach($results as $key => $val){

					//删除评论
					$archives = $dsql->SetQuery("DELETE FROM `#@__".$action."common` WHERE `aid` = ".$val['id']);
					$dsql->dsqlOper($archives, "update");

					$archives = $dsql->SetQuery("SELECT * FROM `#@__".$action."list` WHERE `id` = ".$val['id']);
					$results = $dsql->dsqlOper($archives, "results");

					//删除缩略图
					delPicFile($results[0]['litpic'], "delThumb", $action);

					//删除内容图片
					$archives = $dsql->SetQuery("SELECT * FROM `#@__".$action."` WHERE `aid` = ".$val['id']);
					$results = $dsql->dsqlOper($archives, "results");

					$body = $results[0]['body'];
					if(!empty($body)){
						delEditorPic($body, $action);
					}

					//删除图集
					$archives = $dsql->SetQuery("SELECT `picPath` FROM `#@__".$action."pic` WHERE `aid` = ".$val['id']);
					$results = $dsql->dsqlOper($archives, "results");

					//删除图片文件
					if(!empty($results)){
						$atlasPic = "";
						foreach($results as $key => $value){
							$atlasPic .= $value['picPath'].",";
						}
						delPicFile(substr($atlasPic, 0, strlen($atlasPic)-1), "delAtlas", $action);
					}

					$archives = $dsql->SetQuery("DELETE FROM `#@__".$action."pic` WHERE `aid` = ".$val['id']);
					$dsql->dsqlOper($archives, "update");

					//删除表
					$archives = $dsql->SetQuery("DELETE FROM `#@__".$action."list` WHERE `id` = ".$val['id']);
					$dsql->dsqlOper($archives, "update");

				}
			}

			$archives = $dsql->SetQuery("DELETE FROM `#@__".$action."_selfmedia_field` WHERE `id` = ".$id);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				echo '{"state": 200, "info": '.json_encode('删除失败，请重试！').'}';
				die;
			}

		}

		adminLog("删除".$title."分类", join(",", $idsArr));
		echo '{"state": 100, "info": '.json_encode('删除成功！').'}';
		die;


	}
	die;
}
// $archives = $dsql->SetQuery("SELECT `id`, `username`, `nickname`, `mtype` FROM `#@__member` WHERE (`mtype` = 0 || `mtype` = 3) AND `state` = 0");
// $adminList = $dsql->dsqlOper($archives, "results");

//验证模板文件
if(file_exists($tpl."/".$templates)){


	include_once HUONIAOROOT."/api/handlers/article.class.php";
	$article = new article();
	$typeList = $article->selfmedia_type(); // 自媒体类型

	$huoniaoTag->assign('mediaTypeListArr', json_encode($typeList));

	if(empty($type)){
		$type = $typeList[0]['id'];
		$typename = $typeList[0]['typename'];
	}else{
		$typename = $typeList[array_search($type, array_column($typeList, "id"))]['typename'];
	}
	$huoniaoTag->assign('type', $type);
	$huoniaoTag->assign('typename', $typename);

	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'ui/jquery.dragsort-0.5.1.min.js',
		'ui/jquery-ui-sortable.js',
		'admin/article/selfmediaField.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$config = getAuditConfig("article");
	$huoniaoTag->assign('auditSwitch', $config['switch']);
	$huoniaoTag->assign('action', $action);
	// $huoniaoTag->assign('adminList', json_encode($adminList));
	$huoniaoTag->assign('typeListArr', json_encode($dsql->getTypeList(0, "article_selfmedia_field", false, 1, 1000)));

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/article";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
