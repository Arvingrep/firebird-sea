<?php
/**
 * ElasticSearch 管理
 * @author zhufenghua
 * @copyright      Copyright (c) 2013 - 2022, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("elasticSearch");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/siteConfig";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "elasticSearch.html";

$esConfig_path = HUONIAOINC.'/config/esConfig.inc.php'; // es配置文件位置
if(file_exists($esConfig_path)){
    $esConfig = require($esConfig_path);
}else{
    $esConfig = array(
        'ca_path'=>HUONIAOROOT."/es_http_ca.crt"  // 证书位置，固定值
    );
}
if($esConfig['open']){
    require_once(HUONIAOROOT . "/include/class/es.class.php");
    $es = new es();
}
//配置参数
require_once(HUONIAOINC.'/config/siteConfig.inc.php');

// 查询注册模块，并封装到页面上
if(!empty($es) && $es->isOk()){

    // 取得已安装模块（包含子模块）
    $mds = $es->getInstallModule();

    $huoniaoTag->assign("modules",$mds);
    // 是否已经建立了索引（如果没有创建索引，自动创建）
    $build = $es->indexExist();
    if(!$build){
        $es->createIndex();
    }
    $huoniaoTag->assign("build",$build);
}
// action
if($action == "check"){
    // 校验ES服务器
    $esConfig = array();
    $esConfig['open'] = $open;
    $esConfig['host'] = $host;
    $esConfig['port'] = $port;
    $esConfig['username'] = $username;
    $esConfig['password'] = $password;
    $esConfig['index'] = $index;
    require_once(HUONIAOROOT . "/include/class/es.class.php");
    $es = new es($esConfig);
    if($es->isOk(array('check'=>1))){
        die(json_encode(['state'=>100,'info'=>"连接可用"]));
    }else{
        die(json_encode(['state'=>200,'info'=>"连接失败"]));
    }

}
elseif($action=="upload"){
    // 上传https证书
    try{
        move_uploaded_file($_FILES["file"]["tmp_name"],$esConfig['ca_path']);
        // 更新保存时间
        $esConfig['time'] = date("y-m-d H:i:s");
        $text='<?php return '.var_export($esConfig,true).';';
        file_put_contents($esConfig_path,$text);
        die(json_encode(['state'=>100,'info'=>'证书已上传','time'=>$esConfig['time']]));
    }catch (\Exception $e){
        die(json_encode(['state'=>200,'info'=>'证书上传出错']));
    }
}
elseif($action=="save"){
    // 更新配置文件
    $esConfig['open'] = $open;
    $esConfig['host'] = $host;
    $esConfig['port'] = $port;
    $esConfig['username'] = $username;
    $esConfig['password'] = $password;
    $esConfig['index'] = $index;
    $text='<?php return '.var_export($esConfig,true).';';
    file_put_contents($esConfig_path,$text);
    die(json_encode(['state'=>100,'info'=>"保存成功"]));
}
elseif($action=="build"){
    if(empty($es) || !$es->isOk()){
        die(json_encode(['state'=>200,'info'=>"ES未启用"]));
    }
    // 创建、重构索引
    // 先删除索引
    if($es->indexExist()){
        $es->delIndex();
    }
    // 重建索引
    $es->createIndex();
    // 更新执行时间
    foreach ($mds as $K=>$v){
        $esConfig[$v['time']] = "";
    }
    $text='<?php return '.var_export($esConfig,true).';';
    file_put_contents($esConfig_path,$text);
    $buildText = $build == false ? "索引建立成功" : "索引重建成功";
    die(json_encode(['state'=>100,'info'=>$buildText]));
}
elseif($action=="async"){
    // 同步数据（先清空该模块，再重新同步数据）
    if(empty($es) || !$es->isOk()){
        die(json_encode(['state'=>200,'info'=>"服务未启用，无法同步"]));
    }
    // 1.调用模块删除方法
    $page = (int)($page ?? 1);
    if($page==1){
        $update = $es->delByCondition(['md'=>$module,'second'=>$second]);
        if(!$update){
            die(json_encode(['state'=>200,'info'=>$operation."失败"]));
        }
    }
    // 2.调用模块同步方法
    $update = $es->asyncModule($module,$page,$second);
    if($update){
        $asyncName = 'async_'.buildEsId(['service'=>$module,'second'=>$second,'_name'=>1]);
        $esConfig[$asyncName] = date("y-m-d H:i:s");
        $text='<?php return '.var_export($esConfig,true).';';
        file_put_contents($esConfig_path,$text);
        die(json_encode(['state'=>100,'info'=>'同步成功','time'=>$esConfig[$asyncName],'pageInfo'=>$update]));
    }
    die(json_encode(['state'=>200,'info'=>$operation."失败"]));
}
elseif($action=="asyncAll"){
    // 同步所有数据
    if(empty($es) || !$es->isOk()){
        die(json_encode(['state'=>200,'info'=>"服务未启用，无法同步"]));
    }
    // 计算模块数量
    $moduleCount = count($mds);
    // 当前同步模块编号，从第一个模块开始
    $mdpage = (int)($mdpage ?? 1);
    $mdindex = $mdpage-1;
    // 模块第几页，默认
    $page = (int)($page ?? 1);
    $module = $mds[$mdindex]['module'];
    $second = $mds[$mdindex]['second'];
    // 如果是模块第一页，先第一页，直接重建索引
    if($mdpage==1 && $page==1){
        // 删除索引
        if($es->indexExist()){
            $es->delIndex();
        }
        // 创建索引
        $es->createIndex();
    }
    // 开始分页同步该模块内容
    $update = $es->asyncModule($module,$page,$second);
    if($update){
        $update['mdpage'] = $mdpage;
        $update['moduleCount'] = $moduleCount;
        $update['description'] = $mds[$mdindex]['description'];
        $asyncName = 'async_'.buildEsId(['service'=>$module,'second'=>$second,'_name'=>1]);
        $esConfig[$asyncName] = date("y-m-d H:i:s");
        $text='<?php return '.var_export($esConfig,true).';';
        file_put_contents($esConfig_path,$text);
        die(json_encode(['state'=>100,'info'=>'同步成功','time'=>$esConfig[$asyncName],'pageInfo'=>$update]));
    }
    die(json_encode(['state'=>200,'info'=>$mds[$mdindex]['description']."数据同步失败"]));

}

//验证模板文件
if(file_exists($tpl."/".$templates)){

    //css
	$cssFile = array(
        'ui/bootstrap-dialog.min.css'
    );
    $huoniaoTag->assign('cssFile', includeFile('css', $cssFile));

    //js
    $jsFile = array(
        'core/jquery-2.1.1.min.js',
        'ui/bootstrap-3.4.1.min.js',
        'ui/bootstrap-dialog.min.js',
        'admin/siteConfig/elasticSearch.js'
    );
    $huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

    //状态
    $huoniaoTag->assign('open', array('0', '1'));
    $huoniaoTag->assign('esStateNames',array('关闭','开启'));
    $huoniaoTag->assign('esStateChecked', (int)$esConfig['open']);
    $huoniaoTag->assign('esConfig', $esConfig);

    $huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/siteConfig";  //设置编译目录
    $huoniaoTag->display($templates);
}else{
    echo $templates."模板文件未找到！";
}
