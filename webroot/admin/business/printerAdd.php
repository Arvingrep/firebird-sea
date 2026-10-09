<?php
/**
 * 管理打印机方式
 *
 * @version        $Id: siteprintment.php 2014-3-11 上午09:26:15 $
 * @package        HuoNiao.Config
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
//checkPurview("siteprintment");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/business";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录


//列表
if(empty($action)){
    $templates = "shopPrinterAdd.html";

    //js
    $jsFile = array(
        'ui/jquery.dragsort-0.5.1.min.js',
        'ui/jquery-ui-sortable.js',
        'admin/siteConfig/shopPrinterAdd.js'
    );

    //查询数据库中启用的打印机方式
    $print_list = array();
    $archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."` ORDER BY `weight`, `id`");
    $results  = $dsql->dsqlOper($archives, "results");
    foreach($results as $key => $val){
        $print_list[$val['print_code']] = $results[$key];
    }

    //取得文件中的打印机方式
    $printPath = '../../api/printment/';
    $printdir = @opendir($printPath);
    $set_modules = true;
    $printment = $installArr = $uninstallArr = array();

    while(false !== ($subdir = @readdir($printdir))){
        if(is_dir($printPath.$subdir) && $subdir != ".." && $subdir != "."){
            @include_once($printPath . $subdir. '/' . $subdir. '.php');
        }
    }
    @closedir($printdir);

    foreach ($printment as $key => $value){
        ksort($printment[$key]);
    }
    ksort($printment);

    for($i = 0; $i < count($printment); $i++){
        $code = $printment[$i]['print_code'];
        /* 如果数据库中有，取数据库中的名称和描述 */
        if(isset($print_list[$code])){

            $in = isset($installArr) ? count($installArr) : 0;

            $installArr[$in]['print_id'] = $print_list[$code]['id'];
            $installArr[$in]['print_name'] = $print_list[$code]['print_name'];
            $installArr[$in]['version']  = $printment[$i]['version'];
            $installArr[$in]['print_desc'] = $print_list[$code]['print_desc'];
            $installArr[$in]['author']   = $printment[$i]['author'];
            $installArr[$in]['website']  = $printment[$i]['website'];
            $installArr[$in]['weight']   = $print_list[$code]['weight'];
            $installArr[$in]['state']    = $print_list[$code]['state'];
        }else{

            $un = isset($uninstallArr) ? count($uninstallArr) : 0;

            $uninstallArr[$un]['print_code'] = $printment[$i]['print_code'];
            $uninstallArr[$un]['print_name'] = $printment[$i]['print_name'];
            $uninstallArr[$un]['version']  = $printment[$i]['version'];
            $uninstallArr[$un]['print_desc'] = $printment[$i]['print_desc'];
            $uninstallArr[$un]['author']   = $printment[$i]['author'];
            $uninstallArr[$un]['website']  = $printment[$i]['website'];
            $uninstallArr[$un]['state']    = 0;
        }
    }

    $installArr = array_sort($installArr, "weight");
    $huoniaoTag->assign('installArr', $installArr);
    $huoniaoTag->assign('uninstallArr', $uninstallArr);

