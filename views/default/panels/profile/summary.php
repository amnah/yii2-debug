<?php
/* @var $panel yii\debug\panels\ProfilingPanel */
/* @var $time integer */
/* @var $memory integer */
/* @var $numFiles integer */
?>
<div class="yii-debug-toolbar__block">
    <a href="<?= $panel->getUrl() ?>" title="Total request processing time was <?= $time ?>"><span class="yii-debug-toolbar__label yii-debug-toolbar__label_info"><?= $time ?></span></a>
    <a href="<?= $panel->getUrl() ?>" title="Peak memory consumption"><span class="yii-debug-toolbar__label yii-debug-toolbar__label_info"><?= $memory ?></span></a>
    <a href="<?= $panel->getUrl() ?>" title="Number of included files"><span class="yii-debug-toolbar__label yii-debug-toolbar__label_info"><?= $numFiles ?></span></a>
</div>
