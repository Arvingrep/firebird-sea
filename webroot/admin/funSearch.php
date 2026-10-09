<?php
/**
 * 目录导航
 *
 * @version        $Id: funSearch.php 2014-1-2 下午15:53:05 $
 * @package        HuoNiao.Administrator
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "." );
require_once(dirname(__FILE__)."/inc/config.inc.php");
$dsql = new dsql($dbo);
$userLogin = new userLogin($dbo);
$tpl = dirname(__FILE__)."/templates";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "funSearch.html";

//查找字符
function _strpos($string) {
	global $keyword;
	if(empty($keyword)) return true;
	if(function_exists('stripos'))  return stripos($string, $keyword);
	return strpos($string, $keyword);
}

/**
 *  加亮关键词
 *
 * @access    public
 * @param     string  $text  关键词
 * @return    string
 */
function redColorKeyword($text){
	global $keyword;
	if(empty($keyword)) return $text;
	$text = str_replace($keyword, '<font color="#3275FA">'.$keyword.'</font>', $text);
	return $text;
}

//验证模板文件
if(file_exists($tpl."/".$templates)){

	//js
	$jsFile = array(
		'admin/funSearch.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

    //接口返回数据
    $data = array();

	require_once(HUONIAODATA."/admin/config_permission.php");
	if(is_array($menuData)){
		$html = array();
		$c = 0;
		foreach($menuData as $key_1 => $val_1){

			$menuId = $val_1['menuId'];

			//二级
			if(is_array($val_1['subMenu'])){
				foreach($val_1['subMenu'] as $key_2 => $val_2){

					if($val_2['menuId'] != null){
						$menuId = $val_2['menuId'];
					}

					$html_ = array();
					//三级
					if(is_array($val_2['subMenu'])){
						foreach($val_2['subMenu'] as $key_3 => $val_3){

							//四级
							if(is_array($val_3['subMenu'])){
								$html__ = array();
								//模块
								foreach($val_3['subMenu'] as $key_4 => $val_4){

									$value = $val_4['menuUrl'];
									if(strpos($value, "/") !== false){
										$value = explode("/", $value);
										$value = $value[1];
									}

									//验证权限
									if(testPurview($value)){
										//查找字段串
										if(_strpos($val_4['menuName']) !== false || _strpos($val_4['menuInfo']) !== false){
											array_push($html__, '<dl>');

											$href = $val_4['menuUrl'];
											if(strpos($href, "/") === false){
												$href = $menuId."/".$href;
											}

											array_push($html__, '<dt><a href="'.$href.'">'.redColorKeyword($val_4['menuName']).'</a></dt>');
											array_push($html__, '<dd>'.redColorKeyword($val_4['menuInfo']).'</dd>');
											array_push($html__, '</dl>');
											$c++;

                                            array_push($data, array(
                                                'parent' => $val_3['menuName'],
                                                'name' => $val_4['menuName'],
                                                'info' => $val_4['menuInfo'],
                                                'url'  => $href,
                                                'menuId' => $menuId
                                            ));
										}
									}

								}
								if(!empty($html__)){
									array_push($html_, '<dl>');
									array_push($html_, '<dt>'.redColorKeyword($val_3['menuName']).'</dt>');
									array_push($html_, '<dd>');
									array_push($html_, join("", $html__));
									array_push($html_, '</dd></dl>');
								}

							}else{

								$value = $val_3['menuUrl'];
								if(strpos($value, "/") !== false){
									$value = explode("/", $value);
									$value = $value[1];
								}

								//验证权限
								if(testPurview($value)){

									//查找字段串
									if(_strpos($val_3['menuName']) !== false || _strpos($val_3['menuInfo']) !== false){

                                        $_menuId = $menuId == 'finance' ? 'member' : $menuId;

										//普通
										array_push($html_, '<dl>');
										array_push($html_, '<dt><a href="'.$_menuId.'/'.$val_3['menuUrl'].'">'.redColorKeyword($val_3['menuName']).'</a></dt>');
										array_push($html_, '<dd>'.redColorKeyword($val_3['menuInfo']).'</dd>');
										array_push($html_, '</dl>');
										$c++;

                                        array_push($data, array(
                                            'parent' => $val_2['menuName'],
                                            'name' => $val_3['menuName'],
                                            'info' => $val_3['menuInfo'],
                                            'url'  => $_menuId.'/'.$val_3['menuUrl'],
                                            'menuId' => $menuId
                                        ));
									}
								}

							}

						}
					}

					if(!empty($html_)){
						array_push($html, '<div class="fun-title">&nbsp;&nbsp;'.redColorKeyword($val_1['menuName']).' => '.redColorKeyword($val_2['menuName']).'</div>');
						array_push($html, '<div class="fun-list">');
						array_push($html, join("", $html_));
						array_push($html, '</div>');
					}

				}
			}

		}
	}

    //接口数据
    if($type == 'json'){

        if($keyword){
            
            if($data){

                //对结果分组，功能名称匹配的和描述匹配的分别记录
                $_data = array(
                    'name' => array(),
                    'info' => array()
                );

                //查询出所有功能匹配上的
                foreach($data as $key => $value){
                    if(_strpos($value['name']) !== false){
                        array_push($_data['name'], $value);
                        unset($data[$key]);
                    }
                }

                //剩下的都是描述匹配上的，并且只保留前5个
                $_data['info'] = array_splice($data, 0, 5);

                //取前15个功能
                $_data['name'] = array_splice($_data['name'], 0, 15);

                echo json_encode($_data);

            }else{
                echo json_encode(array('state' => 200, 'info' => '没有查询到相关功能'));
            }
            
        }else{
            echo json_encode(array('state' => 200, 'info' => '请输入要搜索的功能'));
        }
        die;
    }

	$huoniaoTag->assign('keyword', $keyword);
	$huoniaoTag->assign('count', $c);
	$huoniaoTag->assign('funSearch', !empty($html) ? join("", $html) : "<center><p style='padding-top:50px; font-size:16px; color:#f00;'>没有找到相关操作！</p></center>");
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