//安装
}elseif($action == "install"){

    if($submit == "提交"){

        if(empty($code)){
            echo '{"state": 200, "info": "打印机方式参数传递失败！"}';
            exit();
        }

        if(empty($print_name)){
            echo '{"state": 200, "info": "请输入打印机方式名称！"}';
            exit();
        }

        if(empty($print_config)){
            echo '{"state": 200, "info": "请输入帐号信息！"}';
            exit();
        }


        //格式化
        $print_config = serialize(json_decode($_POST['print_config'], true));

        //保存到主表
        $archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."` (`print_code`, `print_name`, `print_desc`, `print_config`, `state`, `pubdate`) VALUES ('$code', '$print_name', '$print_desc', '$print_config', '$state', '".GetMkTime(time())."')");
        $return = $dsql->dsqlOper($archives, "update");

        if($return == "ok"){
            adminLog("安装打印机方式", $print_name);

            updateAppConfig();  //更新APP配置文件

            echo '{"state": 100, "info": '.json_encode("安装成功！").'}';
        }else{
            echo $return;
        }
        die;

    }

    $templates = "printerAdd.html";

    //js
    $jsFile = array(
        'admin/business/printerAdd.js'
    );

    if(!empty($code)){

        //取得文件中的打印机方式
        $printPath = '../../api/print/';
        $printdir = @opendir($printPath);
        $set_modules = true;
        $printment = array();
        $print_name = $print_desc = $config = $f = "";

        while(false !== ($subdir = @readdir($printdir))){
            if(is_dir($printPath.$subdir) && $subdir != ".." && $subdir != "."){
                @include_once($printPath . $subdir. '/' . $subdir. '.php');
            }
        }
        @closedir($printdir);

        foreach ($printment as $key => $value){
            ksort($printment[$key]);
        }
        ksort($printment);

        for($i = 0; $i < count($printment); $i++){
            if($code == $printment[$i]['print_code']){
                $f = "y";
                $print_name = $printment[$i]['print_name'];
                $print_desc = $printment[$i]['print_desc'];
                $config   = $printment[$i]['config'];
            }
        };

        if($f != ""){
            $huoniaoTag->assign('action', $action);
            $huoniaoTag->assign('code', $code);
            $huoniaoTag->assign('print_name', $print_name);
            $huoniaoTag->assign('print_desc', $print_desc);

            $print_config = array();
            foreach($config as $key => $val){
                $ddHtml = "";
                array_push($print_config, '<dl class="clearfix">');

                if($val['type'] == "split"){
                    array_push($print_config, '<dt style="margin-top: 15px;"><strong>'.$val['title'].'：</strong></dt>');
                    $ddHtml = "<span style='display: block; margin-top: 15px; font-size: 14px; color: #999; line-height: 30px;'>".$val['description']."</span>";
                }else{
                    array_push($print_config, '<dt><label for="'.$val['name'].'">'.$val['title'].'：</label></dt>');
                }

                if($val['type'] == "text"){
                    $ddHtml = '<input type="text" class="input-xlarge" name="'.$val['name'].'" id="'.$val['name'].'" data-regex=".*" />';
                    $ddHtml.= '<span class="input-tips"><s></s>请输入'.$val['title'].'。</span>';
                }elseif($val['type'] == "select"){
                    $ddHtml = '<span><select class="input-xlarge" name="'.$val['name'].'" id="'.$val['name'].'">';

                    foreach($val['options'] as $k => $v){
                        $ddHtml.= '<option value="'.$k.'">'.$v.'</option>';
                    }
                    $ddHtml.= '</select></span>';
                    $ddHtml.= '<span class="input-tips"><s></s>请选择'.$val['title'].'。</span>';
                }elseif($val['type'] == "textarea"){
                    $ddHtml = '<textarea class="input-xxlarge" rows="5" name="'.$val['name'].'" id="'.$val['name'].'" data-regex=".*"></textarea>';
                    $ddHtml.= '<span class="input-tips"><s></s>请输入'.$val['title'].'。</span>';
                }elseif ($val['title'] == "小票样式"){
                    $ddHtml = '<a href="javascript:;" id="printTemplateObj" class="btn btn-small">DIY自定义</a>';
                    $ddHtml .= ' <textarea id="printTemplate" name="printTemplate" style="display: none;">'.$value.'</textarea>';

                }


                array_push($print_config, '<dd>'.   $ddHtml.'</dd>');
                array_push($print_config, '</dl>');
            }

            $huoniaoTag->assign('print_config', join("", $print_config));

            //状态-单选
            $huoniaoTag->assign('stateList', array('1', '2'));
            $huoniaoTag->assign('stateName',array('启用','禁用'));
            $huoniaoTag->assign('state', 1);

        }else{
            echo "打印机方式不存在，请确认后再试！";
            die;
        }
    }

