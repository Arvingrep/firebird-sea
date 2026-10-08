<?php
/**
 * 抓取远程图片
 * User: Jinqn
 * Date: 14-04-14
 * Time: 下午19:18
 */
set_time_limit(0);

/* 上传配置 */
$config = array(
    "savePath" => "../../..".$editor_uploadDir."/".$modelType."/editor/image/remote/".date( "Y" )."/".date( "m" )."/".date( "d" )."/",
    "maxSize" => $cfg_editorSize,
    "allowFiles" => $cfg_editorType
);
$fieldName = $_POST[$CONFIG['catcherFieldName']];

return getRemoteImage($fieldName,$config,$modelType,"../../..");