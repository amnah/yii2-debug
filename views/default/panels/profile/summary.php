<?php
/* @var $panel yii\debug\panels\ProfilingPanel */
/* @var $time string */
/* @var $memory string */
/* @var $numFiles string */
?>
<div class="yii-debug-toolbar__block">
    <a href="<?= $panel->getUrl() ?>" title="Total request processing time was <?= $time ?>"><span class="yii-debug-toolbar__label yii-debug-toolbar__label_info"><?= $time ?></span></a>
    <a href="<?= $panel->getUrl() ?>" title="Peak memory consumption"><span class="yii-debug-toolbar__label yii-debug-toolbar__label_info"><?= $memory ?></span></a>
    <a href="<?= $panel->getUrl() ?>" title="Included files"><span class="yii-debug-toolbar__label yii-debug-toolbar__label_info"><?= $numFiles ?></span></a>
</div>
