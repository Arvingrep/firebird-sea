<?php
/**
 * 手机底部导航
 *
 * @version        $Id: siteFooterBtn.php 2020-07-02 下午14:07:23 $
 * @package        HuoNiao.siteConfig
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("siteFooterBtn");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/job";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "jobMenu.html";


//保存
if($dopost == 'save'){


    $buttonArr = array();
    if($bottomButton){
        foreach ($bottomButton['name'] as $key => $val) {
            $name   = $val;
            $icon   = $bottomButton['icon'][$key];
            $url    = $bottomButton['url'][$key];
            $miniPath = $bottomButton['miniPath'][$key];
            $appPath = $bottomButton['appPath'][$key];
            array_push($buttonArr, array(
                'id' => $key,
                'name'   => $name,
                'icon'   => $icon,
                'url'    => $url,
                'miniPath' => $miniPath,
                'appPath' => $appPath,
            ));
        }
    }

    $customBottomButton = json_encode($buttonArr,JSON_UNESCAPED_UNICODE);
    $sql = $dsql->SetQuery("update `#@__job_option` set `value` = '$customBottomButton' where `name`='custom_menu'");
    $ret = $dsql->dsqlOper($sql, "update");
    if($ret == 'ok'){
        echo json_encode(array(
            'state' => 100,
            'info' => '配置成功！'
        ));
    }else{
        echo json_encode(array(
            'state' => 200,
            'info' => $ret
        ));
    }
    die;

//重置所有模块链接
}elseif($dopost == 'reset'){

    $sql = $dsql->SetQuery("SELECT `android_download` FROM `#@__app_config`");
    $ret = $dsql->dsqlOper($sql, "totalCount");
    if($ret){
        $sql = $dsql->SetQuery("UPDATE `#@__app_config` SET `customBottomButton` = ''");
    }else{
        $sql = $dsql->SetQuery("INSERT INTO `#@__app_config` (`customBottomButton`) VALUES ('')");
    }
    $ret = $dsql->dsqlOper($sql, "update");
    if($ret == 'ok'){
        adminLog("重置手机底部导航", $action);
        echo json_encode(array(
            'state' => 100,
            'info' => '重置成功！'
        ));
    }else{
        echo json_encode(array(
            'state' => 200,
            'info' => $ret
        ));
    }
    die;

}


//验证模板文件
if(file_exists($tpl."/".$templates)){

    //js
    $jsFile = array(
        'ui/bootstrap.min.js',
        'ui/jquery.dragsort-0.5.1.min.js',
        'publicUpload.js',
        'admin/job/jobMenu.js'
    );
    $huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

    $huoniaoTag->assign('cid', (int)$cid);

    //系统模块
    $moduleArr = array();
    $sql = $dsql->SetQuery("SELECT `title`, `subject`, `name` FROM `#@__site_module` WHERE `state` = 0 AND `type` = 0 ORDER BY `weight`, `id`");
    $result = $dsql->dsqlOper($sql, "results");
    if($result){
        foreach ($result as $key => $value) {
            if(!empty($value['name']) && $value['name'] != 'special' && $value['name'] != 'website'){
                $moduleArr[] = array(
                    "name" => $value['name'],
                    "title" => $value['subject'] ? $value['subject'] : $value['title']
                );

                //跑腿
                // if($value['name'] == 'waimai'){
                // 	$moduleArr[] = array(
                //         "name" => "paotui",
                //         "title" => "外卖跑腿"
                //     );
                // }
            }
        }
    }
    $huoniaoTag->assign('moduleArr', $moduleArr);
    $huoniaoTag->assign('action', $action ? $action : 'siteConfig');

    //配置
    $huoniaoTag->assign('config', $configArr);

    //APP模板风格
    $dir = "../../static/images/admin/platform";
    $floders = listDir($dir);
    $skins = array();
    $floders = listDir($dir . '/app');
    $skins = array();
    if (!empty($floders)) {
        $i = 0;
        foreach ($floders as $key => $floder) {
            $config = $dir . '/app/' . $floder . '/config.xml';
            if (file_exists($config)) {
                //解析xml配置文件
                $xml = new DOMDocument();
                libxml_disable_entity_loader(false);
                $xml->load($config);
                $data = $xml->getElementsByTagName('Data')->item(0);
                $tplname = $data->getElementsByTagName("tplname")->item(0)->nodeValue;
                $copyright = $data->getElementsByTagName("copyright")->item(0)->nodeValue;

                if(!strstr($floder, '__') && !strstr($floder, 'skin')) {
                    $skins[$i]['tplname'] = $tplname;
                    $skins[$i]['directory'] = $floder;
                    $skins[$i]['copyright'] = $copyright;
                    $i++;
                }

                if($floder == 'article'){
                    $skins[$i]['tplname'] = '&nbsp;&nbsp;├资讯媒体号';
                    $skins[$i]['directory'] = 'article_media';
                    $skins[$i]['copyright'] = '酷曼软件';
                    $i++;
                }

                if($floder == 'circle'){
                    $skins[$i]['tplname'] = '&nbsp;&nbsp;├圈子话题';
                    $skins[$i]['directory'] = 'circle_topic';
                    $skins[$i]['copyright'] = '酷曼软件';
                    $i++;
                }

                if($floder == 'shop'){
                    $skins[$i]['tplname'] = '&nbsp;&nbsp;├商城分类';
                    $skins[$i]['directory'] = 'shop_category';
                    $skins[$i]['copyright'] = '酷曼软件';
                    $i++;
                }
            }
        }
    }

    array_push($skins, array(
        'tplname' => '快捷发布',
        'directory' => 'fabu',
        'copyright' => '酷曼软件'
    ));

    $huoniaoTag->assign('touchTplList', $skins);

    //查询当前配置
    $customBottomButton = array();
    $sql = $dsql::SetQuery("select `value` from `#@__job_option` where `name`='custom_menu'");
    $customBottomButton = $dsql->getOne($sql);
    //主要json信息
    $huoniaoTag->assign('customBottomButton', json_decode($customBottomButton,true));


    $huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/siteConfig";  //设置编译目录
    $huoniaoTag->display($templates);
}else{
    echo $templates."模板文件未找到！";
}
