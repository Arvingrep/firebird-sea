<?php
/**
 * 开发商管理
 *
 * @version        $Id: kfsList.php 2014-1-11 下午16:25:12 $
 * @package        HuoNiao.House
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$tpl  = dirname(__FILE__)."/../templates/house";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "kfsList.html";

$tab = "house_kfs";

checkPurview("kfsList");

//修改
if($dopost == "updateType"){
	if($id != ""){
		$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."` WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "results");
		
		if(!empty($results)){
			
			if($typename == "") die('{"state": 101, "info": '.json_encode('请输入分类名').'}');
				
			if($results[0]['typename'] != $typename){
				
				//保存到主表
				$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `typename` = '$typename' WHERE `id` = ".$id);
				$results = $dsql->dsqlOper($archives, "update");
				
			}else{
				//分类没有变化
				echo '{"state": 101, "info": '.json_encode('无变化！').'}';
				die;
			}
				
			
			if($results != "ok"){
				echo '{"state": 101, "info": '.json_encode('修改失败，请重试！').'}';
				exit();
			}else{
				adminLog("修改开发商信息", $typename);
				echo '{"state": 100, "info": '.json_encode('修改成功！').'}';
				exit();
			}
			
		}else{
			echo '{"state": 101, "info": '.json_encode('要修改的信息不存在或已删除！').'}';
			die;
		}
	}
	die;

//删除
}else if($dopost == "del"){
	if($id != ""){
		$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."` WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "results");
		
		if(!empty($results)){
			$title = $results[0]['typename'];
			
			//删除顾问
			$gwSql = $dsql->SetQuery("SELECT * FROM `#@__house_gw` WHERE `type` = ".$id);
			$gwResults = $dsql->dsqlOper($gwSql, "results");
			if($gwResults){
				foreach($gwResults as $val){
					
					$archives = $dsql->SetQuery("SELECT * FROM  `#@__house_loupan` WHERE `userid` = ".$val['id']);
					$results = $dsql->dsqlOper($archives, "results");
					foreach($results as $value){
						//删除楼盘缩略图
						delPicFile($value['litpic'], "delThumb", "house");
						
						//删除房源
						$archives = $dsql->SetQuery("SELECT `id` FROM `#@__house_listing` WHERE `loupan` = ".$value['id']);
						$results = $dsql->dsqlOper($archives, "results");
						foreach($results as $listing){
							$archives = $dsql->SetQuery("SELECT * FROM `#@__house_listing` WHERE `id` = ".$listing['id']);
							$results = $dsql->dsqlOper($archives, "results");
							
							//删除缩略图
							array_push($title, $results[0]['title']);
							delPicFile($results[0]['litpic'], "delThumb", "house");
							
							//删除内容图片
							$body = $results[0]['note'];
							if(!empty($body)){
								delEditorPic($body, "house");
							}
							
							//图集
							$archives = $dsql->SetQuery("SELECT `picPath` FROM `#@__house_pic` WHERE `type` = 'listing' AND `aid` = ".$listing['id']);
							$results = $dsql->dsqlOper($archives, "results");
				
							//删除图片文件
							if(!empty($results)){
								$atlasPic = "";
								foreach($results as $key => $value){
									$atlasPic .= $value['picPath'].",";
								}
								delPicFile(substr($atlasPic, 0, strlen($atlasPic)-1), "delAtlas", "house");
							}
							
							$archives = $dsql->SetQuery("DELETE FROM `#@__house_pic` WHERE `type` = 'listing' AND `aid` = ".$listing['id']);
							$results = $dsql->dsqlOper($archives, "update");
							
							//删除降价通知
							$archives = $dsql->SetQuery("DELETE FROM `#@__house_notice` WHERE `action` = 'loupan' AND `htype` = 1 AND `aid` = ".$listing['id']);
							$results = $dsql->dsqlOper($archives, "update");
							
							//删除房源表
							$archives = $dsql->SetQuery("DELETE FROM `#@__house_listing` WHERE `id` = ".$listing['id']);
							$results = $dsql->dsqlOper($archives, "update");
						}
						
						//删除户型
						$archives = $dsql->SetQuery("SELECT `id` FROM `#@__house_apartment` WHERE `action` = 'loupan' AND `loupan` = ".$value['id']);
						$results = $dsql->dsqlOper($archives, "results");
						if($results){
							foreach($each as $apartment){
								$archives = $dsql->SetQuery("SELECT * FROM `#@__house_apartment` WHERE `id` = ".$apartment['id']);
								$results = $dsql->dsqlOper($archives, "results");
								
								//删除缩略图
								array_push($title, $results[0]['title']);
								delPicFile($results[0]['litpic'], "delThumb", "house");
								
								//图集
								$archives = $dsql->SetQuery("SELECT `picPath` FROM `#@__house_pic` WHERE `type` = 'apartmentloupan' AND `aid` = ".$apartment['id']);
								$results = $dsql->dsqlOper($archives, "results");
					
								//删除图片文件
								if(!empty($results)){
									$atlasPic = "";
									foreach($results as $key => $value){
										$atlasPic .= $value['picPath'].",";
									}
									delPicFile(substr($atlasPic, 0, strlen($atlasPic)-1), "delAtlas", "house");
								}
								
								$archives = $dsql->SetQuery("DELETE FROM `#@__house_pic` WHERE `type` = 'apartmentloupan' AND `aid` = ".$apartment['id']);
								$results = $dsql->dsqlOper($archives, "update");
								
								//删除户型表
								$archives = $dsql->SetQuery("DELETE FROM `#@__house_apartment` WHERE `id` = ".$apartment['id']);
								$results = $dsql->dsqlOper($archives, "update");
							}
						}
						
						//删除相册
						$archives = $dsql->SetQuery("SELECT `id` FROM `#@__house_album` WHERE `action` = 'loupan' AND `loupan` = ".$value['id']);
						$results = $dsql->dsqlOper($archives, "results");
						if($results){
							foreach($each as $album){
								$archives = $dsql->SetQuery("SELECT * FROM `#@__house_album` WHERE `id` = ".$album['id']);
								$results = $dsql->dsqlOper($archives, "results");
								
								//删除缩略图
								array_push($title, $results[0]['title']);
								delPicFile($results[0]['litpic'], "delThumb", "house");
								
								//图集
								$archives = $dsql->SetQuery("SELECT `picPath` FROM `#@__house_pic` WHERE `type` = 'albumloupan' AND `aid` = ".$album['id']);
								$results = $dsql->dsqlOper($archives, "results");
					
								//删除图片文件
								if(!empty($results)){
									$atlasPic = "";
									foreach($results as $key => $value){
										$atlasPic .= $value['picPath'].",";
									}
									delPicFile(substr($atlasPic, 0, strlen($atlasPic)-1), "delAtlas", "house");
								}
								
								$archives = $dsql->SetQuery("DELETE FROM `#@__house_pic` WHERE `type` = 'albumloupan' AND `aid` = ".$album['id']);
								$results = $dsql->dsqlOper($archives, "update");
								
								//删除相册表
								$archives = $dsql->SetQuery("DELETE FROM `#@__house_album` WHERE `id` = ".$album['id']);
								$results = $dsql->dsqlOper($archives, "update");
							}
						}
						
						//删除评论
						$archives = $dsql->SetQuery("SELECT `id` FROM `#@__housecommon` WHERE `action` = 'loupan' AND `aid` = ".$value['id']);
						$results = $dsql->dsqlOper($archives, "results");
						if($results){
							foreach($each as $common){
								$archives = $dsql->SetQuery("DELETE FROM `#@__housecommon` WHERE `id` = ".$common['id']);
								$results = $dsql->dsqlOper($archives, "update");
							}
						}
						
						//删除资讯
						$archives = $dsql->SetQuery("SELECT `id` FROM `#@__house_loupannews` WHERE `loupan` = ".$value['id']);
						$results = $dsql->dsqlOper($archives, "results");
						if($results){
							foreach($each as $news){
								$archives = $dsql->SetQuery("SELECT * FROM `#@__house_loupannews` WHERE `id` = ".$news['id']);
								$results = $dsql->dsqlOper($archives, "results");
				
								//删除内容图片
								$body = $results[0]['body'];
								if(!empty($body)){
									delEditorPic($body, "house");
								}
								
								//删除资讯
								$archives = $dsql->SetQuery("DELETE FROM `#@__house_loupannews` WHERE `id` = ".$news['id']);
								$results = $dsql->dsqlOper($archives, "update");
							}
						}
						
						//删除降价通知
						$archives = $dsql->SetQuery("DELETE FROM `#@__house_notice` WHERE `action` = 'loupan' AND `htype` = 0 AND `aid` = ".$value['id']);
						$results = $dsql->dsqlOper($archives, "update");
						
						//删除团购报名
						$archives = $dsql->SetQuery("DELETE FROM `#@__house_loupantuan` WHERE `aid` = ".$value['id']);
						$results = $dsql->dsqlOper($archives, "update");
						
						//删除楼盘
						$archives = $dsql->SetQuery("DELETE FROM `#@__house_loupan` WHERE `id` = ".$value['id']);
						$results = $dsql->dsqlOper($archives, "update");
					}
					
					
					$archives = $dsql->SetQuery("SELECT * FROM `#@__house_gw` WHERE `id` = ".$val['id']);
					$results = $dsql->dsqlOper($archives, "results");
					
					delPicFile($results[0]['card'], "delCard", "house");
					
					$archives = $dsql->SetQuery("DELETE FROM `#@__house_gw` WHERE `id` = ".$val['id']);
					$dsql->dsqlOper($archives, "update");
				}
			}

			$archives = $dsql->SetQuery("DELETE FROM `#@__".$tab."` WHERE `id` = ".$id);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				echo '{"state": 200, "info": '.json_encode('删除失败，请重试！').'}';
				die;
			}
			
			adminLog("删除开发商", $title);
			echo '{"state": 100, "info": '.json_encode('删除成功！').'}';
			die;

		}else{
			echo '{"state": 200, "info": '.json_encode('要删除的信息不存在或已删除！').'}';
			die;
		}
	}
	die;

//更新信息分类
}else if($dopost == "typeAjax"){
	$data = str_replace("\\", '', $_POST['data']);
	if($data != ""){
		$json = json_decode($data);
		
		$json = objtoarr($json);
		$json = kfsAjax($json, $tab);
		echo $json;	
	}
	die;
}

//验证模板文件
if(file_exists($tpl."/".$templates)){
	
	//js
	$jsFile = array(
		'ui/jquery.dragsort-0.5.1.min.js',
		'ui/jquery-ui-sortable.js',
		'admin/house/kfsList.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
	
	$huoniaoTag->assign('action', $action);
	
	$kfsListArr = "";
	$sql = $dsql->SetQuery("SELECT `id`, `typename` FROM `#@__".$tab."` ORDER BY `weight`");
	$results = $dsql->dsqlOper($sql, "results");
	if($results){//如果有子类 
		$kfsListArr = $results; 
	}
	$huoniaoTag->assign('kfsListArr', json_encode($kfsListArr));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/house";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}


//更新分类
function kfsAjax($json, $tab){
	global $dsql;
	for($i = 0; $i < count($json); $i++){
		$id = $json[$i]["id"];
		$name = $json[$i]["name"];
		
		//如果ID为空则向数据库插入下级分类
		if($id == "" || $id == 0){
			$archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."` (`typename`, `weight`, `pubdate`) VALUES ('$name', '$i', '".GetMkTime(time())."')");
			$id = $dsql->dsqlOper($archives, "lastid");
			adminLog("添加开发商", $name);
		}
		//其它为数据库已存在的分类需要验证分类名是否有改动，如果有改动则UPDATE
		else{
			$archives = $dsql->SetQuery("SELECT `typename`, `weight` FROM `#@__".$tab."` WHERE `id` = ".$id);
			$results = $dsql->dsqlOper($archives, "results");
			if(!empty($results)){
				//验证分类名
				if($results[0]["typename"] != $name){
					$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `typename` = '$name' WHERE `id` = ".$id);
					$results = $dsql->dsqlOper($archives, "update");
				}
				
				//验证排序
				if($results[0]["weight"] != $i){
					$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `weight` = '$i' WHERE `id` = ".$id);
					$results = $dsql->dsqlOper($archives, "update");
				}
				
				adminLog("修改开发商", $name);
			}
		}
	}
	return '{"state": 100, "info": "保存成功！"}';
}