<?php require_once(dirname(__FILE__).'/common.inc.php');?><!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>视频预览</title>
<link rel="stylesheet" type="text/css" href="<?php echo $cfg_secureAccess.$cfg_basehost;?>/static/css/ui/plyr.css?v=<?php echo $cfg_staticVersion;?>">
<script src="<?php echo $cfg_secureAccess.$cfg_basehost;?>/static/js/ui/plyr.js?v=<?php echo $cfg_staticVersion;?>"></script>
<style>
* {padding:0; margin:0;}
html, body, #player-con {width: 100%; height: 100%;}
#player-con, video {max-height: 500px; min-height: 500px;}
</style>
</head>

<body>
<div class="prism-player" id="player-con" data-poster="" style="width:100%; height:252px">
    <video src="<?php echo getRealFilePath(htmlspecialchars(RemoveXSS(strip_tags($_GET['f']))));?>" playsinline poster=""></video>
</div>

<script type="text/javascript" src="<?php echo $cfg_secureAccess.$cfg_basehost;?>/static/js/core/jquery-1.8.3.min.js" charset="utf-8"></script>
<script>
    $(function(){

        $('#player-con, video').attr('style', 'max-height:' + window.innerHeight + 'px; min-height:' + window.innerHeight + 'px');

        $(window).resize(function(){
            $('#player-con, video').attr('style', 'max-height:' + window.innerHeight + 'px; min-height:' + window.innerHeight + 'px');
        });

        var players = Plyr.setup('video',{
            // enabled: !/Android|webOS|BlackBerry/i.test(a),
            update: !0,
            autoplay: true,
            controls: ["play-large", "play", "progress", "current-time", "mute", "volume", "download", "fullscreen"],
            fullscreen: {
                enabled: !0,
                fallback: !0,
                iosNative: !0
            }
        });



    });

</script>
</body>
</html>
