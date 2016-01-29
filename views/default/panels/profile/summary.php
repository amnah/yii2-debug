<?php
/* @var $panel yii\debug\panels\ProfilingPanel */
/* @var $time integer */
/* @var $memory integer */
?>
<div class="yii-debug-toolbar-block">
    <a href="<?= $panel->getUrl() ?>" title="Total request processing time was <?= $time ?>"><span class="label label-info"><?= $time ?></span></a>
    <a href="<?= $panel->getUrl() ?>" title="Peak memory consumption"><span class="label label-info"><?= $memory ?></span></a>
    <a href="<?= $panel->getUrl() ?>" title="Included files"><span class="label label-info"><?= count(get_included_files()) ?> files</span></a>
</div>
