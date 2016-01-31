<?php
/* @var $panel yii\debug\panels\ConfigPanel */
?>
<div class="yii-debug-toolbar-block">
    <a href="<?= $panel->getUrl() ?>" title="Yii Version">
        <span class="label"><?= $panel->data['application']['yii'] ?></span>
    </a>
    <a href="<?= $panel->getUrl() ?>" title="PHP: <?= $panel->data['php']['version'] ?>">
        <span class="label"><?= substr($panel->data['php']['version'], 0, 10) ?></span>
    </a>
</div>