//配置
}elseif($action == "edit"){

    if(empty($id)) die('请选择要配置的打印机方式！');

    $archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."` WHERE `id` = ". $id);
    $printData = $dsql->dsqlOper($archives, "results");

    if(!$printData) die('打印机方式不存在，请先安装！');

    if($submit == "提交"){
        if(empty($print_name)){
            echo '{"state": 200, "info": "请输入打印机方式名称！"}';
            exit();
        }

        if(empty($print_config)){
            echo '{"state": 200, "info": "请输入帐号信息！"}';
            exit();
        }

        //格式化
        $print_config = serialize(json_decode($_POST['print_config'], true));

        //保存到主表
        $archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `print_name` = '$print_name', `print_desc` = '$print_desc', `print_config` = '$print_config'  WHERE `id` = ". $id);
        $return = $dsql->dsqlOper($archives, "update");

        if($return == "ok"){
            adminLog("修改打印机方式", $print_name);

            updateAppConfig();  //更新APP配置文件

            echo '{"state": 100, "info": '.json_encode("配置成功！").'}';
        }else{
            echo $return;
        }
        die;

    }

    $templates = "siteprintmentAdd.html";

    //js
    $jsFile = array(
        'admin/siteConfig/siteprintmentAdd.js'
    );

    //取得文件中的打印机方式
    $printPath = '../../api/printment/';
    $printdir = @opendir($printPath);
    $set_modules = true;
    $printment = array();
    $print_name = $print_desc = $config = $f = "";

    while(false !== ($subdir = @readdir($printdir))){
        if(is_dir($printPath.$subdir) && $subdir != ".." && $subdir != "."){
            @include_once($printPath . $subdir. '/' . $subdir. '.php');
        }
    }
    @closedir($printdir);

    foreach ($printment as $key => $value){
        ksort($printment[$key]);
    }
    ksort($printment);

    for($i = 0; $i < count($printment); $i++){
        if($printData[0]['print_code'] == $printment[$i]['print_code']){
            $f = "y";
            $config   = $printment[$i]['config'];
        }
    };

    $printConfig = unserialize($printData[0]['print_config']);

    if($f != ""){
        $huoniaoTag->assign('action', $action);
        $huoniaoTag->assign('id', $id);
        $huoniaoTag->assign('print_name', $printData[0]['print_name']);
        $huoniaoTag->assign('print_desc', $printData[0]['print_desc']);
        $huoniaoTag->assign('print_code', $printData[0]['print_code']);

        $print_config = array();
        foreach($config as $key => $val){
            $ddHtml = "";

            array_push($print_config, '<dl class="clearfix">');
            if($val['type'] == "split"){
                array_push($print_config, '<dt style="margin-top: 15px;"><strong>'.$val['title'].'：</strong></dt>');
                $ddHtml = "<span style='display: block; margin-top: 15px; font-size: 14px; color: #999; line-height: 30px;'>".$val['description']."</span>";
            }else{
                array_push($print_config, '<dt><label for="'.$val['name'].'">'.$val['title'].'：</label></dt>');
            }
            // array_push($print_config, '<dt><label for="'.$val['name'].'">'.$val['title'].'：</label></dt>');

            $value = "";
            foreach($printConfig as $k => $v){
                if($v['name'] == $val['name']){
                    $value = $v['value'];
                    break;
                }
            }

            if($val['type'] == "text"){
                $ddHtml = '<input type="text" class="input-xlarge" name="'.$val['name'].'" id="'.$val['name'].'" data-regex=".*" value="'.$value.'" />';
                $ddHtml.= '<span class="input-tips"><s></s>请输入'.$val['title'].'。</span>';
            }elseif($val['type'] == "select"){
                $ddHtml = '<span><select class="input-xlarge" name="'.$val['name'].'" id="'.$val['name'].'">';

                foreach($val['options'] as $k => $v){

                    $selected = "";
                    if($k == $value){
                        $selected = " selected";
                    }

                    $ddHtml.= '<option value="'.$k.'"'.$selected.'>'.$v.'</option>';
                }
                $ddHtml.= '</select></span>';
                $ddHtml.= '<span class="input-tips"><s></s>请选择'.$val['title'].'。</span>';
            }elseif($val['type'] == "textarea"){
                $ddHtml = '<textarea class="input-xxlarge" rows="5" name="'.$val['name'].'" id="'.$val['name'].'" data-regex=".*">'.$value.'</textarea>';
                $ddHtml.= '<span class="input-tips"><s></s>请输入'.$val['title'].'。</span>';
            }

            array_push($print_config, '<dd>'.$ddHtml.'</dd>');
            array_push($print_config, '</dl>');
        }

        $huoniaoTag->assign('print_config', join("", $print_config));

        //状态-单选
        $huoniaoTag->assign('stateList', array('1', '2'));
        $huoniaoTag->assign('stateName',array('启用','禁用'));
        $huoniaoTag->assign('state', $printData[0]['state']);

    }else{
        echo "打印机方式不存在，请确认后再试！";
        die;
    }

//排序
}elseif($action == "sort"){
    if($_POST['data'] != ""){
        $json = json_decode($_POST['data']);

        $arr = objtoarr($json);

        for($i = 0; $i < count($arr); $i++){
            $id = $arr[$i]["id"];

            $archives = $dsql->SetQuery("SELECT `weight` FROM `#@__".$tab."` WHERE `id` = ".$id);
            $results = $dsql->dsqlOper($archives, "results");
            if(!empty($results)){
                //验证排序
                if($results[0]["weight"] != $i){
                    $archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `weight` = '$i' WHERE `id` = ".$id);
                    $results = $dsql->dsqlOper($archives, "update");

                    adminLog("修改打印机方式排序", $id."=>".$i);
                }
            }
        }
        echo '{"state": 100, "info": "保存成功！"}';

    }
    die;

//卸载
}elseif($action == "uninstall"){
    if($id != ""){
        $archives = $dsql->SetQuery("DELETE FROM `#@__".$tab."` WHERE `id` = ".$id);
        $results = $dsql->dsqlOper($archives, "update");
        if($results == "ok"){
            echo '{"state": 100, "info": "保存成功！"}';
        }else{
            echo '{"state": 200, "info": "卸载失败！"}';
        }
    }
    die;
}

//验证模板文件
if(file_exists($tpl."/".$templates)){
    $huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
    $huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/siteConfig";  //设置编译目录
    $huoniaoTag->display($templates);
}else{
    echo $templates."模板文件未找到！";
}
