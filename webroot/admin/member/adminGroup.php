<?php
/**
 * 管理组
 *
 * @version        $Id: adminGroup.php 2013-12-29 下午12:16:18 $
 * @package        HuoNiao.Member
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("adminGroup");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/member";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录

if($action == "perm"){
	checkPurview("adminGroupPerm");
	$templates = "adminGroupPerm.html";
	if(empty($id)) die('请选择要修改的管理组！');

	//js
	$jsFile = array(
		'admin/member/adminGroupPerm.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
}else{
	$templates = "adminGroup.html";

	//js
	$jsFile = array(
		'admin/member/adminGroup.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
}

$tab = "admingroup";

//删除管理组
if($dopost == "del"){
	checkPurview("delAdminGroup");
	if($token == "") die('token传递失败！');

	if($id != ""){
		$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."` WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "results");

		if(!empty($results)){
			$memberSql = $dsql->SetQuery("DELETE FROM `#@__member` WHERE `mgroupid` = ".$id);
			$dsql->dsqlOper($memberSql, "update");

			$groupname = $results[0]['groupname'];
			$archives = $dsql->SetQuery("DELETE FROM `#@__".$tab."` WHERE `id` = ".$id);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				echo '{"state": 200, "info": '.json_encode('删除失败，请重试！').'}';
				die;
			}

			adminLog("删除管理组", $groupname);
			echo '{"state": 100, "info": '.json_encode('删除成功！').'}';
			die;
		}else{
			echo '{"state": 200, "info": '.json_encode('要删除的管理组不存在或已删除！').'}';
			die;
		}
	}
	die;

//修改名称
}else if($dopost == "updateName"){
	if(!testPurview("modifyAdminGroup")){
		die('{"state": 200, "info": '.json_encode('对不起，您无权使用此功能！').'}');
	};
	if($token == "") die('token传递失败！');
	$name = $_POST['name'];

	if($id != ""){
		$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."` WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "results");

		if(!empty($results)){

			if($name == "") die('{"state": 101, "info": '.json_encode('请输入分类名').'}');
			if($results[0]['groupname'] != $name){

				//保存到主表
				$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `groupname` = '$name' WHERE `id` = ".$id);
				$results = $dsql->dsqlOper($archives, "update");

			}else{
				//分类没有变化
				echo '{"state": 101, "info": '.json_encode('无变化！').'}';
				die;
			}

			if($results != "ok"){
				echo '{"state": 101, "info": '.json_encode('分类修改失败，请重试！').'}';
				exit();
			}else{
				adminLog("修改管理组名称", $name);
				echo '{"state": 100, "info": '.json_encode('修改成功！').'}';
				exit();
			}

		}else{
			echo '{"state": 101, "info": '.json_encode('要修改的信息不存在或已删除！').'}';
			die;
		}
	}
	die;

//新增管理组
}else if($dopost == "update"){
	if($token == "") die('token传递失败！');
	$data = str_replace("\\", '', $_POST['data']);
	if($data != ""){
		$json = json_decode($data);
		$json = objtoarr($json);

		for($i = 0; $i < count($json); $i++){
			$id = $json[$i]["id"];
			$name = $json[$i]["name"];

			//如果ID为空则向数据库插入下级分类
			if($id == "" || $id == 0){
				if(!testPurview("addAdminGroup")){
					die('{"state": 200, "info": '.json_encode('对不起，您无权使用此功能！').'}');
				};
				$archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."` (`groupname`) VALUES ('$name')");
				$dsql->dsqlOper($archives, "update");
				adminLog("添加管理组", $name);
			}
			//其它为数据库已存在的需要验证名称是否有改动，如果有改动则UPDATE
			else{
				if(!testPurview("modifyAdminGroup")){
					die('{"state": 200, "info": '.json_encode('对不起，您无权使用此功能！').'}');
				};
				$archives = $dsql->SetQuery("SELECT `groupname` FROM `#@__".$tab."` WHERE `id` = ".$id);
				$results = $dsql->dsqlOper($archives, "results");
				if(!empty($results)){
					//验证分类名
					if($results[0]["groupname"] != $name){
						$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `groupname` = '$name' WHERE `id` = ".$id);
						$results = $dsql->dsqlOper($archives, "update");
					}
					adminLog("修改管理组名称", $name);
				}
			}
		}
		echo '{"state": 100, "info": "保存成功！"}';
	}
	die;

//更新管理权限
}elseif($dopost == "updatePerm"){
	if(!testPurview("adminGroupPerm")){
		die('{"state": 200, "info": '.json_encode('对不起，您无权使用此功能！').'}');
	};
	if($token == "") die('token传递失败！');
	if($purviews == "") die('{"state": 200, "info": "请选择要设置的权限！"}');

	$archives = $dsql->SetQuery("SELECT `groupname` FROM `#@__".$tab."` WHERE `id` = ".$id);
	$results = $dsql->dsqlOper($archives, "results");

	if($results){
		$name = $results[0]['groupname'];
		$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `purviews` = '$purviews' WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "update");

		adminLog("修改管理组权限", $name);
		echo '{"state": 100, "info": "设置成功！"}';
	}
	die;
}

//验证模板文件
if(file_exists($tpl."/".$templates)){

	if($action == "perm"){

		$sql = $dsql->SetQuery("SELECT `purviews` FROM `#@__".$tab."` WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($sql, "results");

		if($results){
			$purviews  = $results[0]['purviews'];
			$purviews  = explode(",", $purviews);
		}else{
			die('要修改的管理组不存在或已删除！');
		}

		$checked = "";
		if(in_array("founder", $purviews)){
			$checked = " checked='checked'";
		}

		$html = array();
		array_push($html, '<div style="margin:0 10px 10px 18px;"><label><input type="checkbox" name="purviews" id="founder"'.$checked.' value="founder" /><span style="font-size:15px;"><strong>所有操作权限（创始人级别）</strong></span></label></div>');

		$indexChecked = "";
		if(in_array("founder", $purviews) || in_array("adminIndex", $purviews)){
			$indexChecked = " checked='checked'";
		}
		$huoniaoChecked = "";
		if(in_array("founder", $purviews) || in_array("huoniaoOfficial", $purviews)){
			$huoniaoChecked = " checked='checked'";
		}
		array_push($html, '<div style="margin:0 10px 10px 18px;" class="adminIndex clearfix"><label style="float: left; width: 160px;"><input type="checkbox" name="purviews" id="adminIndex"'.$indexChecked.' value="adminIndex" /><span style="font-size:15px;">后台首页</span></label><label style="float: left; width: 160px;"><input type="checkbox" name="purviews" id="huoniaoOfficial"'.$huoniaoChecked.' value="huoniaoOfficial" /><span style="font-size:15px;">火鸟帮助信息</span></label></div>');

		//载入全局目录（普通功能最多分五级、功能模块最多为六级）
		//  /include/class/userLogin.class.php有类似功能，如有修改此处，请一并修改   by 20180116
		require_once(HUONIAODATA."/admin/config_permission.php");
		if(!empty($menuData)){
			//一级
			foreach($menuData as $key => $menu){
				array_push($html, '<div class="thead" style="position:relative; top:0; left:0; right:0; margin:0 10px;">');
				$checked = "";
				if(in_array("founder", $purviews)){
					$checked = " checked='checked'";
				}
				array_push($html, '<label>&nbsp;&nbsp;<input type="checkbox" name="moduleAll"'.$checked.' /><span>'.$menu['menuName'].'</span></label>');
				array_push($html, '</div>');

				if($key == 2){
					$cla = " module";
				}
				array_push($html, '<div class="menu-list'.$cla.'">');

				$menuId = $menu['menuId'];

				if($menu['subMenu']){
					//二级
					foreach($menu['subMenu'] as $s_key => $subMenu){
						array_push($html, '<dl class="clearfix">');
						$checked = "";
						if(in_array("founder", $purviews)){
							$checked = " checked='checked'";
						}
						array_push($html, '<dt><label><input type="checkbox" name="checkDt"'.$checked.' /><span>'.$subMenu['menuName'].'</span></label></dt>');
						array_push($html, '<dd>');

						$menuId = $menuId ? $menuId : $subMenu['menuId'];

						if($subMenu['subMenu']){
							//三级
							foreach($subMenu['subMenu'] as $c_key => $childMenu){

								if($childMenu['subMenu']){
									array_push($html, '<dl class="clearfix">');
									$checked = "";
									if(in_array("founder", $purviews)){
										$checked = " checked='checked'";
									}
									array_push($html, '<dt><label><input type="checkbox" name="checkDt"'.$checked.' /><span>'.$childMenu['menuName'].'</span></label></dt>');
									array_push($html, '<dd>');

									//四级
									foreach($childMenu['subMenu'] as $t_key => $threeMenu){
										$html_ = array();
										if($threeMenu['menuChild']){
											array_push($html_, '<a href="javascript:;" class="more" data-id="'.$threeMenu['menuUrl'].'" title="更多设置"><s></s></a><div class="sub"><ul>');
											//五级
											foreach($threeMenu['menuChild'] as $f_key => $fourMenu){

												$html__ = array();
												if($fourMenu['menuChild']){
													array_push($html__, '<span class="more_" title="更多设置"><s></s></span><ul>');
													//六级
													foreach($fourMenu['menuChild'] as $five_key => $fiveMenu){
														$checked = "";
														if(in_array("founder", $purviews)){
															$checked = " checked='checked'";
														}elseif(in_array($fiveMenu['menuMark'], $purviews)){
															$checked = " checked='checked'";
														}
														array_push($html__, '<li><label><input type="checkbox" name="purviews"'.$checked.' value="'.$fiveMenu['menuMark'].'" /><span>'.$fiveMenu['menuName'].'</span></label></li>');
													}
													array_push($html__, '</ul>');
												}

												$checked = "";
												if(in_array("founder", $purviews)){
													$checked = " checked='checked'";
												}elseif(in_array($fourMenu['menuMark'], $purviews)){
													$checked = " checked='checked'";
												}
												array_push($html_, '<li><label><input type="checkbox" name="purviews"'.$checked.' value="'.$fourMenu['menuMark'].'" /><span>'.$fourMenu['menuName'].'</span></label>'.join("", $html__).'</li>');
											}
											array_push($html_, '</ul></div>');
										}

										$value = $threeMenu['menuUrl'];
										if(strpos($value, "/") !== false){
											$value = explode("/", $value);
											$value = $value[1];
										}
										$value = preg_replace('/\.php(\?action\=)?/', '', $value);
										$value = preg_replace('/\.php(\?type\=)?/', '', $value);
										$value = preg_replace('/\?action\=/', '', $value);
										$value = preg_replace('/\?type\=/', '', $value);
                                        $value = preg_replace('/\.php(\?tpl\=)?/', '', $value);
										$value = preg_replace('/\?tpl\=/', '', $value);
										$value = preg_replace('/\?typeid\=/', '', $value);
										$value = preg_replace('/&/', '', $value);
										$value = preg_replace('/=1/', '', $value);
										$checked = "";
										if(in_array("founder", $purviews)){
											$checked = " checked='checked'";
										}elseif(in_array($value, $purviews)){
											$checked = " checked='checked'";
										}
										array_push($html, '<span class="mlist"><label><input type="checkbox" name="purviews"'.$checked.' value="'.$value.'" /><span>'.$threeMenu['menuName'].'</span></label>'.join("", $html_).'</span>');
									}

									array_push($html, '</dd>');
									array_push($html, '</dl>');
								}else{
									$html_ = array();
									if($childMenu['menuChild']){
										array_push($html_, '<a href="javascript:;" class="more" data-id="'.$childMenu['menuUrl'].'" title="更多设置"><s></s></a><div class="sub"><ul>');
										//四级
										foreach($childMenu['menuChild'] as $f_key => $fourMenu){

											$html__ = array();
											if($fourMenu['menuChild']){
												array_push($html__, '<span class="more_" title="更多设置"><s></s></span><ul>');
												//五级
												foreach($fourMenu['menuChild'] as $five_key => $fiveMenu){
													$checked = "";
													if(in_array("founder", $purviews)){
														$checked = " checked='checked'";
													}elseif(in_array($fiveMenu['menuMark'], $purviews)){
														$checked = " checked='checked'";
													}
													array_push($html__, '<li><label><input type="checkbox" name="purviews"'.$checked.' value="'.$fiveMenu['menuMark'].'" /><span>'.$fiveMenu['menuName'].'</span></label></li>');
												}
												array_push($html__, '</ul>');
											}

											$checked = "";
											if(in_array("founder", $purviews)){
												$checked = " checked='checked'";
											}elseif(in_array($fourMenu['menuMark'], $purviews)){
												$checked = " checked='checked'";
											}
											array_push($html_, '<li><label><input type="checkbox" name="purviews"'.$checked.' value="'.$fourMenu['menuMark'].'" /><span>'.$fourMenu['menuName'].'</span></label>'.join("", $html__).'</li>');
										}
										array_push($html_, '</ul></div>');
									}

									$value = $childMenu['menuUrl'];
									if(strpos($value, "/") !== false){
										$value = explode("/", $value);
										$value = $value[1];
									}
									$value = preg_replace('/\.php(\?action\=)?/', '', $value);
									$value = preg_replace('/\.php(\?type\=)?/', '', $value);
									$value = preg_replace('/\?action\=/', '', $value);
									$value = preg_replace('/\?type\=/', '', $value);
                                    $value = preg_replace('/\.php(\?tpl\=)?/', '', $value);
                                    $value = preg_replace('/\?tpl\=/', '', $value);
									$value = preg_replace('/\?typeid\=/', '', $value);
									$value = preg_replace('/&/', '', $value);
									$value = preg_replace('/=1/', '', $value);
									$checked = "";
									if(in_array("founder", $purviews)){
										$checked = " checked='checked'";
									}elseif(in_array($value, $purviews)){
										$checked = " checked='checked'";
									}
									array_push($html, '<span class="mlist"><label><input type="checkbox" name="purviews"'.$checked.' value="'.$value.'" /><span>'.$childMenu['menuName'].'</span></label>'.join("", $html_).'</span>');
								}

							}
						}

						array_push($html, '</dd>');
						array_push($html, '</dl>');
					}
				}

				array_push($html, '</div>');
			}
			$huoniaoTag->assign('menuData', join("", $html));
		}


		$huoniaoTag->assign('id', $id);

	}else{
		$sql = $dsql->SetQuery("SELECT `id`, `groupname` FROM `#@__".$tab."`");
		$results = $dsql->dsqlOper($sql, "results");
		$groupList = array();
		if($results){
			$groupList = $results;
		}
		$huoniaoTag->assign('groupList', $groupList);
	}
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/member";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
